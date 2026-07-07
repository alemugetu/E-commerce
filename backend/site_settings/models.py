from django.db import models
from django.core.exceptions import ValidationError


class StoreSettings(models.Model):
    # Company Information
    company_name = models.CharField(max_length=255, blank=True, null=True)
    company_description = models.TextField(blank=True, null=True)
    company_email = models.EmailField(blank=True, null=True)
    company_phone = models.CharField(max_length=50, blank=True, null=True)
    company_address = models.TextField(blank=True, null=True)
    company_logo = models.ImageField(upload_to='store/logo/', blank=True, null=True)
    favicon = models.ImageField(upload_to='store/favicon/', blank=True, null=True)

    # Social Media URLs (optional)
    facebook_url = models.URLField(blank=True, null=True)
    instagram_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    tiktok_url = models.URLField(blank=True, null=True)
    telegram_url = models.URLField(blank=True, null=True)
    whatsapp_url = models.URLField(blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True)  # new
    x_url = models.URLField(blank=True, null=True)       # X/Twitter

    # Footer
    footer_description = models.TextField(blank=True, null=True)
    copyright_text = models.CharField(max_length=255, blank=True, null=True)

    # SEO (optional future fields)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Store Settings"
        verbose_name_plural = "Store Settings"

    def save(self, *args, **kwargs):
        # Enforce singleton primary key = 1
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError("StoreSettings cannot be deleted.")

    def __str__(self):
        return self.company_name or "Store Settings"
