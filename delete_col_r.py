import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"
creds = Credentials.from_authorized_user_file("token.json", SCOPES)
service = build("sheets", "v4", credentials=creds)

res_sheets = service.spreadsheets().get(spreadsheetId=SS_ID).execute()
sheets = res_sheets.get("sheets", [])
sheet_id = None
for s in sheets:
    if s["properties"]["title"] == "Respuestas de formulario 1":
        sheet_id = s["properties"]["sheetId"]
        break

if sheet_id is not None:
    try:
        body = {
            "requests": [
                {
                    "deleteDimension": {
                        "range": {
                            "sheetId": sheet_id,
                            "dimension": "COLUMNS",
                            "startIndex": 17,
                            "endIndex": 18
                        }
                    }
                }
            ]
        }
        service.spreadsheets().batchUpdate(spreadsheetId=SS_ID, body=body).execute()
        print("Columna R eliminada")
    except Exception as e:
        print(f"Error: {e}")
