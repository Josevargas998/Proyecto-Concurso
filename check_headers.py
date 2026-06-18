import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"
creds = Credentials.from_authorized_user_file("token.json", SCOPES)
service = build("sheets", "v4", credentials=creds)

res = service.spreadsheets().values().get(spreadsheetId=SS_ID, range="Respuestas de formulario 1!A1:ZZ1").execute()
headers = res.get("values", [[]])[0]
print(f"Total headers: {len(headers)}")
for i, h in enumerate(headers):
    print(f"Col {i+1}: {h}")
