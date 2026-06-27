from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

creds = Credentials.from_authorized_user_file('token.json')
sheets = build('sheets', 'v4', credentials=creds)
SS_ID = '1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY'

for n in [3, 4]:
    range_str = f"'Respuestas de formulario {n}'!A1:AZ1"
    res = sheets.spreadsheets().values().get(spreadsheetId=SS_ID, range=range_str).execute()
    print(f'=== FORMULARIO {n} ===')
    for i, h in enumerate(res.get('values', [[]])[0]):
        print(f'  [{i}] {h}')
