from django import forms
from .models import Profile, Post, Comment

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['profile_picture', 'bio']

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['image', 'caption', 'public']

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['text']