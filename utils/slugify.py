import random

from django.utils.text import slugify


def generate_unique_slug(
    instance, value, slug_field_name="slug", queryset=None, max_attempts=100
):
    """
    Generates a unique slug for a Django model instance using random numbers if needed.

    :param instance: The model instance being saved.
    :param value: The value to slugify (e.g., title).
    :param slug_field_name: The field name to check uniqueness for (default: 'slug').
    :param queryset: Optional queryset to check uniqueness against.
    :param max_attempts: Max number of attempts before raising an error.
    """
    base_slug = slugify(value)
    slug = base_slug

    if queryset is None:
        queryset = instance.__class__.objects.all()

    # Exclude current instance (for updates)
    if instance.pk:
        queryset = queryset.exclude(pk=instance.pk)

    for _ in range(max_attempts):
        if not queryset.filter(**{slug_field_name: slug}).exists():
            return slug
        random_number = random.randint(1000, 9999)
        slug = f"{base_slug}-{random_number}"

    raise ValueError(f"Could not generate a unique slug after {max_attempts} attempts.")
