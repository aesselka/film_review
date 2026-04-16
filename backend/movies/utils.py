from rest_framework_simplejwt.tokens import RefreshToken


def create_access_token(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)
