from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseRedirect, JsonResponse
#from django.http import HttpResponse
from .models import Profile, Post, Comment
#from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy, reverse
from django.views import generic
from .forms import ProfileForm, CommentForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.edit import CreateView, UpdateView
from datetime import date
from django.contrib import messages

@login_required(login_url='/login/')
def index(request):
    context = {'loading': True}
    user_profile = request.user.profile
    following_profiles = user_profile.follows.all()

    today = date.today()
    following_posts = Post.objects.filter(author__in = following_profiles).order_by('-created_on')

    following_posts_lt = Post.objects.filter(author__in = following_profiles, created_on__lt = today).order_by('-created_on')
    not_following_posts = Post.objects.exclude(author__in = following_profiles).order_by('-created_on')

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
    
    context.update({
        'following_posts': following_posts,
        'not_following_posts': not_following_posts,
        'loading': False,
    })
    return render(request, "home/index.html", context)

@login_required(login_url='/login/')
def explore(request):
    all_posts = Post.objects.all().order_by('-created_on')

    for post in all_posts:
        if post.likes.filter(id=request.user.id).exists():
            post.is_liked = post

    context = {
        'all_posts': all_posts
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

@login_required(login_url="/login/")
def following_list(request, user_id):
    current_user_profile = get_object_or_404(Profile, pk=user_id)
    following = current_user_profile.follows.all()
    return render(request, "home/following_list.html", {'profile': current_user_profile, 'following': following})

@login_required(login_url="/login/")
def follower_list(request, user_id):
    current_user_profile = get_object_or_404(Profile, pk=user_id)
    followers = current_user_profile.followed_by.all()
    return render(request, "home/follower_list.html", {'profile': current_user_profile, 'followers': followers})

# def toggle_login(request, pk):
#     target_profile = get_object_or_404(Profile, pk)
#     current_user = request.user.profile

#     if current_user.follows.filter(pk=target_profile.pk).exists():
#         current_user.follows.remove(target_profile)
#     else:
#         current_user.follows.add(target_profile)
    
#     return redirect('profile', pk=pk)

@login_required(login_url="/login/")
def edit_profile(request):
    profile = get_object_or_404(Profile, pk=request.user.profile.pk)
    is_default_picture = profile.profile_picture.name == 'profile_pictures/default_pic.jpg'

    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect(reverse('profile', args=[request.user.profile.pk]))
    else:
        form = ProfileForm(instance=profile)

    return render(request, 'home/edit_profile.html', {'form': form, 'is_default_pic': is_default_picture})

class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    fields = ['image', 'caption']
    template_name = 'home/create_post.html'
    success_url = reverse_lazy('index')

    def form_valid(self, form):
        form.instance.author = self.request.user.profile
        messages.success(self.request, 'Post created successfully!')
        return super().form_valid(form)
    
class PostUpdateView(LoginRequiredMixin, UpdateView):
    model = Post
    fields = ['image', 'caption']
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

    context = {
        'profile': profile,
        'post_count': post_count,
        'profile_posts': profile_posts,
        'is_followed': is_followed,
    }

    return render(request, "home/profile.html", context)

@login_required(login_url="/login/")
def settings(request):
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
            new_comment.author = request.user
            new_comment.save()
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
    if request.user == comment.author or post.author:
        comment.delete()
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
        else:
            post.likes.add(request.user)
            liked = True
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
    else:
        current_user.follows.add(profile_to_follow)
        follows = True

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
        else:
            current_user.follows.add(profile_to_follow)
            follows = True
        
        return JsonResponse({'follows': follows})
    return JsonResponse({'error': 'Invalid request'}, status=400)

class SignUpView(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

    # def form_valid(self, form):
    #     # Save the user instance
    #     response = super().form_valid(form)
    #     # Create a profile for the user
    #     Profile.objects.create(user=self.object)
    #     return response