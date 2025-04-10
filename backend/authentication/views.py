from rest_framework import generics, permissions, status
from .serializer import *
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import response
from api.models import Student
# Create your views here.


class CustomTokenObtainView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, **kwargs):
        email = request.data.get("email")

        if User.objects.filter(email=email).exists():
            return response.Response(
                {"details": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        user = serializer.instance
        email = request.data.get("email")
        phone = request.data.get("phone")
        name = request.data.get("name")
        Student.objects.create(
            S_email=email, S_phone=phone, S_name=name).save()
        headers = self.get_success_headers(serializer.data)
        return response.Response(
            {"details": "success"},
            headers=headers,
        )
