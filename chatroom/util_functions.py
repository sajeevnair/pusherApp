from django.utils.crypto import get_random_string


def get_user_id():
    return 'Guest_'+get_random_string(8)