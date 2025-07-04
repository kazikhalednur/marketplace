from rest_framework.renderers import JSONRenderer as DRFJSONRenderer
from rest_framework.response import Response as DRFResponse


class JSONRenderer(DRFJSONRenderer):
    """
    Custom JSON Renderer to enforce a standard response structure.
    """

    def render(
        self,
        data,
        accepted_media_type=None,
        renderer_context=None,
    ):
        response_data = {
            "success": renderer_context["response"].status_code < 400,
            "status_code": (
                data.pop("status_code")
                if "status_code" in data
                else renderer_context["response"].status_code
            ),
            "message": (
                data.pop("message")
                if "message" in data
                else (
                    "Request Successful"
                    if renderer_context["response"].status_code < 400
                    else "An error occurred"
                )
            ),
        }
        if renderer_context["response"].status_code < 400 and data != {}:
            response_data.update({"data": data["data"] if "data" in data else data})

        if renderer_context["response"].status_code >= 400 and data is not None:
            response_data.update({"error": data})

        return super().render(response_data, accepted_media_type, renderer_context)


def Response(
    status_code: int = 200,
    message: str = "Request successful",
    data: dict | list | None = None,
):
    """
    Utility function to generate a custom API response.

    Args:
        status_code (int): The HTTP status code.
        message (str): A message to describe the response.
        data (dict): The data payload to include in the response.

    Returns:
        Response: A Django REST Framework Response object with the custom structure.
    """
    response = {"status_code": status_code, "message": message}
    if data is not None:
        response.update({"data": data})
    return DRFResponse(response, status=status_code)


def is_schema_empty(schema, components):
    """
    Check if a schema is empty (i.e., it has no properties).
    """
    if not schema:
        return True

    # If schema is a reference, resolve it and check if it's empty
    if "$ref" in schema:
        ref_name = schema["$ref"].split("/")[-1]  # Extract schema name
        resolved_schema = components.get(ref_name, {})  # Get referenced schema
        return is_schema_empty(resolved_schema, components)

    # If schema has properties, it's not empty
    if "properties" in schema and schema["properties"]:
        return False

    # If schema has 'allOf' (merged schemas), check all sub-schemas
    if "allOf" in schema:
        return all(
            is_schema_empty(sub_schema, components) for sub_schema in schema["allOf"]
        )

    return True  # If no properties and no valid structure, it's empty


def extract_message_from_schema(schema, components):
    """
    Extracts the 'message' field from a schema and removes it.
    """
    if not schema:
        return None, schema

    # If schema is a reference, resolve it from components
    if "$ref" in schema:
        ref_path = schema["$ref"].split("/")[-1]  # Extract schema name
        resolved_schema = components.get(ref_path, {})  # Fetch referenced schema
        message, cleaned_schema = extract_message_from_schema(
            resolved_schema, components
        )
        return message, schema  # Keep original $ref intact

    # If schema is inline and has properties, extract message example
    message_example = None
    cleaned_schema = schema.copy()  # Copy schema before modification

    if "properties" in cleaned_schema:
        if "message" in cleaned_schema["properties"]:
            message_example = cleaned_schema["properties"]["message"].get("default")
            del cleaned_schema["properties"]["message"]  # ✅ Remove message

    # If schema uses allOf, check nested schemas
    if "allOf" in cleaned_schema:
        for sub_schema in cleaned_schema["allOf"]:
            message, updated_sub_schema = extract_message_from_schema(
                sub_schema, components
            )
            if message:
                message_example = message  # Use extracted message
            sub_schema.update(updated_sub_schema)

    return message_example, cleaned_schema  # Return message and updated schema


def custom_schema_postprocessing(result, generator, request, public):
    """
    Modify all API responses to follow the JSONRenderer format dynamically,
    ensuring that 'data' is only added when it has content.
    """
    components = result.get("components", {}).get(
        "schemas", {}
    )  # Get all schema definitions

    for path, methods in result["paths"].items():
        for method, details in methods.items():
            if "responses" in details:
                for status_code, response in details["responses"].items():
                    if (
                        "content" in response
                        and "application/json" in response["content"]
                    ):
                        schema = response["content"]["application/json"].get(
                            "schema", {}
                        )

                        # 🔥 Extract message and remove it from schema
                        extracted_message, cleaned_schema = extract_message_from_schema(
                            schema, components
                        )

                        if not extracted_message:
                            extracted_message = (
                                "Request Successful"
                                if int(status_code) < 400
                                else "An error occurred"
                            )

                        # Check if data schema is empty
                        data_schema = None
                        if cleaned_schema and not is_schema_empty(
                            cleaned_schema, components
                        ):
                            data_schema = (
                                cleaned_schema
                                if "$ref" in cleaned_schema
                                else {"allOf": [cleaned_schema]}
                            )

                        # Build the final response schema
                        response_schema = {
                            "type": "object",
                            "properties": {
                                "success": {
                                    "type": "boolean",
                                    "example": int(status_code) < 400,
                                },
                                "status_code": {
                                    "type": "integer",
                                    "example": int(status_code),
                                },
                                "message": {
                                    "type": "string",
                                    "example": extracted_message,
                                },  # ✅ Extracted dynamically
                            },
                        }

                        # Add 'data' only if there's meaningful content
                        if data_schema:
                            response_schema["properties"]["data"] = data_schema

                        # Add 'error' only for failed responses
                        if int(status_code) >= 400:
                            response_schema["properties"]["error"] = data_schema

                        # Update response schema
                        response["content"]["application/json"][
                            "schema"
                        ] = response_schema

    return result
