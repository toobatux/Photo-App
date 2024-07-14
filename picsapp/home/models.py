from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
import numpy as np
import cv2
from collections import Counter
from PIL import Image

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, max_length=12)
    follows = models.ManyToManyField(
        "self",
        related_name="followed_by",
        symmetrical=False,
        blank=True
    )
    name = models.TextField(blank=True, null=True, max_length=20)
    bio = models.TextField(blank=True, null=True, max_length=50)
    profile_picture = models.ImageField(upload_to='profile_pictures/', default='profile_pictures/default_pic.jpg', blank=True, null=True)
    saved_posts = models.ManyToManyField('Post', related_name='saved_by', blank=True)
    pic_color = models.CharField(max_length=7, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.profile_picture and (not self.pic_color or self._state.adding):
            self.pic_color = find_dom_color(self.profile_picture.path)
            super().save(update_fields=['pic_color'])

    def __str__(self):
        return self.user.username
    
    def followers_count(self):
        return self.followed_by.count()

    def following_count(self):
        return self.follows.count()

    # def is_following(self, profile):
    #     return self.follows.filter(id=profile.id).exists()

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        user_profile = Profile(user = instance)
        user_profile.save()

        # Make users follow themselves
        user_profile.follows.set([instance.profile.id])
        user_profile.save()

class Post(models.Model):
    author = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='posts')
    caption = models.TextField(blank=True, null=True)
    created_on = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='posts/', blank=True, null=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    public = models.BooleanField(default=True)
    pic_color = models.CharField(max_length=7, blank=True, null=True)


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


def is_black(color, threshold=55):
    r, g, b = color
    return r < threshold and g < threshold and b < threshold

def is_white(color, threshold=200):
    r, g, b = color
    return r > threshold and g > threshold and b > threshold

def find_dom_color(image_path):
    image = Image.open(image_path)
    image = image.convert('RGB')  # Ensure image is in RGB mode
    pixels = list(image.getdata())
    
    #non_black_pixels = [pixel for pixel in pixels if pixel != (0, 0, 0)]
    non_bw_pixels = [color for color in pixels if not is_black(color) and not is_white(color)]
    
    # Count the occurrence of each color
    color_count = Counter(non_bw_pixels)
    
    # Sort colors by frequency in descending order
    sorted_colors = color_count.most_common()
    common_color = sorted_colors[0][0]  # Return the most common color if less than 2 unique colors

    hex_color = '#{:02x}{:02x}{:02x}'.format(*common_color)
    return hex_color