import datetime

from decouple import config
from django.contrib.auth.password_validation import validate_password
from rest_framework import response, status
from rest_framework.authtoken.models import Token

from .serializers import AuthenticationSerializer, SignupSerializer, UserProfileSerializer
from .models import User,BoardRole

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import smart_str, smart_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from rest_framework.viewsets import ViewSet
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


class Signup(ViewSet):

    def create(self, request):
        data = request.data.copy()
        signup_serializer = SignupSerializer(data=data, context={'request': request})
        signup_serializer.is_valid(raise_exception=True)
        signup_serializer.save()
        return response.Response(status=status.HTTP_200_OK, data={'message': 'Success'})
    

class Login(ViewSet):
    serializer_class = AuthenticationSerializer

    def create(self, request):
        data = request.data.copy()

        user_ins = User.objects.filter(email=data['email'])
        if not user_ins:
            data = {
                "data": None,
                "status_flag": False,
                "status": 400,
                "message": 'User Account is not available'

            }
            return response.Response(status=status.HTTP_400_BAD_REQUEST, data=data)

        login_serializer = AuthenticationSerializer(data=data, context={'request': request})
        try:
            login_serializer.is_valid(raise_exception=True)
        except Exception as exception_msg:
            print(exception_msg, type(exception_msg))
            data = {
                "data": None,
                "status_flag": False,
                "status": 400,
                "message": 'Username or Password Incorrect'

            }
            return response.Response(status=status.HTTP_400_BAD_REQUEST, data=data)

        user = login_serializer.validated_data['user']
        uname = User.objects.get(email=data['email'])
        token, created = Token.objects.get_or_create(user=user)

        user_ins = Token.objects.get(key=token).user

        if not user_ins.is_active:
            data = {
                "data": {
                    'token': token.key,
                    'email': data['email'],
                    'name': uname.name,
                },
                "status_flag": False,
                "status": 401,
                "message": 'User Inactive'
            }

            return response.Response(status=status.HTTP_401_UNAUTHORIZED, data=data)

        if not user_ins.user_ext.is_verified:
            data = {
                "data": {
                    'token': token.key,
                    'email': data['email'],
                    'name': uname.name,
                },
                "status_flag": False,
                "status": 401,
                "message": 'User Not Verified'
            }

            return response.Response(status=status.HTTP_401_UNAUTHORIZED, data=data)

        data = {
                "data": {
                            'token': token.key,
                            'email': data['email'],
                            'name': uname.name,
                },
                "status_flag": True,
                "status": 200,
                "message": 'valid user'

        }
        
        return response.Response(status=status.HTTP_200_OK, data=data)


class Logout(ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def create(self, request):
        try:
            token = Token.objects.get(user=request.user)
            token_id = token.key
        except Token.DoesNotExist:
            return response.Response(status=status.HTTP_204_NO_CONTENT, data={"message": "Given token does not exist"})

        if token:
            token.delete()

        return response.Response(status=status.HTTP_200_OK, data={"message": "Logged Out"})
    
class Profile(ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        try:
            try:
                token = Token.objects.get(user=request.user)
            except Token.DoesNotExist:
                return response.Response(status=status.HTTP_404_NOT_FOUND,
                                         data={"message": "Given token does not exist"})

            user_ins = User.objects.get(email=request.user.email)
            
            user_role_ins = BoardRole.objects.filter(user=user_ins).first()

            if user_role_ins:
                user_role = user_role_ins.role
            else:
                user_role = "viewer"

            if user_ins.user_ext.is_verified:
                if user_ins.is_active:
                    profile_data = {
                        "user_basic_info": {
                            "name": user_ins.name,
                            "email": user_ins.email,
                            "role": user_role,
                            # "country": user_ins.country.name,
                            # "currency": user_ins.country.currency,
                            "is_active": user_ins.is_active,
                        }
                    }
                    status_code = status.HTTP_200_OK

                    print("Profile - ", profile_data)

                    response_text = {
                        'data': profile_data,
                        'status': True,
                        'status_code': status_code,
                        'message': "valid user"
                    }
                else:
                    status_code = status.HTTP_401_UNAUTHORIZED

                    response_text = {
                        'data': [],
                        'status': False,
                        'status_code': status_code,
                        'message': f"User is set InActive"
                    }
            else:
                status_code = status.HTTP_401_UNAUTHORIZED

                response_text = {
                    'data': [],
                    'status': False,
                    'status_code': status_code,
                    'message': f"User is not Verified"
                }

        except Exception as excepted_message:
            print("error:",excepted_message)
            raise

        return response.Response(status=status_code, data=response_text)