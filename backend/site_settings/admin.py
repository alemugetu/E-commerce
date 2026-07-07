from django.contrib import admin
from .models import StoreSettings

@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Company Information", {
            "fields": (
                "company_name",
                "company_description",
                "company_email",
                "company_phone",
                "company_address",
                "company_logo",
                "favicon",
            ),
        }),
        ("Social Media", {
            "fields": (
                "facebook_url",
                "instagram_url",
                "linkedin_url",
                "tiktok_url",
                "telegram_url",
                "whatsapp_url",
                "youtube_url",
                "x_url",
            ),
        }),
        ("Footer", {
            "fields": (
                "footer_description",
                "copyright_text",
            ),
        }),
        ("SEO (Future)", {
            "fields": (
                "meta_title",
                "meta_description",
            ),
        }),
    )
    list_display = ("company_name", "company_email")

    def has_add_permission(self, request):
        return not StoreSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def get_actions(self, request):
        actions = super().get_actions(request)
        if "delete_selected" in actions:
            del actions["delete_selected"]
        return actions
