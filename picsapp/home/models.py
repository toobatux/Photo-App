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
    

def unique_count_app(a):
    # Reshape the image array to a 2D array where each row is a color
    colors, count = np.unique(a.reshape(-1, a.shape[-1]), axis=0, return_counts=True)
    
    # Create a mask to exclude black and white colors
    mask = (colors != [0, 0, 0]).all(axis=1) & (colors != [255, 255, 255]).all(axis=1)
    
    # Apply the mask to colors and count arrays
    colors = colors[mask]
    count = count[mask]
    
    # Find the most common color
    return colors[count.argmax()]


def is_black(color, threshold=55):
    """
    Check if a given color is considered 'black'.
    The default threshold is set to 30 for R, G, and B.
    """
    r, g, b = color
    return r < threshold and g < threshold and b < threshold

def find_dom_color(image_path):
    # Read image using OpenCV
    # img = cv2.imread(image_path)
    
    # # Convert color space from BGR to RGB
    # img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    # dom_color = unique_count_app(img_rgb)
    

    image = Image.open(image_path)
    image = image.convert('RGB')  # Ensure image is in RGB mode
    pixels = list(image.getdata())
    
    #non_black_pixels = [pixel for pixel in pixels if pixel != (0, 0, 0)]
    non_black_pixels = [color for color in pixels if not is_black(color)]
    
    # Count the occurrence of each color
    color_count = Counter(non_black_pixels)
    
    # Sort colors by frequency in descending order
    sorted_colors = color_count.most_common()
    
    # Check if there are at least two colors
    #if len(sorted_colors) < 2:
    common_color = sorted_colors[0][0]  # Return the most common color if less than 2 unique colors
    #else:
        #second_common_color = sorted_colors[1][0]  # Return the second most common color

    hex_color = '#{:02x}{:02x}{:02x}'.format(*common_color)
    
    return hex_color
    # hex_color = '#{:02x}{:02x}{:02x}'.format(dom_color[0], dom_color[1], dom_color[2])
    
    # return hex_color