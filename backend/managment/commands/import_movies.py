# backend/movies/management/commands/import_movies.py

import csv
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from movies.models import Movie, Genre


class Command(BaseCommand):
    help = "Import movies from CSV into database"

    def add_arguments(self, parser):
        parser.add_argument(
            "csv_path",
            type=str,
            help="Path to CSV file"
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing movies before import"
        )

    def handle(self, *args, **options):
        csv_path = Path(options["csv_path"])
        clear = options["clear"]

        if not csv_path.exists():
            self.stdout.write(self.style.ERROR(f"File not found: {csv_path}"))
            return

        if clear:
            self.stdout.write("Deleting existing movies...")
            Movie.objects.all().delete()

        created_count = 0
        updated_count = 0

        with open(csv_path, mode="r", encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file)

            with transaction.atomic():
                for row in reader:
                    title = self.clean_string(row.get("Series_Title"))
                    released_year = self.parse_int(row.get("Released_Year"))
                    certificate = self.clean_string(row.get("Certificate"))
                    runtime = self.clean_string(row.get("Runtime"))
                    imdb_rating = self.parse_float(row.get("IMDB_Rating"))
                    overview = self.clean_string(row.get("Overview"))
                    meta_score = self.parse_int(row.get("Meta_score"))
                    poster_url = self.clean_string(row.get("Poster_Link"))
                    director = self.clean_string(row.get("Director"))
                    star1 = self.clean_string(row.get("Star1"))
                    star2 = self.clean_string(row.get("Star2"))
                    star3 = self.clean_string(row.get("Star3"))
                    star4 = self.clean_string(row.get("Star4"))
                    votes = self.parse_int(row.get("No_of_Votes"))
                    gross = self.clean_string(row.get("Gross"))
                    genre_value = self.clean_string(row.get("Genre"))

                    if not title:
                        self.stdout.write(self.style.WARNING("Skipped row without title"))
                        continue

                    if released_year is None:
                        self.stdout.write(
                            self.style.WARNING(f"Skipped '{title}' because Released_Year is invalid")
                        )
                        continue

                    movie, created = Movie.objects.update_or_create(
                        title=title,
                        released_year=released_year,
                        defaults={
                            "certificate": certificate,
                            "runtime": runtime,
                            "imdb_rating": imdb_rating,
                            "overview": overview,
                            "meta_score": meta_score,
                            "poster_url": poster_url,
                            "video_url": "",
                            "director": director,
                            "star1": star1,
                            "star2": star2,
                            "star3": star3,
                            "star4": star4,
                            "votes": votes,
                            "gross": gross,
                        },
                    )

                    genre_objects = []
                    if genre_value:
                        genre_names = [g.strip() for g in genre_value.split(",") if g.strip()]

                        for genre_name in genre_names:
                            base_slug = slugify(genre_name)
                            slug = base_slug
                            counter = 1

                            while Genre.objects.exclude(name=genre_name).filter(slug=slug).exists():
                                slug = f"{base_slug}-{counter}"
                                counter += 1

                            genre, _ = Genre.objects.get_or_create(
                                name=genre_name,
                                defaults={"slug": slug}
                            )
                            genre_objects.append(genre)

                    movie.genres.set(genre_objects)

                    if created:
                        created_count += 1
                    else:
                        updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Import completed. Created: {created_count}, Updated: {updated_count}"
            )
        )

    def clean_string(self, value):
        if value is None:
            return ""
        value = str(value).strip()
        if value.lower() in {"nan", "none", "null", "n/a", "na"}:
            return ""
        return value

    def parse_int(self, value):
        value = self.clean_string(value)
        if not value:
            return None
        value = value.replace(",", "")
        try:
            return int(value)
        except ValueError:
            return None

    def parse_float(self, value):
        value = self.clean_string(value)
        if not value:
            return None
        value = value.replace(",", "")
        try:
            return float(value)
        except ValueError:
            return None