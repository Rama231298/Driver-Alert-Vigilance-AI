from django.db import models
from django.contrib.auth.models import User
import uuid

# Create your models here.

class Profile(models.Model):
    user = models.OneToOneField(User, null=True, blank=True, on_delete=models.CASCADE)
    # first_name, last_name, email
    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    peer_name = models.CharField(max_length=100, null=True, blank=False)
    peer_email = models.EmailField(max_length=100, null=True, blank=False)
    created = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class Warning(models.Model):
    id = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, unique=True)
    warning = models.CharField(max_length=10, null=True, blank=True)
    flag = models.IntegerField(default=1, null=True, blank=True)
    reset_flag = models.IntegerField(default=0, null=True, blank=True)
    created = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"warning-{self.warning}-{self.created}"
    

class CollectWarnings(models.Model):
    id = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, unique=True)
    warning = models.CharField(max_length=10, null=True, blank=True)
    created = models.DateField(auto_now_add=True)




    
class Score(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    value = models.IntegerField(default=0)

