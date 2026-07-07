from rest_framework import serializers
from .models import StoreSettings


class StoreSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for the singleton StoreSettings model.

    Image fields (company_logo, favicon) are declared explicitly so that
    SerializerMethodField can build an absolute URL — relative media paths
    would break <img> tags in the React frontend.
    """
    company_logo = serializers.ImageField(required=False, allow_null=True)
    favicon      = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = StoreSettings
        fields = [
            "company_name",
            "company_description",
            "company_email",
            "company_phone",
            "company_address",
            "company_logo",
            "favicon",
            "facebook_url",
            "instagram_url",
            "linkedin_url",
            "tiktok_url",
            "telegram_url",
            "whatsapp_url",
            "youtube_url",
            "x_url",
            "footer_description",
            "copyright_text",
            "meta_title",
            "meta_description",
        ]

    def to_representation(self, instance):
        """Return absolute image URLs so the frontend can use them directly."""
        data = super().to_representation(instance)
        request = self.context.get('request')
        for field in ('company_logo', 'favicon'):
            if data.get(field) and request:
                data[field] = request.build_absolute_uri(data[field])
        return data
