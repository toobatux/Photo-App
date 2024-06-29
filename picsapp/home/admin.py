from django.contrib import admin
from django.contrib.auth.models import Group, User
from .models import Profile

# Unregister Groups
admin.site.unregister(Group)

# Combine Profile and User info
class ProfileInline(admin.StackedInline):
    model = Profile


class UserAdmin(admin.ModelAdmin):
    model = User
    # Just display username field on admin page
    fields = ["username"]
    inlines = [ProfileInline]

# Unregister initial User
admin.site.unregister(User)

# Reregister User w/ only username
admin.site.register(User, UserAdmin)