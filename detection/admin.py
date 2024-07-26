from django.contrib import admin
from . models import Profile, Warning, Score, CollectWarnings

# Register your models here.
admin.site.register(Profile)
admin.site.register(Warning)
admin.site.register(Score)
admin.site.register(CollectWarnings)


