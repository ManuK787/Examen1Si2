from django.urls import path
from django.http import JsonResponse

def test_view(request):
    return JsonResponse({"message": "Avisos API funcionando"})

urlpatterns = [ path('', test_view) ]
