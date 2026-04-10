from django.contrib.auth import authenticate
from django.db.models import Count
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from .models import Genre, Movie, Review, WatchHistory, Favorite
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    GenreSerializer,
    MovieListSerializer,
    MovieDetailSerializer,
    SimilarMovieSerializer,
    ReviewSerializer,
    ReviewCreateUpdateSerializer,
    WatchHistoryCreateSerializer,
    WatchHistorySerializer,
    FavoriteCreateSerializer,
    FavoriteSerializer,
    ProfileSerializer,
)
from .utils import create_access_token


class MoviePagination(PageNumberPagination):
    page_size = 12


@api_view(['POST'])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    return Response(
        {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {'detail': 'invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    access_token = create_access_token(user)

    return Response(
        {'access': access_token},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    return Response({'message': 'logged out'}, status=status.HTTP_200_OK)


class GenreListAPIView(APIView):
    def get(self, request):
        genres = Genre.objects.all().order_by('name')
        serializer = GenreSerializer(genres, many=True)
        return Response(serializer.data)


class MovieListAPIView(APIView):
    def get(self, request):
        queryset = Movie.objects.prefetch_related('genres').all().order_by('id')

        search = request.query_params.get('search')
        genre_slug = request.query_params.get('genre')

        if search:
            queryset = queryset.filter(title__icontains=search)

        if genre_slug:
            queryset = queryset.filter(genres__slug=genre_slug)

        paginator = MoviePagination()
        page = paginator.paginate_queryset(queryset.distinct(), request)
        serializer = MovieListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class MovieDetailAPIView(APIView):
    def get(self, request, pk):
        try:
            movie = Movie.objects.prefetch_related('genres', 'reviews').get(pk=pk)
        except Movie.DoesNotExist:
            return Response({'detail': 'movie not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MovieDetailSerializer(movie)
        return Response(serializer.data)


class SimilarMoviesAPIView(APIView):
    def get(self, request, pk):
        try:
            movie = Movie.objects.prefetch_related('genres').get(pk=pk)
        except Movie.DoesNotExist:
            return Response({'detail': 'movie not found'}, status=status.HTTP_404_NOT_FOUND)

        genre_ids = movie.genres.values_list('id', flat=True)

        similar_movies = (
            Movie.objects.filter(genres__id__in=genre_ids)
            .exclude(id=movie.id)
            .prefetch_related('genres')
            .annotate(shared_genres=Count('genres'))
            .distinct()
            .order_by('-shared_genres', '-imdb_rating')[:10]
        )

        serializer = SimilarMovieSerializer(similar_movies, many=True)
        return Response(serializer.data)


class MovieReviewsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        reviews = Review.objects.filter(movie_id=pk).select_related('user')
        serializer = ReviewSerializer(reviews, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'detail': 'authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            movie = Movie.objects.get(pk=pk)
        except Movie.DoesNotExist:
            return Response({'detail': 'movie not found'}, status=status.HTTP_404_NOT_FOUND)

        if Review.objects.filter(user=request.user, movie=movie).exists():
            return Response(
                {'detail': 'you already reviewed this movie'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ReviewCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review = Review.objects.create(
            user=request.user,
            movie=movie,
            rating=serializer.validated_data['rating'],
            text=serializer.validated_data['text'],
        )

        response_serializer = ReviewSerializer(review, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class ReviewDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({'detail': 'review not found'}, status=status.HTTP_404_NOT_FOUND)

        if review.user != request.user:
            return Response({'detail': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ReviewCreateUpdateSerializer(review, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        response_serializer = ReviewSerializer(review, context={'request': request})
        return Response(response_serializer.data)

    def delete(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({'detail': 'review not found'}, status=status.HTTP_404_NOT_FOUND)

        if review.user != request.user:
            return Response({'detail': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WatchHistoryAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        history = (
            WatchHistory.objects.filter(user=request.user)
            .select_related('movie')
            .prefetch_related('movie__genres')
        )
        serializer = WatchHistorySerializer(history, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WatchHistoryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        movie_id = serializer.validated_data['movie_id']

        try:
            movie = Movie.objects.get(pk=movie_id)
        except Movie.DoesNotExist:
            return Response({'detail': 'movie not found'}, status=status.HTTP_404_NOT_FOUND)

        history = WatchHistory.objects.create(user=request.user, movie=movie)

        return Response(
            {
                'id': history.id,
                'movie_id': movie.id,
                'watched_at': history.watched_at,
            },
            status=status.HTTP_201_CREATED
        )


class RecommendationsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        watched_movie_ids = WatchHistory.objects.filter(user=request.user).values_list('movie_id', flat=True)
        genre_ids = Genre.objects.filter(movies__watch_history__user=request.user).values_list('id', flat=True)

        recommended_movies = (
            Movie.objects.filter(genres__id__in=genre_ids)
            .exclude(id__in=watched_movie_ids)
            .prefetch_related('genres')
            .distinct()
            .order_by('-imdb_rating')[:12]
        )

        serializer = SimilarMovieSerializer(recommended_movies, many=True)
        return Response(serializer.data)


class FavoritesAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        favorites = (
            Favorite.objects.filter(user=request.user)
            .select_related('movie')
            .prefetch_related('movie__genres')
        )
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FavoriteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        movie_id = serializer.validated_data['movie_id']

        try:
            movie = Movie.objects.get(pk=movie_id)
        except Movie.DoesNotExist:
            return Response({'detail': 'movie not found'}, status=status.HTTP_404_NOT_FOUND)

        favorite, created = Favorite.objects.get_or_create(user=request.user, movie=movie)

        if not created:
            return Response({'detail': 'already in favorites'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                'id': favorite.id,
                'movie_id': movie.id,
                'added_at': favorite.added_at,
            },
            status=status.HTTP_201_CREATED
        )


class FavoriteDeleteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, movie_id):
        try:
            favorite = Favorite.objects.get(user=request.user, movie_id=movie_id)
        except Favorite.DoesNotExist:
            return Response({'detail': 'favorite not found'}, status=status.HTTP_404_NOT_FOUND)

        favorite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'watched_count': request.user.watch_history.count(),
            'reviews_count': request.user.reviews.count(),
            'favorites_count': request.user.favorites.count(),
        }
        serializer = ProfileSerializer(data)
        return Response(serializer.data)