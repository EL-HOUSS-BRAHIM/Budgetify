import io
import base64
from PIL import Image
import random
from ..models import Profile, User
from sqlalchemy.exc import SQLAlchemyError
from .. import db


def generate_svg_avatar(username):
    colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FF8F33']
    color = random.choice(colors)
    initial = username[0].upper()

    svg_avatar = f"""
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="{color}" />
        <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="40px" font-family="Arial" dy=".3em">{initial}</text>
    </svg>
    """
    return svg_avatar


def create_profile(user_id, first_name, last_name, email, phone, currency, language, timezone, two_factor_auth, login_alerts, password_expiry, avatar=None):
    try:
        two_factor_auth = two_factor_auth if isinstance(
            two_factor_auth, bool) else two_factor_auth.lower() == 'true'
        login_alerts = login_alerts if isinstance(
            login_alerts, bool) else login_alerts.lower() == 'true'
        password_expiry = int(
            password_expiry) if password_expiry is not None else 90

        if not avatar:
            user = User.query.get(user_id)
            avatar = generate_svg_avatar(user.username)

        # Convert SVG string to bytes if it's not already
        if isinstance(avatar, str):
            avatar = avatar.encode('utf-8')

        new_profile = Profile(
            user_id=user_id,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            currency=currency,
            language=language,
            timezone=timezone,
            two_factor_auth=two_factor_auth,
            login_alerts=login_alerts,
            password_expiry=password_expiry,
            avatar=avatar
        )
        db.session.add(new_profile)
        db.session.commit()
        return new_profile
    except SQLAlchemyError as e:
        db.session.rollback()
        raise Exception(f"Database error: {str(e)}")
    except Exception as e:
        raise Exception(f"Unexpected error: {str(e)}")

def get_profile(user_id):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if profile:
        return {
            'user_id': profile.user_id,
            'first_name': profile.first_name,
            'last_name': profile.last_name,
            'email': profile.email,
            'phone': profile.phone,
            'currency': profile.currency,
            'language': profile.language,
            'timezone': profile.timezone,
            'two_factor_auth': profile.two_factor_auth,
            'login_alerts': profile.login_alerts,
            'password_expiry': profile.password_expiry,
            'avatar': base64.b64encode(profile.avatar).decode('utf-8') if isinstance(profile.avatar, bytes) else profile.avatar
        }
    return None

def update_profile(user_id, data):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return None

    for key, value in data.items():
        if hasattr(profile, key):
            if key in ['two_factor_auth', 'login_alerts']:
                value = value if isinstance(
                    value, bool) else value.lower() == 'true'
            elif key == 'password_expiry':
                value = int(value) if value is not None else 90
            setattr(profile, key, value)

    db.session.commit()
    return profile


def delete_profile(user_id):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return False

    db.session.delete(profile)
    db.session.commit()
    return True


def update_profile_avatar(user_id, avatar_file):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return None

    if avatar_file:
        img = Image.open(avatar_file)
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_binary = img_byte_arr.getvalue()
        profile.avatar = img_binary
        avatar_data = base64.b64encode(img_binary).decode('utf-8')
        avatar_url = f"data:image/png;base64,{avatar_data}"
    else:
        user = User.query.get(user_id)
        svg_avatar = generate_svg_avatar(user.username)
        profile.avatar = svg_avatar.encode('utf-8')
        avatar_url = svg_avatar

    db.session.commit()
    return avatar_url


def get_profile_avatar(user_id):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if profile and profile.avatar:
        if isinstance(profile.avatar, bytes):
            return f"data:image/png;base64,{base64.b64encode(profile.avatar).decode('utf-8')}"
        else:
            return profile.avatar.decode('utf-8')
    return None
    profile = Profile.query.filter_by(user_id=user_id).first()
    if profile and profile.avatar:
        if isinstance(profile.avatar, bytes):
            import base64
            return f"data:image/png;base64,{base64.b64encode(profile.avatar).decode('utf-8')}"
        else:
            return profile.avatar
    return None
