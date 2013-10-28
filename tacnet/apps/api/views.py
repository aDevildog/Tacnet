from rest_framework import viewsets
from serializers import *
from tacsketch.models import *

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer


class MapViewSet(viewsets.ModelViewSet):
    queryset = Map.objects.all()
    serializer_class = MapSerializer

class GameModeViewSet(viewsets.ModelViewSet):
    queryset = GameMode.objects.all()
    serializer_class = GameModeSerializer