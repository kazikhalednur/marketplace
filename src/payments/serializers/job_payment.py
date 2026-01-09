from rest_framework import serializers

from jobs.models import Job


class JobPaymentSerializer(serializers.Serializer):
    job_id = serializers.PrimaryKeyRelatedField(queryset=Job.objects.published())

    def validate_job_id(self, job: Job):
        request = self.context["request"]
        if job.created_by.id != request.user.id:
            raise serializers.ValidationError("You do not own this job.")
        return job


class JobPaymentResponseSerializer(serializers.Serializer):
    status_code = serializers.IntegerField()
    status = serializers.CharField()
    message = serializers.CharField()
    payment_url = serializers.URLField(allow_null=True)
