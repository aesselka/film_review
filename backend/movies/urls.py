from django.urls import path
from .views import (
    register_view,
    login_view,
    logout_view,
    GenreListAPIView,
    MovieListAPIView,
    MovieDetailAPIView,
    SimilarMoviesAPIView,
    MovieReviewsAPIView,
    ReviewDetailAPIView,
    WatchHistoryAPIView,
    RecommendationsAPIView,
    FavoritesAPIView,
    FavoriteDeleteAPIView,
    ProfileAPIView,
    UserReviewsAPIView,
)

urlpatterns = [
    path('auth/register/', register_view),
    path('auth/login/', login_view),
    path('auth/logout/', logout_view),

    path('genres/', GenreListAPIView.as_view()),

    path('movies/', MovieListAPIView.as_view()),
    path('movies/<int:pk>/', MovieDetailAPIView.as_view()),
    path('movies/<int:pk>/similar/', SimilarMoviesAPIView.as_view()),
    path('movies/<int:pk>/reviews/', MovieReviewsAPIView.as_view()),

    path('reviews/<int:pk>/', ReviewDetailAPIView.as_view()),

    path('history/', WatchHistoryAPIView.as_view()),
    path('recommendations/', RecommendationsAPIView.as_view()),

    path('favorites/', FavoritesAPIView.as_view()),
    path('favorites/<int:movie_id>/', FavoriteDeleteAPIView.as_view()),

    path('profile/', ProfileAPIView.as_view()),
    path('user-reviews/', UserReviewsAPIView.as_view()),
]