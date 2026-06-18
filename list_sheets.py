import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"

creds = Credentials.from_authorized_user_file("token.json", SCOPES)
service = build("sheets", "v4", credentials=creds)

res = service.spreadsheets().get(spreadsheetId=SS_ID).execute()
sheets = res.get("sheets", [])
print("Hojas en el documento:")
for s in sheets:
    props = s.get("properties", {})
    print(f"- {props.get('title')} (Hidden: {props.get('hidden', False)})")
