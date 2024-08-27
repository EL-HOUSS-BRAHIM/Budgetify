from flask import jsonify
from ..services.mail_service import send_email
from . import testmail_bp

@testmail_bp.route('/send', methods=['GET'])
def send_test_email():
    subject = 'Test Email'
    recipient = 'bross.or.of@gmail.com'  # Replace with the email you want to send to
    body = 'This is a test email sent from Flask.\n hello ayobe 😂👌😊'
    
    if send_email(subject, recipient, body):
        return jsonify({'message': 'Test email sent successfully'}), 200
    else:
        return jsonify({'error': 'Failed to send test email'}), 500
