from ..models import Settings
from .. import db

def get_settings(user_id):
    settings = Settings.query.filter_by(user_id=user_id).first()
    if not settings:
        return None
    return {
        'notification_enabled': settings.notification_enabled,
        'theme': settings.theme
    }

def update_settings(user_id, data):
    settings = Settings.query.filter_by(user_id=user_id).first()
    if not settings:
        settings = Settings(user_id=user_id)
        db.session.add(settings)

    settings.notification_enabled = data['notification_enabled']
    settings.theme = data['theme']

    db.session.commit()
    return {'success': True, 'message': 'Settings updated successfully'}