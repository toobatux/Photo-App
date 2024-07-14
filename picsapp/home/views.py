from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseRedirect, JsonResponse
#from django.http import HttpResponse
from .models import Profile, Post, Comment, Notification, find_dom_color
from django.db.models import Q, Max
#from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy, reverse
from django.views import generic
from .forms import ProfileForm, CommentForm, SearchForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.edit import CreateView, UpdateView
from datetime import date
from django.contrib import messages
from django.conf import settings
import numpy as np
import cv2
import os
from django.utils import timezone

@login_required(login_url='/login/')
def index(request):
    context = {'loading': True}
    user_profile = request.user.profile
    following_profiles = user_profile.follows.all()

    today = date.today()
    following_posts = Post.objects.filter(author__in = following_profiles).order_by('-created_on')

    following_posts_lt = Post.objects.filter(author__in = following_profiles, created_on__lt = today).order_by('-created_on')
    not_following_posts = Post.objects.exclude(author__in = following_profiles).filter(public = True).order_by('-created_on')

    for post in following_posts:
        post.is_liked = post.likes.filter(id=request.user.id).exists()
        post.is_saved = request.user.profile.saved_posts.filter(id=post.id).exists()
        post.liked_users = post.likes.all()
        post.comments_list = post.comments.all()
        post.total_comments = post.comments.count()

    for post in not_following_posts:
        post.is_liked = post.likes.filter(id=request.user.id).exists()
        post.is_saved = request.user.profile.saved_posts.filter(id=post.id).exists()
        post.liked_users = post.likes.all()
        post.comments_list = post.comments.all()
        post.total_comments = post.comments.count()
    

    comment_form = CommentForm()

    context.update({
        'following_posts': following_posts,
        'not_following_posts': not_following_posts,
        'loading': False,
        'comment_form': comment_form,
    })
    return render(request, "home/index.html", context)

@login_required(login_url='/login/')
def explore(request):
    public_posts = Post.objects.filter(public=True).order_by('-created_on')

    for post in public_posts:
        if post.likes.filter(id=request.user.id).exists():
            post.is_liked = post

    context = {
        'public_posts': public_posts
    }
    return render(request, "home/explore.html", context)

@login_required(login_url="/login/")
def post_detail_explore(request, user_id, post_id):
    profile = get_object_or_404(Profile, pk=user_id)
    post = get_object_or_404(Post, pk=post_id, author=profile)
    total_likes = post.total_likes()

    liked = False
    if post.likes.filter(id=request.user.id).exists():
        liked = True

    comments = post.comments.all()

    comment_form = CommentForm()

    if request.method == 'POST':
        comment_form = CommentForm(request.POST)
        if comment_form.is_valid():
            new_comment = comment_form.save(commit=False)
            new_comment.post = post
            new_comment.author = request.user
            new_comment.save()
            return redirect(reverse('post_detail_explore', args=[user_id, post_id]))

    context = {
        'post': post, 
        'total_likes': total_likes, 
        'liked': liked,
        'comment_form': comment_form,
        'comments': comments,
    }
    return render(request, 'home/post_detail_explore.html', context)

@login_required(login_url="/login/")
def delete_comment_explore(request, user_id, post_id, comment_id):
    comment = get_object_or_404(Comment, pk=comment_id)
    post = get_object_or_404(Post, pk=post_id)
    if request.user == comment.author or post.author:
        comment.delete()
    return redirect('post_detail_explore', user_id, post_id)

@login_required(login_url="/login")
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


@login_required(login_url="/login/")
def following_list(request, user_id):
    current_user_profile = get_object_or_404(Profile, pk=user_id)
    following = current_user_profile.follows.all()
    followers = current_user_profile.followed_by.all()

    for profile in following:
        profile.is_followed = profile.followed_by.filter(id=request.user.profile.id).exists()

    for profile in followers:
        profile.is_followed = profile.followed_by.filter(id=request.user.profile.id).exists()

    return render(request, "home/following_list.html", {'profile': current_user_profile, 'following': following, 'followers': followers})

