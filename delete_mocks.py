import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"
creds = Credentials.from_authorized_user_file("token.json", SCOPES)
service = build("sheets", "v4", credentials=creds)

res_sheets = service.spreadsheets().get(spreadsheetId=SS_ID).execute()
sheets = res_sheets.get("sheets", [])

for s in sheets:
    title = s["properties"]["title"]
    sheet_id = s["properties"]["sheetId"]
    if "Respuestas de formulario" in title:
        res = service.spreadsheets().values().get(spreadsheetId=SS_ID, range=f"'{title}'!A:ZZ").execute()
        rows = res.get("values", [])
        
        for i in range(len(rows)-1, 0, -1):
            row = rows[i]
            row_str = " ".join([str(c) for c in row])
            if "1094123456" in row_str or "987654321" in row_str or "Diego Montoya Molina" in row_str or "Catalina Vargas" in row_str:
                print(f"Borrando simulacro en {title} (Fila {i+1})")
                body = {
                    "requests": [
                        {
                            "deleteDimension": {
                                "range": {
                                    "sheetId": sheet_id,
                                    "dimension": "ROWS",
                                    "startIndex": i,
                                    "endIndex": i + 1
                                }
                            }
                        }
                    ]
                }
                service.spreadsheets().batchUpdate(spreadsheetId=SS_ID, body=body).execute()

print("Limpieza finalizada.")
