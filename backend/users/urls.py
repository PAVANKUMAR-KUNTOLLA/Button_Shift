from django.urls import path, include, re_path
from rest_framework import routers
from .views import *

router = routers.DefaultRouter()

# Channel
# router.register(r'ws/chat_channel_info', ChatChannelInfo, basename='chat_channel_info')
router.register(r'login', Login, basename="login")
router.register(r'logout', Logout, basename="logout")
router.register(r'signup', Signup, basename="sighup-access")
router.register(r'profile', Profile, basename="profile")

urlpatterns = [
    path('', include(router.urls)),
    
]