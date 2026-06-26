import json, os
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    'https://www.googleapis.com/auth/forms.body',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
]

FORM_ID = '1oS3N1XdQR5gVACxxdZYRxeIWEtBB3VKus7uwhUiX4nw'
CREDS_FILE = 'credentials.json'
TOKEN_FILE = 'token.json'

def autenticar():
    creds = None
    if os.path.exists(TOKEN_FILE):
        try:
            creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
        except:
            pass
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except:
                creds = None
        if not creds:
            # Buscar credentials.json en la misma carpeta
            flow = InstalledAppFlow.from_client_secrets_file(CREDS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, 'w') as f:
            f.write(creds.to_json())
    return creds

def main():
    creds = autenticar()
    service = build('forms', 'v1', credentials=creds)

    # Ver estructura del formulario
    form = service.forms().get(formId=FORM_ID).execute()
    print("Formulario:", form.get('info', {}).get('title'))
    items = form.get('items', [])

    target_index = -1
    for i, item in enumerate(items):
        title = item.get('title', '')
        print(f"  [{i}] {title}")
        if 'Fecha' in title and 'Recep' in title:
            target_index = i

    if target_index == -1:
        print("ERROR: No se encontro la pregunta de Fecha de Recepcion")
        return

    print(f"\n-> Insertando 'Numero de Radicado' en posicion {target_index + 1}...")

    body = {
        "requests": [{
            "createItem": {
                "item": {
                    "title": "Número de Radicado",
                    "questionItem": {
                        "question": {
                            "required": True,
                            "textQuestion": {
                                "paragraph": False
                            }
                        }
                    }
                },
                "location": {
                    "index": target_index + 1
                }
            }
        }]
    }

    res = service.forms().batchUpdate(formId=FORM_ID, body=body).execute()
    print("Pregunta 'Numero de Radicado' agregada exitosamente!")

if __name__ == '__main__':
    main()
