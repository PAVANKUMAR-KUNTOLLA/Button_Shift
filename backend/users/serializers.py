from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _
# from django.conf import settings
from rest_framework import serializers, status, response

from .models import User, BoardRole


class SignupSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()
    name = serializers.CharField()

    def validate_email(self, email):                  
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('This user already exists. Please sign in.')
        return email

    def save(self):
        name = self.validated_data['name']
        email = self.validated_data['email']
        password = self.validated_data['password']
        user = User.objects.create(name=name, email=email)
        validate_password(password)
        user.set_password(password)

        # Temp to allow all users sign up to login
        user.is_active = True
        user.user_ext.is_verified = True
        
        # Assign default role of 'viewer' to the user
        BoardRole.objects.create(user=user, role='viewer')

        user.user_ext.save()

        user.save()
        return user
    
class AuthenticationSerializer(serializers.Serializer):

    email = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs['email']
        password = attrs['password']
        if email and password:
            user = authenticate(request=self.context['request'], email=email, password=password)
            print(self.context['request'], email, password)
            print(user)
            if not user:
                msg = _('Unable to log in with provided credentials.')
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = _('Must include "username" and "password".')
            raise serializers.ValidationError(msg, code='authorization')
        attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('name', )
        # exclude = ('password', )