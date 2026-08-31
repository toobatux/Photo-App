import pytest
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient
from .models import Post

# Fixtures

@pytest.fixture
def api_client():
  """ Provides a DRF APIClient Instance """
  return APIClient()

@pytest.fixture
def user(db):
  """ Creates and returns standard test user """
  return User.objects.create_user(username="testuser", password="password123")

@pytest.fixture
def post(db, user):
  """ Creates and returns a sample post """
  return Post.objects.create(title="Hello World", author=user)


# Tests