@login_required(login_url="/login/")
def follower_list(request, user_id):
    current_user_profile = get_object_or_404(Profile, pk=user_id)
    followers = current_user_profile.followed_by.all()
    following = current_user_profile.follows.all()

    for profile in followers:
        profile.is_followed = profile.followed_by.filter(id=request.user.profile.id).exists()

    for profile in following:
        profile.is_followed = profile.followed_by.filter(id=request.user.profile.id).exists()

    return render(request, "home/follower_list.html", {'profile': current_user_profile, 'followers': followers, 'following': following})

@login_required(login_url="/login/")
def edit_profile(request):
    profile = get_object_or_404(Profile, pk=request.user.profile.pk)
    is_default_picture = profile.profile_picture.name == 'profile_pictures/default_pic.jpg'

    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            if 'profile_picture' in form.changed_data:
                profile.pic_color = find_dom_color(profile.profile_picture.path)
                profile.save(update_fields=['pic_color'])
            messages.success(request, 'Profile updated successfully!')
            return redirect(reverse('profile', args=[request.user.profile.pk]))
    else:
        form = ProfileForm(instance=profile)

    return render(request, 'home/edit_profile.html', {'form': form, 'is_default_pic': is_default_picture})

class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    fields = ['image', 'caption', 'public']
    template_name = 'home/create_post.html'
    success_url = reverse_lazy('index')

    def form_valid(self, form):
        form.instance.author = self.request.user.profile
        response = super().form_valid(form)

        image_path = form.instance.image.path
        dom_color = find_dom_color(image_path)

        form.instance.pic_color = dom_color
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
    
@login_required(login_url="/login/")
def delete_post(request, user_id, post_id):
    post = get_object_or_404(Post, pk=post_id)
    if request.user == post.author.user:
        post.delete()
        messages.success(request, 'Post deleted successfully!')
        return redirect(reverse('profile', args=[user_id]))
    else:
        return redirect(reverse('index'))
    
@login_required(login_url="/login/")
def profile(request, user_id):
    profile = get_object_or_404(Profile, pk=user_id)
    post_count = profile.posts.count()
    profile_posts = Post.objects.filter(author = profile).order_by('-created_on')
    is_followed = profile.followed_by.filter(id=request.user.profile.id).exists()
    
    # prof_pic_path = os.path.join(settings.MEDIA_ROOT, str(profile.profile_picture))
    # pic_color = find_dom_color(prof_pic_path)

    context = {
        'profile': profile,
        'post_count': post_count,
        'profile_posts': profile_posts,
        'is_followed': is_followed,
        'pic_color': profile.pic_color,
    }

    return render(request, "home\\profile.html", context)

@login_required(login_url="/login/")
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
        'pic_color': profile.pic_color,
    }

    return render(request, "home/results_profile.html", context)

@login_required(login_url="/login/")
def settings_page(request):
    return render(request, "home/settings.html")

@login_required(login_url="/login/")
def saved_posts(request):
    saved_posts = request.user.profile.saved_posts.all() # fix
    return render(request, "home/saved_posts.html", {'saved_posts': saved_posts})

@login_required(login_url="/login/")
def liked_posts(request):
    liked_posts = request.user.liked_posts.all().order_by('-created_on')
    return render(request, "home/liked_posts.html", {'liked_posts': liked_posts})

