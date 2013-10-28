from django.conf.urls import patterns, url, include
from rest_framework import routers
import views

router = routers.DefaultRouter()
router.register(r'maps', views.MapViewSet)
router.register(r'games', views.GameViewSet)
router.register(r'gamemodes', views.GameModeViewSet)


urlpatterns = patterns('api',
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
)