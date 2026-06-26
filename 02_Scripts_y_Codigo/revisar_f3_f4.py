from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

creds = Credentials.from_authorized_user_file('token.json')
if creds.expired and creds.refresh_token:
    creds.refresh(Request())
sheets = build('sheets', 'v4', credentials=creds)

SS_ID = '1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY'

for num in [3, 4]:
    HOJA = f'Respuestas de formulario {num}'
    rango = "'" + HOJA + "'!A1:AZ10"
    res   = sheets.spreadsheets().values().get(spreadsheetId=SS_ID, range=rango).execute()
    filas = res.get('values', [])
    
    print(f'=== FORMULARIO {num} ===')
    if not filas:
        print('  SIN DATOS\n')
        continue
    
    enc = filas[0]
    print(f'  Total columnas: {len(enc)}')
    print(f'  Total respuestas: {len(filas)-1}')
    print(f'  Columnas:')
    for i, h in enumerate(enc):
        print(f'    [{i}] {h!r}')
    
    print(f'  Filas:')
    for fi, fila in enumerate(filas[1:], 2):
        # Buscar columna Enlace
        enlace = ''
        for i, h in enumerate(enc):
            if 'Enlace' in h or 'enlace' in h:
                enlace = fila[i] if i < len(fila) else ''
                break
        nombre = fila[2] if len(fila) > 2 else '?'
        enlace_corto = enlace[:50] if enlace else 'SIN ENLACE'
        print(f'    Fila {fi}: nombre={nombre!r}  enlace={enlace_corto!r}')

    print()
