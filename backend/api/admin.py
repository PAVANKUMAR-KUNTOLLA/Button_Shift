from django.contrib import admin

# Register your models here.
from django.apps import apps
from .models import WorkBoard

class WorkBoardAdmin(admin.ModelAdmin):
    # Fields to display in the admin list view
    list_display = ('name', 'description', 'created_at', 'updated_at', 'created_by')
    
    # Make the 'created_by' field read-only in the admin form
    readonly_fields = ('created_by', 'created_at', 'updated_at')

    # Customize the admin form layout
    fields = ('workboard_id', 'name', 'description', 'created_by', 'created_at', 'updated_at')

    def save_model(self, request, obj, form, change):
        # Set created_by to the current user when a new WorkBoard is created
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

# Register the model and the custom admin class
admin.site.register(WorkBoard, WorkBoardAdmin)



app_config = apps.get_app_config('api') # Replace your_app_name it is just a placeholder
models = app_config.get_models()

# print(models)
for model in models:
    
    if model == "WorkBoard":
        pass
    else:
        try:
            admin.site.register(model)
        except admin.sites.AlreadyRegistered:
            pass
    
    