# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
inspeccionar_form2.py
----------------------
Usa la API de Google Forms v1 para inspeccionar todos los campos
del Formulario 2 y ver:
  - Nombre exacto de cada campo
  - Tipo (TEXT, MULTIPLE_CHOICE, DROPDOWN, etc.)
  - Opciones disponibles (si es dropdown/multiple choice)
  - Entry ID para construir URLs pre-llenadas
"""
import os
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow

# IDs de los formularios
FORMS = {
    "Formulario 2 (Verificacion)": "1xoVPJ8jAjrUibp-jH8zIhmdNe6r7Ilx9aPiFQUETSI4",
    "Formulario 3 (Calificacion)": "1DP9UE2oQJ2vCA3bV7oTnvUMW7xA5xiSiS-F96_8nnm8",
    "Formulario 4 (Ficha Ingreso)": "1A-YFD_8xGqwe-Dh3viMGerN6_Uj2agPRR_X8KuIwJlA",
}

def autenticar():
    SCOPES = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/forms.body.readonly",
    ]
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception:
                creds = None
        if not creds or not creds.valid:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as f:
            f.write(creds.to_json())
    return creds

def main():
    print("=" * 65)
    print("  INSPECCION DE FORMULARIOS - CAMPOS Y ENTRY IDs")
    print("=" * 65)

    creds = autenticar()
    forms_svc = build("forms", "v1", credentials=creds)

    for form_nombre, form_id in FORMS.items():
        print(f"\n{'='*65}")
        print(f"  {form_nombre}")
        print(f"  ID: {form_id}")
        print(f"{'='*65}")

        try:
            form = forms_svc.forms().get(formId=form_id).execute()
        except Exception as e:
            print(f"  ERROR al leer el formulario: {e}")
            continue

        titulo = form.get("info", {}).get("title", "Sin titulo")
        print(f"  Titulo: {titulo}")

        items = form.get("items", [])
        print(f"  Total de campos: {len(items)}\n")

        for item in items:
            item_id   = item.get("itemId", "")
            title     = item.get("title", "(sin titulo)")
            qi        = item.get("questionItem", {})
            question  = qi.get("question", {})
            q_id      = question.get("questionId", "")
            
            # Tipo de pregunta
            tipo = "DESCONOCIDO"
            opciones = []
            
            if "textQuestion" in question:
                tipo = "TEXTO_LIBRE"
            elif "choiceQuestion" in question:
                cq = question["choiceQuestion"]
                tipo = cq.get("type", "CHOICE")  # RADIO, CHECKBOX, DROP_DOWN
                opciones = [op.get("value","") for op in cq.get("options", [])]
            elif "scaleQuestion" in question:
                tipo = "ESCALA"
            elif "dateQuestion" in question:
                tipo = "FECHA"
            elif "timeQuestion" in question:
                tipo = "HORA"
            elif "fileUploadQuestion" in question:
                tipo = "ARCHIVO"
            
            # El entry ID para pre-llenado es el questionId
            entry_id = f"entry.{q_id}" if q_id else "N/A"
            
            # Marcar campos clave
            t_lower = title.lower()
            es_clave = any(k in t_lower for k in ["cedula","nombre","programa","perfil","area"])
            marca = " <-- CAMPO CLAVE" if es_clave else ""

            print(f"  [{entry_id}]")
            print(f"    Titulo : {title}{marca}")
            print(f"    Tipo   : {tipo}")
            if opciones:
                print(f"    Opciones ({len(opciones)}):")
                for op in opciones[:10]:  # mostrar max 10
                    print(f"      - '{op}'")
                if len(opciones) > 10:
                    print(f"      ... y {len(opciones)-10} mas")
            print()

    print("=" * 65)
    print("  FIN DEL DIAGNOSTICO")
    print("=" * 65)

if __name__ == "__main__":
    main()
