from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from .views import SignUpView, PostCreateView, PostUpdateView, FeedAPIView, ProfileAPIView
from .views import CSRFTokenView, LoginView, LogoutView, CurrentUserView, PostCreateAPIView, ProfileUpdateAPIView

urlpatterns = [
    path("api/csrf/", CSRFTokenView.as_view(), name="csrf"),
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path("api/users/me/", CurrentUserView.as_view(), name="current-user"),
    path("api/feed/", FeedAPIView.as_view(), name="feed"),
    path('api/profile/update/', ProfileUpdateAPIView.as_view(), name='profile-update'),
    path("api/profile/<str:username>/", ProfileAPIView.as_view(), name="profile-api"),
    path("api/posts/create/", PostCreateAPIView.as_view(), name="api-post-create"),
    
    path("", views.index, name="index"),
    path('profile/<str:username>/', views.profile, name='profile'),
    path('profile/<int:user_id>/follow_user/', views.follow_user, name='follow_user'),
    path('profile/<int:user_id>/followers/', views.follower_list, name='follower_list'),
    path('profile/<int:user_id>/following/', views.following_list, name='following_list'),
    path('profile/<int:user_id>/post/<int:post_id>/', views.post_detail, name='post_detail'),
    path('profile/<int:user_id>/post/<int:post_id>/explore', views.post_detail_explore, name='post_detail_explore'),
    path('profile/<int:user_id>/post/<int:post_id>/explore/like', views.like_post_explore, name='like_post_explore'),
    path('edit_profile/', views.edit_profile, name='edit_profile'),
    path('settings/', views.settings_page, name='settings'),
    path('saved_posts/', views.saved_posts, name='saved_posts'),
    path('liked_posts/', views.liked_posts, name='liked_posts'),
    path('create_post/', PostCreateView.as_view(), name='create_post'), 
    path('post/<int:pk>/edit_post/', PostUpdateView.as_view(), name='edit_post'),
    path('profile/<int:user_id>/post/<int:post_id>/delete_post/', views.delete_post, name='delete_post'), 
    path('profile/<int:user_id>/post/<int:post_id>/like/', views.like_post, name='like_post'),
    path('profile/<int:user_id>/post/<int:post_id>/comment/<int:comment_id>/delete_comment', views.delete_comment, name='delete_comment'), 
    path('profile/<int:user_id>/post/<int:post_id>/comment/<int:comment_id>/delete_comment_explore', views.delete_comment_explore, name='delete_comment_explore'), 
    path('like/', views.like_post_index, name='like_post_index'),
    path('follow/', views.follow_user_index, name='follow_user_index'),
    path('save/', views.save_post_index, name='save_post_index'),
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('signup/', SignUpView.as_view(), name="signup"),
    path('explore/', views.explore, name="explore"),
    path('explore/results/', views.search, name="search"),
    path('explore/results/profile/<int:user_id>/', views.results_profile, name="results_profile"),
    path('notifications/', views.notifications_page, name="notifications"),
   # path('accounts/profile/', views.profile, name='accounts_profile'),
]