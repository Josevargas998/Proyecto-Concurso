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
    h = header.lower()
    if "nombre completo" in h:
        mock_row[i] = "Diego Montoya Molina"
    elif "cedula" in h:
        mock_row[i] = "1094123456"
    elif "programa" in h:
        mock_row[i] = "INGENIERIA CIVIL - Vias y Transporte"
    elif "perfil" in h:
        mock_row[i] = "Ingeniero civil con maestria en vias"
    elif "1. formato de inscrip" in h:
        mock_row[i] = "CUMPLE"
    elif "observaciones - formato de inscripcion" in h:
        mock_row[i] = "Entregado presencialmente el 18 de junio. Recibido por secretaria."
    elif "2. hoja de vida uq" in h:
        mock_row[i] = "CUMPLE"
    elif "observaciones - hoja de vida" in h:
        mock_row[i] = "Se aporta formato institucional (GH-FOR-006) debidamente diligenciado y firmado."
    elif "3. fotocopia" in h:
        mock_row[i] = "CUMPLE"
    elif "observaciones - cedula" in h:
        mock_row[i] = "Se anexa documento de identidad ampliado al 150%."
    elif "4. fotocopia de matricula" in h:
        mock_row[i] = "CUMPLE"
    elif "observaciones - matricula" in h:
        mock_row[i] = "Tarjeta profesional COPNIA verificada y vigente."
    elif "5. certificados" in h:
        mock_row[i] = "CUMPLE"
    elif "observaciones - certificados" in h:
        mock_row[i] = "Procuraduria, Contraloria y Policia sin antecedentes (generados 18 de junio)."
    elif "6. certificado" in h:
        mock_row[i] = "CUMPLE"
    elif "observaciones - experiencia docente" in h:
        mock_row[i] = "Acredita 3 anos (1500 horas) de experiencia docente certificada."
    elif "7. titulo de pregrado" in h:
        mock_row[i] = "CUMPLE"
    elif "observaciones - titulo pregrado" in h:
        mock_row[i] = "Ingeniero Civil, acta y diploma validados."
    elif "8. titulo de posgrado" in h:
        mock_row[i] = "CUMPLE"
    elif "observaciones - titulo posgrado" in h:
        mock_row[i] = "Magister en Ingenieria de Vias, diploma verificado."
    elif "9. experiencia" in h:
        mock_row[i] = "CUMPLE"
    elif "observaciones - experiencia en el area" in h:
        mock_row[i] = "Acredita 4 anos de experiencia profesional como ingeniero disenador."
    elif "concepto final" in h:
        mock_row[i] = "CUMPLE CON TODOS LOS REQUISITOS"
    elif "observaciones generales" in h:
        mock_row[i] = "El candidato Diego Montoya Molina entrego su expediente fisico hoy 18 de junio en la secretaria del programa. La documentacion se encuentra completa, foliada y en el orden establecido por la convocatoria. Continua a la siguiente etapa."
    elif "enlace" in h:
        mock_row[i] = ""

body = {"values": [mock_row]}
service.spreadsheets().values().append(
    spreadsheetId=SS_ID, range=f"{HOJA}!A:A",
    valueInputOption="USER_ENTERED", insertDataOption="INSERT_ROWS", body=body).execute()

print("Fila realista insertada.")
