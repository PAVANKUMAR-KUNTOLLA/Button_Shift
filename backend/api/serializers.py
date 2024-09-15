from rest_framework import serializers
from .models import WorkBoard, Task
from django.contrib.auth import get_user_model  # Import get_user_model

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = Task
        fields = ['id','task_id','name', 'description', 'status', 'assigned_to']

    def to_representation(self, instance):
        """Override to return username instead of email for assigned_to field"""
        representation = super().to_representation(instance)
        if instance.assigned_to:
            representation['assigned_to'] = instance.assigned_to.id
        return representation

    def to_internal_value(self, data):
        # Ensure 'assigned_to' is treated as a string (username)
        if 'assigned_to' in data:
            assigned_to_username = data['assigned_to']
            data['assigned_to'] = assigned_to_username
        return super().to_internal_value(data)
    
class WorkBoardSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, required=False)

    class Meta:
        model = WorkBoard
        fields = ['id', 'name', 'description', 'tasks']

    def to_internal_value(self, data):
        user = self.context['request'].user
        name = data.get('name')

        try:
            # Check if the WorkBoard already exists for this user
            existing_workboard = WorkBoard.objects.get(name=name, created_by=user)
            # If it exists, we'll update it
            self.instance = existing_workboard
        except WorkBoard.DoesNotExist:
            # If it doesn't exist, we'll create a new one
            pass

        return super().to_internal_value(data)

    def create(self, validated_data):
        tasks_data = validated_data.pop('tasks', [])
        user = self.context['request'].user

        if self.instance:
            # Update existing WorkBoard
            self.instance.description = validated_data.get('description', self.instance.description)
            self.instance.save()
            workboard = self.instance
        else:
            # Create new WorkBoard
            validated_data['created_by'] = user
            workboard = WorkBoard.objects.create(**validated_data)

        self._update_or_create_tasks(workboard, tasks_data)

        return workboard

    def update(self, instance, validated_data):
        tasks_data = validated_data.pop('tasks', [])
        
        # Update WorkBoard fields
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        self._update_or_create_tasks(instance, tasks_data)

        return instance

    def _update_or_create_tasks(self, workboard, tasks_data):
        for task_data in tasks_data:
            assigned_to_data = task_data.pop('assigned_to', None)
            if isinstance(assigned_to_data, dict):
                assigned_to_username_id = assigned_to_data.get('username')
            else:
                assigned_to_username_id = assigned_to_data

            print("Assigned To Username:", assigned_to_username_id)
            
            # Debug query
            print("Querying User with Username:", assigned_to_username_id)
            assigned_to = User.objects.filter(id=assigned_to_username_id).first()
            print("Assigned To User:", assigned_to)

            Task.objects.update_or_create(
                workboard=workboard,
                name=task_data['name'],
                defaults={
                    'description': task_data.get('description', ''),
                    'assigned_to': assigned_to,
                    'status': task_data.get('status', 'TODO'),
                }
            )
