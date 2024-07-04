from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, max_length=12)
    follows = models.ManyToManyField(
        "self",
        related_name="followed_by",
        symmetrical=False,
        blank=True
    )
    bio = models.TextField(blank=True, null=True, max_length=50)
    profile_picture = models.ImageField(upload_to='profile_pictures/', default='profile_pictures/default_pic.jpg', blank=True, null=True)
    saved_posts = models.ManyToManyField('Post', related_name='saved_by', blank=True)
    
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

    def __str__(self):
        return f"Post by { self.author.user.username } on { self.created_on }"
    
    def total_likes(self):
        return self.likes.count()
    
class Comment(models.Model):
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text
    