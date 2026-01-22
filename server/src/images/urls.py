from django.urls import path

from .views import ImageDeleteView, ImageUploadView

urlpatterns = [
    path("upload/", ImageUploadView.as_view(), name="image-upload"),
    path("delete/<uuid:id>/", ImageDeleteView.as_view(), name="image-delete"),
]
