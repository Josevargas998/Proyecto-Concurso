import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"
HOJA = "Respuestas de formulario 2"

creds = Credentials.from_authorized_user_file("token.json", SCOPES)
service = build("sheets", "v4", credentials=creds)

res = service.spreadsheets().values().get(spreadsheetId=SS_ID, range=f"{HOJA}!A1:ZZ1").execute()
headers = res.get("values", [[]])[0]

mock_row = [""] * len(headers)
for i, header in enumerate(headers):
    if "Nombre" in header:
        mock_row[i] = "Catalina Vargas"
    elif "Cedula" in header:
        mock_row[i] = "987654321"
    elif "Programa" in header:
        mock_row[i] = "INGENIERIA DE SISTEMAS - Sistemas Distribuidos"
    elif "Concepto" in header:
        mock_row[i] = "CUMPLE CON TODOS"
    elif "Observaciones" in header:
        mock_row[i] = "Todo en orden (Simulacro)"
    elif "Enlace Documento" in header:
        mock_row[i] = ""

body = {"values": [mock_row]}
service.spreadsheets().values().append(
    spreadsheetId=SS_ID, range=f"{HOJA}!A:A",
    valueInputOption="USER_ENTERED", insertDataOption="INSERT_ROWS", body=body).execute()

print("Fila simulada de Catalina Vargas insertada en la Hoja 2.")
