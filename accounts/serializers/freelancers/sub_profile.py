from rest_framework import serializers

from ...models import Education, Experience, FreelancerSubProfile, Project

# from jobs.models import Skill


class FreelancerSubProfileProjectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Project
        fields = ["id", "title", "link", "description"]


class FreelancerSubProfileExperienceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Experience
        fields = [
            "id",
            "job_title",
            "company_name",
            "start_date",
            "end_date",
            "is_present",
            "description",
        ]

    # def validate(self, attrs):
    #     if attrs.get("is_present") and attrs.get("end_date"):
    #         raise serializers.ValidationError(
    #             {"is_present": "Cannot have an end date if currently employed."}
    #         )
    #     if not attrs.get("is_present") and not attrs.get("end_date"):
    #         raise serializers.ValidationError(
    #             {"end_date": "End date is required if not currently employed."}
    #         )
    #     if attrs.get("start_date") and attrs.get("end_date") and attrs["start_date"] > attrs["end_date"]: # noqa: E501
    #         raise serializers.ValidationError(
    #             {"end_date": "End date must be after start date."}
    #         )
    #     return super().validate(attrs)


class FreelancerSubProfileEducationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Education
        fields = [
            "id",
            "institution_name",
            "degree",
            "start_date",
            "end_date",
        ]


class FreelancerSubProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    projects = FreelancerSubProfileProjectSerializer(many=True, required=False)
    experiences = FreelancerSubProfileExperienceSerializer(many=True, required=False)
    educations = FreelancerSubProfileEducationSerializer(many=True, required=False)
    # skills = serializers.PrimaryKeyRelatedField(
    #     many=True, queryset=Skill.objects.all(), required=False
    # )

    class Meta:
        model = FreelancerSubProfile
        fields = [
            "id",
            "hours_per_week",
            "is_more_available",
            "hour_rate",
            "bio",
            "linkedin",
            "twitter",
            "github",
            "portfolio",
            # "skills",
            "projects",
            "experiences",
            "educations",
        ]

    def create(self, validated_data):
        projects_data = validated_data.pop("projects", [])
        experiences_data = validated_data.pop("experiences", [])
        educations_data = validated_data.pop("educations", [])
        # skills_ids = validated_data.pop("skills", [])

        sub_profile = FreelancerSubProfile.objects.create(**validated_data)

        for project_data in projects_data:
            Project.objects.create(sub_profile=sub_profile, **project_data)

        for experience_data in experiences_data:
            Experience.objects.create(sub_profile=sub_profile, **experience_data)

        for education_data in educations_data:
            Education.objects.create(sub_profile=sub_profile, **education_data)

        # if skills_ids:
        #     sub_profile.skills.set(skills_ids)

        return sub_profile

    def update(self, instance: FreelancerSubProfile, validated_data):
        projects_data = validated_data.pop("projects", [])
        experiences_data = validated_data.pop("experiences", [])
        educations_data = validated_data.pop("educations", [])

        # Update skills
        # skills_ids = validated_data.pop("skills", [])
        # instance.skills.set(skills_ids)

        # Update base sub-profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Projects
        existing_projects = {p.id: p for p in instance.projects.all()}
        updated_project_ids = []

        for project_data in projects_data:
            project_id = project_data.get("id")
            if project_id and project_id in existing_projects:
                project_instance = existing_projects[project_id]
                for attr, value in project_data.items():
                    setattr(project_instance, attr, value)
                project_instance.save()
                updated_project_ids.append(project_id)
            else:
                instance.projects.create(**project_data)

        # Delete projects not in update
        for existing_id in existing_projects:
            if existing_id not in updated_project_ids:
                existing_projects[existing_id].delete()

        # Experiences
        existing_experiences = {e.id: e for e in instance.experiences.all()}
        updated_experience_ids = []

        for experience_data in experiences_data:
            experience_id = experience_data.get("id")
            if experience_id and experience_id in existing_experiences:
                experience_instance = existing_experiences[experience_id]
                for attr, value in experience_data.items():
                    setattr(experience_instance, attr, value)
                experience_instance.save()
                updated_experience_ids.append(experience_id)
            else:
                instance.experiences.create(**experience_data)

        for existing_id in existing_experiences:
            if existing_id not in updated_experience_ids:
                existing_experiences[existing_id].delete()

        # Educations
        existing_educations = {e.id: e for e in instance.educations.all()}
        updated_education_ids = []

        for education_data in educations_data:
            education_id = education_data.get("id")
            if education_id and education_id in existing_educations:
                education_instance = existing_educations[education_id]
                for attr, value in education_data.items():
                    setattr(education_instance, attr, value)
                education_instance.save()
                updated_education_ids.append(education_id)
            else:
                instance.educations.create(**education_data)

        for existing_id in existing_educations:
            if existing_id not in updated_education_ids:
                existing_educations[existing_id].delete()

        return instance
