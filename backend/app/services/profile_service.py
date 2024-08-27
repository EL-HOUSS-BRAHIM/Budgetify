import os
import random
from .drive_service import upload_avatar, delete_avatar
from ..models import Profile
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
    if not avatar:
        # Generate SVG avatar if no file is provided
        svg_avatar = generate_svg_avatar(first_name)
        avatar_url = svg_avatar  # Store the SVG string directly in the database
    else:
        # Upload the provided avatar file to Google Drive
        avatar_id = upload_avatar(avatar, f'avatar_{user_id}.png')
        avatar_url = f'https://drive.google.com/uc?id={avatar_id}'

    # Create the new profile with the avatar
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
        avatar=avatar_url  # Save the avatar URL or SVG
    )
    db.session.add(new_profile)
    db.session.commit()
    return new_profile


def get_profile(user_id):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if profile:
        # Convert Profile object to dictionary
        profile_data = {
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
            'avatar': profile.avatar
        }
        return profile_data
    return {'error': 'Profile not found'}, 404

def update_profile(user_id, data):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return {'error': 'Profile not found'}, 404

    for key, value in data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)
    
    db.session.commit()
    return profile

def delete_profile(user_id):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return {'error': 'Profile not found'}, 404

    if profile.avatar and "drive.google.com" in profile.avatar:
        avatar_id = profile.avatar.split('id=')[1]
        delete_avatar(avatar_id)
    
    db.session.delete(profile)
    db.session.commit()
    return {'success': True, 'message': 'Profile deleted successfully'}

def update_profile_avatar(user_id, avatar_file=None):
    profile = Profile.query.filter_by(user_id=user_id).first()

    if profile.avatar and "drive.google.com" in profile.avatar:
        avatar_id = profile.avatar.split('id=')[1]
        delete_avatar(avatar_id)

    if not avatar_file:
        svg_avatar = generate_svg_avatar(profile.first_name)
        profile.avatar = svg_avatar
    else:
        file_path = avatar_file
        avatar_id = upload_avatar(file_path, f'avatar_{user_id}.png')
        profile.avatar = f'https://drive.google.com/uc?id={avatar_id}'

    db.session.commit()
    return profile.avatar

def delete_profile_avatar(user_id):
    profile = Profile.query.filter_by(user_id=user_id).first()

    if profile.avatar and "drive.google.com" in profile.avatar:
        avatar_id = profile.avatar.split('id=')[1]
        delete_avatar(avatar_id)

    profile.avatar = None
    db.session.commit()
    return {'success': True, 'message': 'Avatar deleted successfully'}
