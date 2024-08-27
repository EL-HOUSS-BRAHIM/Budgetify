import random
import string
from datetime import datetime, timedelta

# In-memory storage for simplicity; consider using a database or cache in production
otp_storage = {}

def generate_otp(length=6):
    """Generate a random OTP."""
    return ''.join(random.choices(string.digits, k=length))

def store_otp(email, otp):
    """Store OTP with expiration time."""
    otp_storage[email] = {'otp': otp, 'expires_at': datetime.now() + timedelta(minutes=10)}

def validate_otp(email, otp):
    """Validate the provided OTP."""
    stored_otp = otp_storage.get(email)
    if stored_otp and stored_otp['otp'] == otp and datetime.now() < stored_otp['expires_at']:
        del otp_storage[email]  # OTP should be used only once
        return True
    return False
