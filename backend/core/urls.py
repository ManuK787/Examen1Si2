from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from usuarios.views import LoginView  

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Autenticación
    path('api/auth/login/', LoginView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Módulos
    path('api/usuarios/', include('usuarios.urls')),
    path('api/roles/', include('roles.urls')),
    path('api/propiedades/', include('propiedades.urls')),
    path('api/vehiculos/', include('vehiculos.urls')),
    path('api/areas-comunes/', include('areas_comunes.urls')),
    path('api/reservas/', include('reservas.urls')),
    path('api/mantenimiento/', include('mantenimiento.urls')),
    path('api/avisos/', include('avisos.urls')),
    path('api/seguridad/', include('seguridad.urls')),
]
