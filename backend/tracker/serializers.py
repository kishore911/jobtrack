from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        exclude = ["owner"]
        read_only_fields = ["id", "created_at", "updated_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

