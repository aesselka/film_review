from django.conf import settings
from django.db import models


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    def __str__(self):
        return self.name


class Movie(models.Model):
    title = models.CharField(max_length=255)
    released_year = models.IntegerField()
    certificate = models.CharField(max_length=20, blank=True)
    runtime = models.CharField(max_length=50, blank=True)
    imdb_rating = models.FloatField(null=True, blank=True)
    overview = models.TextField(blank=True)
    meta_score = models.IntegerField(null=True, blank=True)
    poster_url = models.URLField(blank=True)
    video_url = models.URLField(blank=True)
    director = models.CharField(max_length=255, blank=True)
    star1 = models.CharField(max_length=255, blank=True)
    star2 = models.CharField(max_length=255, blank=True)
    star3 = models.CharField(max_length=255, blank=True)
    star4 = models.CharField(max_length=255, blank=True)
    votes = models.BigIntegerField(null=True, blank=True)
    gross = models.CharField(max_length=100, blank=True)
    genres = models.ManyToManyField(Genre, related_name='movies')

    def __str__(self):
        return self.title

    @property
    def avg_user_rating(self):
        reviews = self.reviews.all()
        if not reviews.exists():
            return 0
        return round(sum(review.rating for review in reviews) / reviews.count(), 1)

    @property
    def reviews_count(self):
        return self.reviews.count()

    @property
    def stars_list(self):
        return [star for star in [self.star1, self.star2, self.star3, self.star4] if star]


class Review(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.IntegerField()
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'movie')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.movie.title}'


class WatchHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='watch_history'
    )
    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        related_name='watch_history'
    )
    watched_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-watched_at']

    def __str__(self):
        return f'{self.user.username} watched {self.movie.title}'


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites'
    )
    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'movie')
        ordering = ['-added_at']

    def __str__(self):
        return f'{self.user.username} favorite {self.movie.title}'