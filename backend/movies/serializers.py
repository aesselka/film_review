from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Genre, Movie, Review, WatchHistory, Favorite


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('username already exists')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('email already exists')
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name', 'slug']


class MovieListSerializer(serializers.ModelSerializer):
    genres = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')

    class Meta:
        model = Movie
        fields = [
            'id',
            'title',
            'released_year',
            'runtime',
            'genres',
            'imdb_rating',
            'poster_url',
            'overview',
        ]


class MovieDetailSerializer(serializers.ModelSerializer):
    genres = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    stars = serializers.SerializerMethodField()
    avg_user_rating = serializers.ReadOnlyField()
    reviews_count = serializers.ReadOnlyField()

    class Meta:
        model = Movie
        fields = [
            'id',
            'title',
            'released_year',
            'certificate',
            'runtime',
            'genres',
            'imdb_rating',
            'meta_score',
            'overview',
            'poster_url',
            'video_url',
            'director',
            'stars',
            'votes',
            'gross',
            'avg_user_rating',
            'reviews_count',
        ]

    def get_stars(self, obj):
        return obj.stars_list


class SimilarMovieSerializer(serializers.ModelSerializer):
    genres = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')

    class Meta:
        model = Movie
        fields = ['id', 'title', 'imdb_rating', 'poster_url', 'genres']


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'text', 'created_at', 'is_owner']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        return bool(request and request.user.is_authenticated and obj.user == request.user)


class ReviewCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'text']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('rating must be between 1 and 5')
        return value


class MovieMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['id', 'title', 'poster_url', 'imdb_rating']


class WatchHistoryCreateSerializer(serializers.Serializer):
    movie_id = serializers.IntegerField()


class WatchHistorySerializer(serializers.ModelSerializer):
    movie = MovieMinimalSerializer(read_only=True)

    class Meta:
        model = WatchHistory
        fields = ['id', 'movie', 'watched_at']


class FavoriteCreateSerializer(serializers.Serializer):
    movie_id = serializers.IntegerField()


class FavoriteSerializer(serializers.ModelSerializer):
    movie = MovieMinimalSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'movie', 'added_at']


class ProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    watched_count = serializers.IntegerField()
    reviews_count = serializers.IntegerField()
    favorites_count = serializers.IntegerField()