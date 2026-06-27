# -*- coding: utf-8 -*-
import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

FORM2_ID = "1xoVPJ8jAjrUibp-jH8zIhmdNe6r7Ilx9aPiFQUETSI4"
BUSCAR = ["cedula", "nombre", "programa", "perfil", "area"]

creds = Credentials.from_authorized_user_file("token.json",
    ["https://www.googleapis.com/auth/forms.body.readonly"])
if not creds.valid and creds.expired and creds.refresh_token:
    creds.refresh(Request())
svc = build("forms", "v1", credentials=creds)

form = svc.forms().get(formId=FORM2_ID).execute()
print("=== CAMPOS CLAVE DEL FORMULARIO 2 ===\n")
for item in form.get("items", []):
    titulo = item.get("title", "")
    if any(k in titulo.lower() for k in BUSCAR):
        qi = item.get("questionItem", {})
        q  = qi.get("question", {})
        qid = q.get("questionId", "N/A")
        tipo = "TEXTO_LIBRE"
        opts = []
        if "choiceQuestion" in q:
            tipo = q["choiceQuestion"].get("type", "CHOICE")
            opts = [o.get("value","") for o in q["choiceQuestion"].get("options", [])]
        print(f"  [entry.{qid}]  '{titulo}'  Tipo: {tipo}")
        for o in opts:
            print(f"    -> '{o}'")
        print()