@login_required(login_url="/login/")
def post_detail(request, user_id, post_id):
    profile = get_object_or_404(Profile, pk=user_id)
    post = get_object_or_404(Post, pk=post_id, author=profile)
    total_likes = post.total_likes()

    liked = False
    if post.likes.filter(id=request.user.id).exists():
        liked = True

    comments = post.comments.all()

    comment_form = CommentForm()

    if request.method == 'POST':
        comment_form = CommentForm(request.POST)
        if comment_form.is_valid():
            new_comment = comment_form.save(commit=False)
            new_comment.post = post
            new_comment.author = request.user.profile
            new_comment.save()
            Notification.objects.create(
                sender=request.user.profile,
                receiver=post.author,
                notification_type='comment',
                post=post,
                comment=new_comment
            )
            return redirect(reverse('post_detail', args=[user_id, post_id]))

    context = {
        'post': post, 
        'total_likes': total_likes, 
        'liked': liked,
        'comments': comments,
        'comment_form': comment_form,
    }

    return render(request, 'home/post_detail.html', context)

@login_required(login_url="/login/")
def delete_comment(request, user_id, post_id, comment_id):
    comment = get_object_or_404(Comment, pk=comment_id)
    post = get_object_or_404(Post, pk=post_id)
    if request.user.profile == comment.author or post.author:
        comment.delete()
        Notification.objects.filter(sender=comment.author, receiver=post.author, notification_type='comment').delete()

    return redirect('post_detail', user_id=post.author.id, post_id=post_id)

@login_required(login_url="/login/")
def like_post(request, user_id, post_id):
    post = get_object_or_404(Post, id=request.POST.get('post_id'))
    liked = False
    if post.likes.filter(id=request.user.id).exists():
        post.likes.remove(request.user)
        liked = False
    else:
        post.likes.add(request.user)
        liked = True
    
    return redirect(reverse('post_detail', args=[str(user_id), str(post_id)]))

@login_required(login_url="/login/")
def like_post_explore(request, user_id, post_id):
    post = get_object_or_404(Post, id=request.POST.get('post_id'))
    liked = False
    if post.likes.filter(id=request.user.id).exists():
        post.likes.remove(request.user)
        liked = False
    else:
        post.likes.add(request.user)
        liked = True
    
    return redirect(reverse('post_detail_explore', args=[str(user_id), str(post_id)]))
    
@login_required(login_url="/login/")
def like_post_index(request):
    if request.method == 'POST':
        post = get_object_or_404(Post, id=request.POST.get('post_id'))
        liked = False
        if post.likes.filter(id=request.user.id).exists():
            post.likes.remove(request.user)
            liked = False
            Notification.objects.filter(sender=request.user.profile, receiver=post.author, notification_type='like', post=post).delete()
        else:
            post.likes.add(request.user)
            liked = True
            Notification.objects.create(
                sender=request.user.profile,
                receiver=post.author,
                notification_type='like',
                post=post
            )

        total_likes = post.total_likes()
        return JsonResponse({'liked': liked, 'total_likes': total_likes})
    return JsonResponse({'error': 'Invalid request'}, status=400)


    #redirect_url = reverse('index') + f'?scroll_position={request.POST.get("scrollPosition")}'
    #return HttpResponseRedirect(redirect_url)
    #return redirect(reverse('index'))

@login_required(login_url="/login/")
def save_post_index(request):
    if request.method == 'POST':
        post_to_save = get_object_or_404(Post, id=request.POST.get('post_id'))
        current_user = request.user.profile
        saved = False

        if post_to_save in current_user.saved_posts.all():
            current_user.saved_posts.remove(post_to_save)
            saved = False
        else:
            current_user.saved_posts.add(post_to_save)
            saved = True
            #messages.info(request, "Post added to saved.")
        
        return JsonResponse({'saved': saved})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required(login_url="/login/")
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

@login_required(login_url="/login/")
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

@login_required(login_url="/login/")
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

class SignUpView(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

    def form_valid(self, form):
        messages.success(self.request, 'Account created successfully!')
        return super().form_valid(form)

    # def form_valid(self, form):
    #     # Save the user instance
    #     response = super().form_valid(form)
    #     # Create a profile for the user
    #     Profile.objects.create(user=self.object)
    #     return response