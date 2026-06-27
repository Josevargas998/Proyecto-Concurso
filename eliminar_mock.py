# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
eliminar_mock.py
-----------------
Elimina todas las filas donde la cedula es '1094892345' (candidato de prueba)
de los Formularios 2, 3 y 4.
"""

import os, unicodedata
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow

SS_ID          = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"
CEDULA_MOCK    = "1094892345"

# Hojas y nombre de la columna cedula en cada una
HOJAS_A_LIMPIAR = [
    ("Respuestas de formulario 2", "Cedula del Candidato"),
    ("Respuestas de formulario 3", "Cedula del Candidato"),
    ("Respuestas de formulario 4", "Cedula de Ciudadania"),
]

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
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return s.lower().strip()

def main():
    print("=" * 60)
    print(f"  ELIMINAR CANDIDATO MOCK: cedula {CEDULA_MOCK}")
    print("=" * 60)

    svc = autenticar()

    # Obtener IDs de hojas
    meta = svc.spreadsheets().get(spreadsheetId=SS_ID).execute()
    sheet_id_map = {
        s["properties"]["title"]: s["properties"]["sheetId"]
        for s in meta["sheets"]
    }

    total_filas_eliminadas = 0

    for nombre_hoja, col_cedula_nombre in HOJAS_A_LIMPIAR:
        print(f"\n  Procesando: '{nombre_hoja}'...")

        res = svc.spreadsheets().values().get(
            spreadsheetId=SS_ID,
            range=f"'{nombre_hoja}'!A1:ZZ500"
        ).execute()
        values = res.get("values", [])

        if not values:
            print("    Hoja vacia, saltando.")
            continue

        headers = values[0]

        # Encontrar columna cedula (por nombre normalizado)
        col_ced_idx = None
        for i, h in enumerate(headers):
            if normalizar(h) == normalizar(col_cedula_nombre):
                col_ced_idx = i
                break

        if col_ced_idx is None:
            # Intentar busqueda flexible
            for i, h in enumerate(headers):
                if "cedula" in normalizar(h):
                    col_ced_idx = i
                    break

        if col_ced_idx is None:
            print(f"    No se encontro columna de cedula.")
            continue

        # Encontrar filas a eliminar (de mayor a menor para no desplazar indices)
        filas_mock = []
        for r in range(1, len(values)):
            v = values[r][col_ced_idx] if col_ced_idx < len(values[r]) else ""
            if str(v).strip() == CEDULA_MOCK:
                filas_mock.append(r)  # indice 0-based en 'values', fila real = r+1

        if not filas_mock:
            print(f"    Ningun registro con cedula {CEDULA_MOCK}. OK.")
            continue

        print(f"    Filas a eliminar: {[r+1 for r in filas_mock]}")

        # Mostrar datos de esa fila antes de borrar
        for r in filas_mock:
            nombre_val = ""
            for i, h in enumerate(headers):
                if "nombre" in normalizar(h) and "completo" in normalizar(h):
                    nombre_val = values[r][i] if i < len(values[r]) else ""
                    break
            print(f"    -> Fila {r+1}: {nombre_val} | CC: {CEDULA_MOCK}")

        # Eliminar de mayor a menor (para no desplazar indices)
        sid = sheet_id_map[nombre_hoja]
        reqs = []
        for r in sorted(filas_mock, reverse=True):
            reqs.append({
                "deleteDimension": {
                    "range": {
                        "sheetId": sid,
                        "dimension": "ROWS",
                        "startIndex": r,      # 0-based (fila 0 = headers)
                        "endIndex": r + 1
                    }
                }
            })

        svc.spreadsheets().batchUpdate(
            spreadsheetId=SS_ID, body={"requests": reqs}
        ).execute()

        print(f"    [OK] {len(reqs)} fila(s) eliminada(s).")
        total_filas_eliminadas += len(reqs)

    print(f"\n{'='*60}")
    print(f"  LISTO. Total filas de mock eliminadas: {total_filas_eliminadas}")
    print(f"  Cedula {CEDULA_MOCK} ya no existe en ningun formulario de evaluacion.")
    print("=" * 60)

if __name__ == "__main__":
    main()
