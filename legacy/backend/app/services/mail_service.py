from flask_mail import Mail, Message
from flask import current_app

def send_email(subject, recipient, body):
    """Send an email using Flask-Mail."""
    mail = Mail(current_app)
    msg = Message(subject, sender=current_app.config['MAIL_USERNAME'], recipients=[recipient])
    msg.body = body
    try:
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
