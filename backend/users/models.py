# Create your models here.
import ast
import datetime
import json
import uuid
from decouple import config
from django.contrib.auth.password_validation import validate_password
from rest_framework.authtoken.models import Token
from crum import get_current_user

from django.contrib.auth.models import AbstractUser
from django.db import models

from django.contrib.auth.base_user import BaseUserManager
 

class UserManager(BaseUserManager):

    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('Email for user must be set.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        validate_password(password=password)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)

# Create your models here.
def uuid_generator():
    return str(uuid.uuid4().hex)


class User(AbstractUser):
    email = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    objects = UserManager()

    # password - password for the user encrypted and saved
    # is_active - If user is non - active he cant access site
    # is_staff - Can look into django admin else no (constrained to specific Tables access)
    # is_superuser - can access any table and any user permission

    updated_at = models.DateTimeField(auto_now=True, editable=False)
    account_terminated = models.BooleanField(default=False, editable=False)

    class Meta:
        verbose_name_plural = "User"
        ordering = ('email',)
        
    def save(self, *args, **kwargs):
        super(User, self).save(*args, **kwargs)
        UserExt.objects.get_or_create(user=self)
        
class UserExt(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True,  related_name='user_ext')
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True, editable=False)
    
    def __str__(self):
        return f'{self.user.email} - {self.is_verified}'
    
class BoardRole(models.Model):
    ROLE_CHOICES = (
        ('OWNER', 'OWNER'),
        ('COLLABORATOR', 'COLLABORATOR'),
        ('VIEWER', 'VIEWER'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name='user_role_ext')  # Ensures one role per user
    role = models.CharField(max_length=20, choices=ROLE_CHOICES,default="VIEWER")

    class Meta:
        ordering = ('user',)
        # Ensures that a user can only have one BoardRole at a time
        unique_together = ('user','role')

    def __str__(self):
        return f'{self.user.email} - {self.role}'

        
