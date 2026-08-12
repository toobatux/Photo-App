from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from .views import PostCreateView, PostUpdateView, FeedAPIView, ProfileAPIView
from .views import CSRFTokenView, LoginView, LogoutView, CurrentUserView, PostCreateAPIView, ProfileUpdateAPIView, PostUpdateAPIView, PostDeleteAPIView, PostLikeAPIView, PostSaveAPIView, PostListAPIView, GalleryCreateAPIView, GalleryListAPIView, GalleryDetailAPIView, GalleryUpdateAPIView, GalleryDeleteAPIView, BulkUploadAPIView, SignupView

urlpatterns = [
    path("api/csrf/", CSRFTokenView.as_view(), name="csrf"),
    path("api/signup/", SignupView.as_view(), name="signup"),
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path("api/users/me/", CurrentUserView.as_view(), name="current-user"),
    path("api/feed/", FeedAPIView.as_view(), name="feed"),
    path('api/profile/update/', ProfileUpdateAPIView.as_view(), name='profile-update'),
    path("api/profile/<str:username>/", ProfileAPIView.as_view(), name="profile-api"),
    path('api/posts/', PostListAPIView.as_view(), name='post-feed'),
    path('api/users/<str:username>/posts/', PostListAPIView.as_view(), name='user-posts'),
    path("api/posts/create/", PostCreateAPIView.as_view(), name="api-post-create"),
    path("api/posts/<int:pk>/update/", PostUpdateAPIView.as_view(), name="api-post-update"),
    path("api/posts/<int:pk>/delete/", PostDeleteAPIView.as_view(), name="api-post-delete"),
    path("api/posts/<int:pk>/like/", PostLikeAPIView.as_view(), name="api-post-like"),
    path("api/posts/<int:pk>/save/", PostSaveAPIView.as_view(), name="api-post-save"),
    path('api/galleries/', GalleryListAPIView.as_view(), name='gallery-feed'),
    path('api/users/<str:username>/galleries/', GalleryListAPIView.as_view(), name='user-galleries'),
    path('api/galleries/<int:pk>/', GalleryDetailAPIView.as_view(), name='gallery-detail'),
    path("api/gallery/create/", GalleryCreateAPIView.as_view(), name="api-gallery-create"),
    path('api/galleries/<int:pk>/update/', GalleryUpdateAPIView.as_view(), name='api-gallery-update'),
    path('api/galleries/<int:pk>/delete/', GalleryDeleteAPIView.as_view(), name='api-gallery-delete'),
    path("api/galleries/bulk-upload/", BulkUploadAPIView.as_view(), name="api-gallery-bulk-upload"),
    
    path('profile/<int:user_id>/follow_user/', views.follow_user, name='follow_user'),
    path('profile/<int:user_id>/followers/', views.follower_list, name='follower_list'),
    path('profile/<int:user_id>/following/', views.following_list, name='following_list'),
    path('settings/', views.settings_page, name='settings'),
    path('saved_posts/', views.saved_posts, name='saved_posts'),
    path('liked_posts/', views.liked_posts, name='liked_posts'),
    path('create_post/', PostCreateView.as_view(), name='create_post'), 
    path('post/<int:pk>/edit_post/', PostUpdateView.as_view(), name='edit_post'),
    path('follow/', views.follow_user_index, name='follow_user_index'),
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    # path('signup/', SignUpView.as_view(), name="signup"),
    path('explore/results/', views.search, name="search"),
    path('explore/results/profile/<int:user_id>/', views.results_profile, name="results_profile"),
    path('notifications/', views.notifications_page, name="notifications"),
]