from rest_framework import serializers
from tacsketch.models import *

class GameSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Game
        fields = ('name',)


class MapSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Map
        fields = ('name', 'game', 'gamemode', 'uri')

class GameModeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = GameMode
        fields = ('name',)