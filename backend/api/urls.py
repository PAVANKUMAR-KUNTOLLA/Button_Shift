from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkBoardInfo, TaskInfo

router = DefaultRouter()
router.register(r'workboards', WorkBoardInfo, basename='workboard')
router.register(r'tasks', TaskInfo, basename='task')

urlpatterns = [
    path('', include(router.urls)),
]