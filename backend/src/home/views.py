from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect, JsonResponse
from .models import Profile, Post, Notification
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy, reverse
from .forms import SearchForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.edit import CreateView, UpdateView
from django.contrib import messages
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authentication import SessionAuthentication
from rest_framework.generics import ListAPIView
from .pagination import ArrayPageNumberPagination
from rest_framework.generics import CreateAPIView

from .models import Post, Gallery
from .serializers import PostSerializer, ProfileSerializer, GallerySerializer, SignUpSerializer

# Gives React initial CSRF token
@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({'csrfToken': get_token(request)})

class SignupView(CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = SignUpSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer=serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"message": "Account created successfully!", "data": serializer.data},
            status=status.HTTP_201_CREATED,
            headers=headers
        )

class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [] 

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            request.session.modified = True
            print("Generated Session Key:", request.session.session_key)
            return Response({'detail': 'Successfully logged in'}, status=status.HTTP_200_OK)
        
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'detail': 'Successfully logged out'}, status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    authentication_classes = [SessionAuthentication] 
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # --- LOG DEBUG HERE ---
        print("--- RUNNING CURRENTUSERVIEW ---")
        print(f"User Object: {request.user}")
        print(f"Auth Class: {request.successful_authenticator}")

        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, context={'request': request})
        
        data = serializer.data
        data['csrfToken'] = get_token(request)  # 👈 Pass token in response JSON
        return Response(data)

class FeedAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    # def get(self, request):
    #     user_profile = request.user.profile
    #     following_profiles = user_profile.follows.all()

    #     following_posts = Post.objects.filter(author__in=following_profiles).order_by('-created_on')
    #     not_following_posts = Post.objects.exclude(author__in=following_profiles).filter(public=True).order_by('-created_on')
        
    #     # serialize the lists
    #     following_serializer = PostSerializer(following_posts, many=True, context={'request': request})
    #     not_following_serializer = PostSerializer(not_following_posts, many=True, context={'request': request})

    #     return Response({
    #         'following_posts': following_serializer.data,
    #         'not_following_posts': not_following_serializer.data
    #     }, status=status.HTTP_200_OK)
    permission_classes = [AllowAny]

    def get(self, request):
        posts = Post.objects.filter(public=True).order_by('-created_on')
        posts_serializer = PostSerializer(posts, many=True, context={'request': request})
    
        return Response({
            'posts': posts_serializer.data
        }, status=status.HTTP_200_OK)


class ProfileAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]

    def get(self, request, username):
        profile = get_object_or_404(Profile, user__username=username)
        # post_count = profile.posts.count()
        # profile_posts = Post.objects.filter(author = profile).order_by('-created_on')

        profile_serializer = ProfileSerializer(profile, context={'request': request})
        # posts_serializer = PostSerializer(profile_posts, many=True, context={'request': request})

        context = {
            'profile': profile_serializer.data,
            # 'post_count': post_count,
            # 'profile_posts': posts_serializer.data,
        }

        return Response(context, status=status.HTTP_200_OK)

class ProfileUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            updated_profile = serializer.save()
            return Response(
                ProfileSerializer(updated_profile, context={'request': request}).data, 
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostListAPIView(ListAPIView):
    serializer_class = PostSerializer
    pagination_class = ArrayPageNumberPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        username = self.kwargs.get('username')

        if username:
            return Post.objects.filter(author__user__username=username).order_by('-created_on')
        return Post.objects.all().order_by('-created_on')
    
class PostCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            post_instance = serializer.save(author=request.user.profile)
            return Response(PostSerializer(post_instance, context={'request': request}).data, status=status.HTTP_201_CREATED)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        if (post.author.user != request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        serializer = PostSerializer(post, data=request.data, partial=True, context={'request': request})

        if serializer.is_valid():
            updated_post = serializer.save()
            return Response(
                PostSerializer(updated_post, context={'request': request}).data, 
                status=status.HTTP_200_OK
            )
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        post = get_object_or_404(Post, pk=pk)

        if (post.author.user != request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        post.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

class PostLikeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        user = request.user

        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            is_liked = False
        else:
            post.likes.add(user)
            is_liked = True
        
        return Response(
            {
                "is_liked": is_liked,
                "likes_count": post.likes.count()
            },
            status=status.HTTP_200_OK
        )

class PostSaveAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        user = request.user.profile

        if post.saved_by.filter(id=user.id).exists():
            post.saved_by.remove(user)
            is_saved = False
        else:
            post.saved_by.add(user)
            is_saved = True
        
        return Response(
            {
                "is_saved": is_saved,
            },
            status=status.HTTP_200_OK
        )


class GalleryListAPIView(ListAPIView):
    serializer_class = GallerySerializer
    pagination_class = ArrayPageNumberPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        username = self.kwargs.get('username')
        user = self.request.user

        if username:
            queryset = Gallery.objects.filter(photographer__user__username=username)
        else:
            queryset = Gallery.objects.all()

        is_owner = (
            user.is_authenticated and 
            hasattr(user, 'profile') and 
            user.username == username
        )

        if not is_owner:
            queryset = queryset.filter(is_public=True)
        
        return queryset.order_by('-created_on')

class GalleryDetailAPIView(APIView):
    def get(self, request, pk):
        gallery = get_object_or_404(Gallery, pk=pk)

        is_owner = (
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and 
            request.user.profile == gallery.photographer
        )

        client_token = request.query_params.get('token')
        has_valid_token = client_token and client_token == gallery.access_token

        if is_owner or gallery.is_public or has_valid_token:
            serializer = GallerySerializer(gallery, context={'request': request})
            return Response(serializer.data)

        return Response(
            {"detail": "Private gallery. Valid access token or owner login required."},
            status=status.HTTP_403_FORBIDDEN
        )

class GalleryCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = GallerySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            gallery_instance = serializer.save(photographer=request.user.profile)
            return Response(GallerySerializer(gallery_instance, context={'request': request}).data, status=status.HTTP_201_CREATED)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GalleryUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, pk):
        gallery = get_object_or_404(Gallery, pk=pk)

        if (gallery.photographer.user != request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        serializer = GallerySerializer(gallery, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_gallery = serializer.save()
            return Response(
                GallerySerializer(updated_gallery, context={'request': request}).data, 
                status=status.HTTP_200_OK
            )
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GalleryDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        gallery = get_object_or_404(Gallery, pk=pk)

        if (gallery.photographer.user != request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        gallery.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

class BulkUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, *args, **kwargs):
        files = request.FILES.getlist('images')
        print("Files:", len(files))

        created_posts = []
        for file in files:        
            post = Post.objects.create(
                author=request.user.profile,
                image=file,
                gallery_id=request.data.get('gallery_id')
            )
            created_posts.append(post)

        return Response({"message": f"Successfully uploaded images"})
        #{len(created_posts)} 


def search(request):
    query = ''
    results = []
    if 'query' in request.GET:
        form = SearchForm(request.GET)
        if form.is_valid():
            query = form.cleaned_data['query']
            #results = Profile.objects.filter(user__username__icontains = query)
            results = Profile.objects.filter(Q(user__username__icontains=query) | Q(name__icontains=query))
    else:
        form = SearchForm()

    for profile in results:
        profile.is_followed = profile.followed_by.filter(id=request.user.profile.id).exists()

    context = {
        'form': form,
        'query': query,
        'results': results,
    }

    return render(request, 'home/results.html', context)

def following_list(request, user_id):
    current_user_profile = get_object_or_404(Profile, pk=user_id)
    following = current_user_profile.follows.all()
    followers = current_user_profile.followed_by.all()

    for profile in following:
        profile.is_followed = profile.followed_by.filter(id=request.user.profile.id).exists()

    for profile in followers:
        profile.is_followed = profile.followed_by.filter(id=request.user.profile.id).exists()

    return render(request, "home/following_list.html", {'profile': current_user_profile, 'following': following, 'followers': followers})

def follower_list(request, user_id):
    current_user_profile = get_object_or_404(Profile, pk=user_id)
    followers = current_user_profile.followed_by.all()
    following = current_user_profile.follows.all()

    for profile in followers:
        profile.is_followed = profile.followed_by.filter(id=request.user.profile.id).exists()

    for profile in following:
        profile.is_followed = profile.followed_by.filter(id=request.user.profile.id).exists()

    return render(request, "home/follower_list.html", {'profile': current_user_profile, 'followers': followers, 'following': following})

class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    fields = ['image', 'caption', 'public']
    template_name = 'home/create_post.html'
    success_url = reverse_lazy('index')

    def form_valid(self, form):
        form.instance.author = self.request.user.profile
        response = super().form_valid(form)

        form.instance.save()

        messages.success(self.request, 'Post created successfully!')
        return response
    
class PostUpdateView(LoginRequiredMixin, UpdateView):
    model = Post
    fields = ['image', 'caption', 'public']
    template_name = 'home/edit_post.html'
    success_url = reverse_lazy('index')

    def form_valid(self, form):
        form.instance.author = self.request.user.profile
        messages.success(self.request, 'Post updated successfully!')
        return super().form_valid(form)
    
def results_profile(request, user_id):
    profile = get_object_or_404(Profile, pk=user_id)
    post_count = profile.posts.count()
    profile_posts = Post.objects.filter(author = profile).order_by('-created_on')
    is_followed = profile.followed_by.filter(id=request.user.profile.id).exists()

    context = {
        'profile': profile,
        'post_count': post_count,
        'profile_posts': profile_posts,
        'is_followed': is_followed,
    }

    return render(request, "home/results_profile.html", context)

def settings_page(request):
    return render(request, "home/settings.html")

def saved_posts(request):
    saved_posts = request.user.profile.saved_posts.all() # fix
    return render(request, "home/saved_posts.html", {'saved_posts': saved_posts})

def liked_posts(request):
    liked_posts = request.user.liked_posts.all().order_by('-created_on')
    return render(request, "home/liked_posts.html", {'liked_posts': liked_posts})

def follow_user(request, user_id):
    profile_to_follow = get_object_or_404(Profile, pk=user_id)
    current_user = request.user.profile
    follows = False

    if profile_to_follow in current_user.follows.all():
        current_user.follows.remove(profile_to_follow)
        follows = False
        Notification.objects.filter(sender=request.user.profile, receiver=profile_to_follow, notification_type='follow').delete()
    else:
        current_user.follows.add(profile_to_follow)
        follows = True
        Notification.objects.create(
            sender=request.user.profile,
            receiver= profile_to_follow,
            notification_type='follow',
        )

    redirect_url = reverse('profile', args=[user_id])
    return HttpResponseRedirect(redirect_url)
    #return redirect(reverse('index'))

def follow_user_index(request):
    if request.method == 'POST':
        profile_to_follow = get_object_or_404(Profile, id=request.POST.get('user_id'))
        current_user = request.user.profile
        follows = False

        if profile_to_follow in current_user.follows.all():
            current_user.follows.remove(profile_to_follow)
            follows = False
            Notification.objects.filter(sender=request.user.profile, receiver=profile_to_follow, notification_type='follow').delete()
        else:
            current_user.follows.add(profile_to_follow)
            follows = True
            Notification.objects.create(
                sender=request.user.profile,
                receiver= profile_to_follow,
                notification_type='follow',
            )
        
        followers_count = profile_to_follow.followers_count()

        return JsonResponse({'follows': follows, 'followers_count': followers_count})
    return JsonResponse({'error': 'Invalid request'}, status=400)

def notifications_page(request):
    notifications = Notification.objects.filter(receiver=request.user.profile).order_by('-created_on')
    today = timezone.localtime().date()

    # for notification in notifications:
    #     notification.sender_is_followed = request.user.profile.follows.filter(pk=notification.sender.pk).exists()
    #     print(notification.sender_is_followed)

    todays_notifs = notifications.filter(created_on__date=today)
    earlier_notifs = notifications.exclude(created_on__date=today)

    for notification in todays_notifs:
        notification.sender_is_followed = request.user.profile.follows.filter(pk=notification.sender.pk).exists()

    for notification in earlier_notifs:
        notification.sender_is_followed = request.user.profile.follows.filter(pk=notification.sender.pk).exists()

    notifications.update(is_read=True)
    
    context = {
        'todays_notifs': todays_notifs,
        'earlier_notifs': earlier_notifs,
    }

    return render(request, 'home/notifications.html', context)

# class SignUpView(generic.CreateView):
#     form_class = UserCreationForm
#     success_url = reverse_lazy("login")
#     template_name = "registration/signup.html"

#     def form_valid(self, form):
#         messages.success(self.request, 'Account created successfully!')
#         return super().form_valid(form)

    # def form_valid(self, form):
    #     # Save the user instance
    #     response = super().form_valid(form)
    #     # Create a profile for the user
    #     Profile.objects.create(user=self.object)
    #     return response