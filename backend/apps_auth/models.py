from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Creates, hashes, and saves a standard user with the given email and password.
        """
        if not email:
            raise ValueError('The Email field must be set')
        
        # Normalize the email address (lowercase the domain part)
        email = self.normalize_email(email)
        
        # Instantiate the model instance with the cleared data
        user = self.model(email=email, **extra_fields)
        
        # Securely hash the password string before database writing
        user.set_password(password)
        
        # Save the record into our active PostgreSQL database engine
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Creates and secures a administrative superuser with root dashboard privileges.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)
    

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    phone_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    addresse = models.CharField(max_length=255, blank=True)
    
    # System & Permission Matrix Flags
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Wire the user manager logic to this model instance
    objects = CustomUserManager()

    # Redefine credential mapping requirements
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Clear username dependencies; default requires password automatically

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email
    
    