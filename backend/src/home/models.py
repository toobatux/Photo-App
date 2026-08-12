from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
import uuid

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, max_length=12)
    follows = models.ManyToManyField(
        "self",
        related_name="followed_by",
        symmetrical=False,
        blank=True
    )
    name = models.TextField(blank=True, null=True, max_length=100)
    bio = models.TextField(blank=True, null=True, max_length=150)
    camera = models.TextField(blank=True, null=True, max_length=50)
    location = models.TextField(blank=True, null=True, max_length=120)
    profile_picture = models.ImageField(upload_to='profile_pictures/', default='profile_pictures/default_pic.jpg', blank=True, null=True)
    saved_posts = models.ManyToManyField('Post', related_name='saved_by', blank=True)
    
    def __str__(self):
        return self.user.username
    
    def followers_count(self):
        return self.followed_by.count()

    def following_count(self):
        return self.follows.count()

# @receiver(post_save, sender=User)
# def create_profile(sender, instance, created, **kwargs):
#     if created:
#         user_profile, created_now = Profile.objects.get_or_create(user=instance)
        
#         if created_now:
#             user_profile.follows.add(user_profile)

class Gallery(models.Model):
    title = models.CharField(blank=True, null=True, max_length=150)
    photographer = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='galleries')
    access_token = models.CharField(max_length=64, default=uuid.uuid4, unique=True, editable=False); 
    is_public = models.BooleanField(default=False)
    created_on = models.DateTimeField(auto_now_add=True)

class Post(models.Model):
    author = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='posts')
    gallery = models.ForeignKey(Gallery, on_delete=models.CASCADE, related_name='photos', null=True, blank=True)
    caption = models.TextField(blank=True, null=True)
    public = models.BooleanField(default=True)
    image = models.ImageField(upload_to='posts/', blank=True, null=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post by { self.author.user.username } on { self.created_on }"
    
    def total_likes(self):
        return self.likes.count()
    
class Comment(models.Model):
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(Profile, on_delete=models.CASCADE)
    text = models.TextField()
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text
    
class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('like', 'liked'),
        ('follow', 'followed'),
        ('comment', 'commented on'),
    )

    sender = models.ForeignKey(Profile, related_name='sent_notifications', on_delete=models.CASCADE)
    receiver = models.ForeignKey(Profile, related_name='received_notifications', on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES, null=True, blank=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)