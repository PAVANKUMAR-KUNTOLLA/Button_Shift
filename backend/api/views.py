from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import WorkBoard, Task
from users.models import User,BoardRole
from .serializers import WorkBoardSerializer, TaskSerializer
from django.contrib.auth import get_user_model
from django.shortcuts import render

User = get_user_model()

# Create your views here.

def index_404(request, exception):
    print("Exception (404) - ", str(exception))
    return render(request, 'index.html')

def index(request):
    return render(request, 'index.html')

class WorkBoardInfo(viewsets.ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post']

    def list(self, request):
        try:
            # Prefetch related 'tasks' and 'assigned_to' fields
            workboards = WorkBoard.objects.prefetch_related('tasks__assigned_to').all()
            
             # Fetch all users from the User model
            all_users = list(User.objects.all().values('name', 'id'))

            response_data = {
                'workboards': [{
                    'id': workboard.workboard_id,
                    'workboard_name': workboard.name,
                    'tasks_count': workboard.tasks.count(),
                    'users_count': workboard.tasks.values_list('assigned_to', flat=True).distinct().count(),
                    'users': list(User.objects.filter(id__in=workboard.tasks.values_list('assigned_to', flat=True).distinct()).values_list('id', flat=True))
                } for workboard in workboards],
                'overall_users': all_users
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request):
        try:
            
            user_ins = User.objects.get(email=request.user.email)
            user_role_ins = BoardRole.objects.filter(user=user_ins).first()

            if user_role_ins and user_role_ins.role == 'VIEWER':
                return Response({"error": "Viewers are not allowed to create workboards"}, status=status.HTTP_403_FORBIDDEN)

            serializer = WorkBoardSerializer(data=request.data, context={'request': request})

            if serializer.is_valid():
                workboard = serializer.save()
                return Response({
                    "message": "WorkBoard and Tasks updated successfully",
                    "workboard": serializer.data
                }, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TaskInfo(viewsets.ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch']

    def list(self, request):
        try:
            workboard_id = request.query_params.get('id')
            if not workboard_id:
                return Response({"error": "Workboard id is required"}, status=status.HTTP_400_BAD_REQUEST)

            workboard = get_object_or_404(WorkBoard, workboard_id=workboard_id)
            tasks = Task.objects.filter(workboard=workboard)
            serializer = TaskSerializer(tasks, many=True)

            return Response({
                "id": workboard.workboard_id,
                "workboard_name": workboard.name,
                "workboard_description": workboard.description,
                "tasks": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    def create(self, request):
        try:
            # Get the authenticated user and their role
            user_ins = User.objects.get(email=request.user.email)
            user_role_ins = BoardRole.objects.filter(user=user_ins).first()

            # Check if the user has permission to create the task
            if user_role_ins and user_role_ins.role == 'VIEWER':
                return Response({"error": "Viewers are not allowed to create tasks"}, status=status.HTTP_403_FORBIDDEN)

            # Retrieve the task using task_id
            task_id = request.data.get('task_id')
            task_ins = Task.objects.filter(task_id=task_id)

            if task_ins.exists():
                return Response({"error": "Task already exists"}, status=status.HTTP_400_BAD_REQUEST)

            # Create a serializer instance with the request data
            serializer = TaskSerializer(data=request.data)

            if serializer.is_valid():
                # Check if 'assigned_to' is present in the request data
                assigned_to_username = request.data.get('assigned_to')
                if assigned_to_username:
                    assigned_to_ins = get_object_or_404(User, id=assigned_to_username)
                    

                workboard_id = request.data.get('workboard_id')
                if workboard_id:
                    workboard_ins = get_object_or_404(WorkBoard, workboard_id=workboard_id)


                task_ins = Task.objects.create(task_id=task_id,name=request.data['name'],description=request.data['description'],workboard=workboard_ins,assigned_to=assigned_to_ins,status=request.data["status"])
               
                task_ins.save()
                # Return a success response
                return Response({
                    "message": "Task created successfully",
                    "task": TaskSerializer(task_ins).data  # Return the created task data
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, pk=None):
        
        try:
            if not pk:
                return Response({"error": "id is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Get the authenticated user and their role
            user_ins = User.objects.get(email=request.user.email)
            user_role_ins = BoardRole.objects.filter(user=user_ins).first()

            # Check if the user has permission to update the task
            if user_role_ins and user_role_ins.role == 'VIEWER':
                return Response({"error": "Viewers are not allowed to update tasks"}, status=status.HTTP_403_FORBIDDEN)

            # Retrieve the task using task_id
            task = get_object_or_404(Task, id=pk)

            # Create a serializer instance with partial update
            serializer = TaskSerializer(task, data=request.data, partial=True)

            if serializer.is_valid():
                # Check if 'assigned_to' is present in the request data
                assigned_to_username = request.data.get('assigned_to')
                if assigned_to_username:
                    assigned_to = get_object_or_404(User, id=assigned_to_username)
                    # Assign the new user if provided
                    task.assigned_to = assigned_to
                
                # Update all other fields that were passed in the request data
                for field, value in request.data.items():
                    print(field,value)
                    if field != 'assigned_to':  # We've already handled 'assigned_to'
                        setattr(task, field, value)

                # Save the updated task
                task.save()

                # Return a success response
                return Response({
                    "message": "Task updated successfully",
                    "task": TaskSerializer(task).data  # Return the updated task data
                }, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
