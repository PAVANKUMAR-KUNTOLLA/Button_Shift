import datetime
import uuid
from decouple import config
from crum import get_current_user

from django.contrib.auth.models import AbstractUser
from django.db import models

from users.models import User


def uuid_generator():
    return str(uuid.uuid4().hex)

class WorkBoard(models.Model): 
    workboard_id = models.CharField(max_length=55, null=True, blank=True, default=uuid_generator)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.RESTRICT, blank=True, null=True, related_name='created_workboards', editable=False)
    
    def __str__(self):
        return self.name


class Task(models.Model):
    STATUS_CHOICES = (
        ('To-Do', 'To-Do'),
        ('In-Progress', 'In-Progress'),
        ('Completed', 'Completed'),
    )
    
    task_id = models.CharField(max_length=55, null=True, blank=True, default=uuid_generator)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    workboard = models.ForeignKey(WorkBoard, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='tasks_assigned')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='To-Do')
    
    def __str__(self):
        return self.name