from django.db import models

class Game (models.Model):
    name = models.TextField()


class GameMode (models.Model):
    name = models.TextField()


class Map (models.Model):
    name = models.TextField()
    game = models.ForeignKey(Game)
    gamemode = models.ForeignKey(GameMode)
    uri = models.TextField()




