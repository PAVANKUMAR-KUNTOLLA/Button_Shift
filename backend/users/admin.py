from django.contrib import admin

# Register your models here.
from django.apps import apps


app_config = apps.get_app_config('users') # Replace your_app_name it is just a placeholder
models = app_config.get_models()

# print(models)
for model in models:
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass
    
    