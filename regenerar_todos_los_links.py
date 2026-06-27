# -*- coding: utf-8 -*-
import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
corregir_links.py
------------------
El error anterior fue usar el ID de edicion del formulario en lugar del
ID publicado (responderUri). Este script:
  1. Lee el responderUri de cada formulario via la API (el ID correcto para /viewform)
  2. Regenera todos los enlaces pre-llenados con el ID correcto
  3. Los escribe en el Sheets
"""
from urllib.parse import urlencode, quote
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow

SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"
HOJA  = "Respuestas de formulario 1"

# IDs de edicion (para acceder via Forms API)
F2_EDIT_ID = "1xoVPJ8jAjrUibp-jH8zIhmdNe6r7Ilx9aPiFQUETSI4"
F3_EDIT_ID = "1DP9UE2oQJ2vCA3bV7oTnvUMW7xA5xiSiS-F96_8nnm8"
F4_EDIT_ID = "1A-YFD_8xGqwe-Dh3viMGerN6_Uj2agPRR_X8KuIwJlA"

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

def get_form_info(forms_svc, edit_id):
    """Retorna (responder_url_base, dict_entry_ids) del formulario."""
    form = forms_svc.forms().get(formId=edit_id).execute()
    
    # El responderUri es la URL publica correcta, ej:
    # https://docs.google.com/forms/d/e/1FAIpQLSxxx.../viewform
    responder_uri = form.get("responderUri", "")
    print(f"    responderUri: {responder_uri}")
    
    # Detectar entry IDs de campos clave
    ids = {"cedula": None, "nombre": None, "programa": None, "perfil": None}
    for item in form.get("items", []):
        titulo = item.get("title", "").lower()
        qi = item.get("questionItem", {})
        q  = qi.get("question", {})
        qid = q.get("questionId", None)
        if not qid:
            continue
        if ("cedula" in titulo or "c.c" in titulo) and not ids["cedula"]:
            ids["cedula"] = qid
        elif ("nombre" in titulo and "recibe" not in titulo 
              and "evaluador" not in titulo and "miembro" not in titulo 
              and not ids["nombre"]):
            ids["nombre"] = qid
        elif "programa" in titulo and not ids["programa"]:
            ids["programa"] = qid
        elif "perfil" in titulo and not ids["perfil"]:
            ids["perfil"] = qid
    
    print(f"    cedula   -> entry.{ids['cedula']}")
    print(f"    nombre   -> entry.{ids['nombre']}")
    print(f"    programa -> entry.{ids['programa']}")
    print(f"    perfil   -> entry.{ids['perfil']}")
    
    return responder_uri, ids

def construir_url(responder_uri, ids, cedula, nombre, programa, perfil):
    """Construye URL pre-llenada correcta usando el responderUri."""
    # Quitar /viewform del final y agregar parametros
    base = responder_uri.replace("/viewform", "")
    params = {"usp": "pp_url"}
    if ids.get("cedula"):
        params[f"entry.{ids['cedula']}"] = cedula
    if ids.get("nombre"):
        params[f"entry.{ids['nombre']}"] = nombre
    if ids.get("programa") and programa:
        params[f"entry.{ids['programa']}"] = programa
    if ids.get("perfil") and perfil:
        params[f"entry.{ids['perfil']}"] = perfil
    return base + "/viewform?" + urlencode(params, quote_via=quote)

def col_letter(n):
    s = ""
    while n > 0:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s

def main():
    print("=" * 65)
    print("  CORRIGIENDO ENLACES PRE-LLENADOS")
    print("  (usando responderUri correcto de cada formulario)")
    print("=" * 65)

    creds = autenticar()
    sheets_svc = build("sheets", "v4", credentials=creds)
    forms_svc  = build("forms", "v1", credentials=creds)

    print("\n  Obteniendo URLs y entry IDs de cada formulario...")
    
    print(f"\n  [Formulario 2 - Verificacion]")
    uri_f2, ids_f2 = get_form_info(forms_svc, F2_EDIT_ID)
    
    print(f"\n  [Formulario 3 - Calificacion]")
    uri_f3, ids_f3 = get_form_info(forms_svc, F3_EDIT_ID)
    
    print(f"\n  [Formulario 4 - Ficha Ingreso]")
    uri_f4, ids_f4 = get_form_info(forms_svc, F4_EDIT_ID)

    # Leer Formulario 1
    res = sheets_svc.spreadsheets().values().get(
        spreadsheetId=SS_ID,
        range=f"'{HOJA}'!A1:ZZ500"
    ).execute()
    values = res.get("values", [])
    headers = values[0]

    def col_idx(nombre_col):
        for i, h in enumerate(headers):
            if h == nombre_col:
                return i
        return None

    ci_cedula   = col_idx("Cedula de Ciudadania")
    ci_nombre   = col_idx("Nombre Completo del Candidato")
    ci_programa = col_idx("Programa Academico al que Concursa")
    ci_perfil   = col_idx("Perfil del Cargo (segun convocatoria)")
    ci_link2    = col_idx("Llenar Formulario 2")
    ci_link3    = col_idx("Llenar Formulario 3")
    ci_link4    = col_idx("Llenar Formulario 4")

    print(f"\n  Generando links para {len(values)-1} candidato(s)...\n")
    updates = []

    for r in range(1, len(values)):
        fila = values[r]
        def get(ci):
            return str(fila[ci]).strip() if ci is not None and ci < len(fila) else ""

        cedula   = get(ci_cedula)
        nombre   = get(ci_nombre)
        programa = get(ci_programa)
        perfil   = get(ci_perfil)

        if not cedula or not nombre:
            print(f"  Fila {r+1}: vacia, saltando.")
            continue

        print(f"  [{r+1}] {nombre} | CC:{cedula} | {perfil}")

        link2 = construir_url(uri_f2, ids_f2, cedula, nombre, programa, perfil)
        link3 = construir_url(uri_f3, ids_f3, cedula, nombre, programa, perfil)
        link4 = construir_url(uri_f4, ids_f4, cedula, nombre, programa, perfil)

        print(f"       F2: {link2[:90]}...")

        fila_s = r + 1
        updates += [
            {"range": f"'{HOJA}'!{col_letter(ci_link2+1)}{fila_s}", "values": [[link2]]},
            {"range": f"'{HOJA}'!{col_letter(ci_link3+1)}{fila_s}", "values": [[link3]]},
            {"range": f"'{HOJA}'!{col_letter(ci_link4+1)}{fila_s}", "values": [[link4]]},
        ]

    if updates:
        sheets_svc.spreadsheets().values().batchUpdate(
            spreadsheetId=SS_ID,
            body={"valueInputOption": "USER_ENTERED", "data": updates}
        ).execute()
        print(f"\n  [OK] {len(updates)//3} candidatos actualizados con URLs correctas.")

    print("\n" + "=" * 65)
    print("  LISTO - Los enlaces ahora apuntan a la URL publica correcta")
    print("  del formulario e incluyen: cedula, nombre, programa y perfil.")
    print("=" * 65)

if __name__ == "__main__":
    main()
