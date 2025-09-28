from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.response import Response
from .serializers import UsuarioSerializer
from .serializers import LoginSerializer

class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        return super().get_token(user)

    def validate(self, attrs):
        # soporte a identifier (email)
        data = super().validate(attrs)
        user = self.user
        data['user'] = UsuarioSerializer(user).data
        return data

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
