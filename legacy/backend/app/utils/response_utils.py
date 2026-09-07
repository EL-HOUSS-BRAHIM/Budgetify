def api_response(data=None, message=None, success=True, status_code=200):
    response = {
        'success': success,
        'message': message,
        'data': data
    }
    return response, status_code

def error_response(message, status_code=400):
    return api_response(message=message, success=False, status_code=status_code)