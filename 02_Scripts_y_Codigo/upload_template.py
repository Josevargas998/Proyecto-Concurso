import os
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

def main():
    creds = Credentials.from_authorized_user_file('token.json',
        ["https://www.googleapis.com/auth/drive"])
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        
    drive_service = build('drive', 'v3', credentials=creds)
    
    file_path = r"..\01_Plantillas_Originales\3.xlsx"
    if not os.path.exists(file_path):
        print(f"Error: {file_path} no encontrado")
        return
        
    file_metadata = {
        'name': 'PLANTILLA_ETAPA3',
        'mimeType': 'application/vnd.google-apps.spreadsheet'
    }
    media = MediaFileUpload(file_path,
                            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            resumable=True)
                            
    print(f"Subiendo {file_path} a Google Drive...")
    file = drive_service.files().create(body=file_metadata,
                                        media_body=media,
                                        fields='id').execute()
                                        
    print(f"Plantilla subida con exito!")
    print(f"ID de la Plantilla de Google Sheets: {file.get('id')}")

if __name__ == '__main__':
    main()
