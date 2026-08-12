from rest_framework import serializers
from .models import Profile, Post, User, Gallery

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ['name', 'bio', 'camera', 'location', 'user', 'profile_picture', 'following_count', 'followers_count']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    profile_name = serializers.ReadOnlyField(source='author.name')
    profile_pic = serializers.ImageField(source='author.profile_picture', read_only=True)
    username = serializers.ReadOnlyField(source='author.user.username')

    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    total_likes = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'profile_name', 'username', 'profile_pic', 'image', 'caption', 'created_on', 'public',
            'is_liked', 'is_saved', 'total_likes'
        ]
        read_only_fields = ['author']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')

        if request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_is_saved(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.saved_by.filter(id=user.id).exists()
        return False
    
    def get_total_likes(self, obj):
        return obj.likes.count()

class GalleryPostSerializer(serializers.ModelSerializer):
    src = serializers.ImageField(source='image', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'src']

class GallerySerializer(serializers.ModelSerializer):
    photographer = serializers.ReadOnlyField(source='photographer.name')
    photographer_avatar = serializers.ImageField(source='photographer.profile_picture', read_only=True)
    username = serializers.ReadOnlyField(source='photographer.user.username')
    total_photos = serializers.SerializerMethodField()
    photos = GalleryPostSerializer(many=True, read_only=True)

    class Meta:
        model = Gallery
        fields = [
            'id', 'photographer', 'username', 'photographer_avatar', 'title', 'created_on', 'is_public', 'photos', 'total_photos'
        ]
        read_only_fields = ['photographer']

    def get_total_photos(self, obj):
            return obj.photos.count()