# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
ver_form1.py
-------------
Muestra el estado completo de Formulario 1:
cedula, nombre, y si tiene o no los enlaces pre-llenados.
"""
import os, unicodedata
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow

SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"
HOJA  = "Respuestas de formulario 1"

def autenticar():
    SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as f:
            f.write(creds.to_json())
    return build("sheets", "v4", credentials=creds)

def normalizar(s):
    s = unicodedata.normalize('NFD', str(s))
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower().strip()

def main():
    svc = autenticar()
    res = svc.spreadsheets().values().get(
        spreadsheetId=SS_ID,
        range=f"'{HOJA}'!A1:ZZ500"
    ).execute()
    values = res.get("values", [])
    headers = values[0]

    print("ENCABEZADOS:")
    for i, h in enumerate(headers):
        print(f"  {chr(65+i) if i < 26 else 'A'+chr(65+i-26)}: {h}")

    print("\nDATA POR FILA:")
    for r in range(1, len(values)):
        fila = values[r]
        d = dict(zip(headers, fila + [""]*(len(headers)-len(fila))))
        cedula  = d.get("Cedula de Ciudadania", "")
        nombre  = d.get("Nombre Completo del Candidato", "")
        link2   = d.get("Llenar Formulario 2", "")
        link3   = d.get("Llenar Formulario 3", "")
        link4   = d.get("Llenar Formulario 4", "")
        programa = d.get("Programa Academico al que Concursa", "")
        perfil   = d.get("Perfil del Cargo (segun convocatoria)", "")
        print(f"\n  Fila {r+1}:")
        print(f"    Cedula  : {cedula}")
        print(f"    Nombre  : {nombre}")
        print(f"    Programa: {programa}")
        print(f"    Perfil  : {perfil}")
        print(f"    Link F2 : {'SI ('+link2[:60]+'...)' if link2 else 'NO GENERADO'}")
        print(f"    Link F3 : {'SI' if link3 else 'NO GENERADO'}")
        print(f"    Link F4 : {'SI' if link4 else 'NO GENERADO'}")

if __name__ == "__main__":
    main()
