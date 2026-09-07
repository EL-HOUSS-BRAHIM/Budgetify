import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'service_account.json')  # Absolute path
PARENT_FOLDER_ID = '1-52Y_Vea2IF0RZo4mW9Qd3YkluBIUZIF'

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=credentials)

def upload_avatar(file_path, file_name):
    file_metadata = {
        'name': file_name,
        'parents': [PARENT_FOLDER_ID]
    }
    media = MediaFileUpload(file_path, mimetype='image/jpeg')

    file = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id').execute()

    return file.get('id')

def delete_avatar(file_id):
    drive_service.files().delete(fileId=file_id).execute()
