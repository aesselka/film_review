import csv
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify

from movies.models import Movie, Genre


class Command(BaseCommand):
    help = 'Import movies from imdb_top_1000.csv'

    def add_arguments(self, parser):
        parser.add_argument(
            'csv_path',
            type=str,
            help='Path to imdb_top_1000.csv'
        )

    def parse_int(self, value, default=None):
        if value is None:
            return default
        value = str(value).strip()
        if not value or value == 'NA':
            return default
        value = value.replace(',', '')
        try:
            return int(value)
        except ValueError:
            return default

    def parse_float(self, value, default=None):
        if value is None:
            return default
        value = str(value).strip()
        if not value or value == 'NA':
            return default
        try:
            return float(value)
        except ValueError:
            return default

    @transaction.atomic
    def handle(self, *args, **options):
        csv_path = Path(options['csv_path'])

        if not csv_path.exists():
            raise CommandError(f'File not found: {csv_path}')

        created_movies = 0
        updated_movies = 0

        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)

            for row in reader:
                title = (row.get('Series_Title') or '').strip()
                if not title:
                    continue

                released_year = self.parse_int(row.get('Released_Year'), default=0)

                movie, created = Movie.objects.update_or_create(
                    title=title,
                    released_year=released_year,
                    defaults={
                        'certificate': (row.get('Certificate') or '').strip(),
                        'runtime': (row.get('Runtime') or '').strip(),
                        'imdb_rating': self.parse_float(row.get('IMDB_Rating')),
                        'overview': (row.get('Overview') or '').strip(),
                        'meta_score': self.parse_int(row.get('Meta_score')),
                        'poster_url': (row.get('Poster_Link') or '').strip(),
                        'video_url': '',
                        'director': (row.get('Director') or '').strip(),
                        'star1': (row.get('Star1') or '').strip(),
                        'star2': (row.get('Star2') or '').strip(),
                        'star3': (row.get('Star3') or '').strip(),
                        'star4': (row.get('Star4') or '').strip(),
                        'votes': self.parse_int(row.get('No_of_Votes')),
                        'gross': (row.get('Gross') or '').strip(),
                    }
                )

                genres_raw = (row.get('Genre') or '').strip()
                genre_names = [g.strip() for g in genres_raw.split(',') if g.strip()]

                movie.genres.clear()

                for genre_name in genre_names:
                    genre, _ = Genre.objects.get_or_create(
                        name=genre_name,
                        defaults={'slug': slugify(genre_name)}
                    )
                    movie.genres.add(genre)

                if created:
                    created_movies += 1
                else:
                    updated_movies += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Import finished. Created: {created_movies}, Updated: {updated_movies}'
            )
        )