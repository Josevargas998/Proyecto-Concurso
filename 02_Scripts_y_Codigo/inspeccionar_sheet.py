from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

creds = Credentials.from_authorized_user_file('token.json')
if creds.expired and creds.refresh_token:
    creds.refresh(Request())
sheets = build('sheets', 'v4', credentials=creds)

SS_ID = '1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY'
HOJA  = 'Respuestas de formulario 2'
rango = "'" + HOJA + "'!A1:AJ6"

res  = sheets.spreadsheets().values().get(spreadsheetId=SS_ID, range=rango).execute()
filas = res.get('values', [])
enc   = filas[0]

print('COLUMNAS:')
for i, h in enumerate(enc):
    print(f'  [{i}] {h!r}')

print()
print('DATOS FILAS:')
for fi, fila in enumerate(filas[1:], 2):
    print(f'  Fila {fi} (len={len(fila)}):')
    for i, v in enumerate(fila):
        col = enc[i] if i < len(enc) else f'COL_{i}'
        if 'Enlace' in col or 'enlace' in col or 'http' in str(v):
            print(f'    [{i}] {col!r} = {str(v)[:80]!r}')
