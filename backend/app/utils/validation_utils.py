from flask import request
from functools import wraps

def validate_json(*expected_args):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            json_data = request.get_json()
            if not json_data:
                return {'success': False, 'message': 'No input data provided'}, 400
            for arg in expected_args:
                if arg not in json_data:
                    return {'success': False, 'message': f'Missing {arg} parameter'}, 400
            return f(*args, **kwargs)
        return decorated_function
    return decorator