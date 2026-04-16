from django.contrib import admin
from .models import Genre, Movie, Review, WatchHistory, Favorite


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'released_year', 'imdb_rating')
    search_fields = ('title', 'director')
    filter_horizontal = ('genres',)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'movie', 'rating', 'created_at')


@admin.register(WatchHistory)
class WatchHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'movie', 'watched_at')


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'movie', 'added_at')