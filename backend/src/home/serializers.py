from rest_framework import serializers
from .models import Profile, Post, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email'] # Add any user fields you need

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ['name', 'bio', 'camera', 'location', 'user', 'profile_picture', 'following_count', 'followers_count', 'pic_color']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    profile_name = serializers.ReadOnlyField(source='author.name')
    profile_pic = serializers.ImageField(source='author.profile_picture', read_only=True)
    username = serializers.ReadOnlyField(source='author.user.username')

    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    total_comments = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'profile_name', 'username', 'profile_pic', 'image', 'caption', 'created_on', 'public',
            'is_liked', 'is_saved', 'total_comments'
        ]
        read_only_fields = ['author']
    
    def get_is_liked(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.likes.filter(id=user.id).exists()
        return False

    def get_is_saved(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.likes.filter(id=user.id).exists()
        return False
    
    def get_total_comments(self, obj):
        return obj.comments.count()