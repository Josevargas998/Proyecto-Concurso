# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
fusionar_radicado.py
---------------------
- Deja UNA sola columna 'Numero de Radicado' en Formulario 1
- Borra datos de prueba (no numericos / claramente invalidos)
- Consolida todos los radicados validos en esa columna
- Elimina la columna duplicada
"""

import os, re, unicodedata
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow

SS_ID  = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"
HOJA   = "Respuestas de formulario 1"

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
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return s.lower().strip()

def col_letter(n):
    s = ""
    while n > 0:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s

def es_radicado_valido(val):
    """Un radicado valido es solo numerico (puede tener guiones o espacios)."""
    v = str(val).strip()
    if not v:
        return False
    # Acepta: numeros, guiones, barras (formato 2026-001, etc.)
    return bool(re.match(r'^[\d\-/]+$', v))

def main():
    print("=" * 60)
    print("  FUSION Y LIMPIEZA: Numero de Radicado")
    print("=" * 60)

    svc = autenticar()

    res = svc.spreadsheets().values().get(
        spreadsheetId=SS_ID,
        range=f"'{HOJA}'!A1:ZZ500"
    ).execute()
    values = res.get("values", [])
    headers = values[0]

    # Encontrar todas las columnas de radicado
    TARGET = "numero de radicado"
    cols_radicado = []
    for i, h in enumerate(headers):
        if normalizar(str(h)) == TARGET:
            cols_radicado.append({"idx": i, "letra": col_letter(i+1), "nombre": str(h)})

    print(f"\n  Columnas de radicado encontradas: {len(cols_radicado)}")
    for c in cols_radicado:
        print(f"    [{c['letra']}] '{c['nombre']}'")

    # La columna principal sera la primera (Q)
    principal = cols_radicado[0]
    duplicadas = cols_radicado[1:]

    # Consolidar: para cada fila, buscar el mejor valor de radicado
    updates = []
    limpiezas = []

    for r in range(1, len(values)):
        # Recoger todos los valores de las columnas de radicado
        vals = []
        for c in cols_radicado:
            v = values[r][c["idx"]] if c["idx"] < len(values[r]) else ""
            vals.append(str(v).strip())

        # Seleccionar el mejor: primero valido numericamente
        mejor = ""
        for v in vals:
            if es_radicado_valido(v):
                mejor = v
                break

        val_principal_actual = values[r][principal["idx"]] if principal["idx"] < len(values[r]) else ""
        val_principal_actual = str(val_principal_actual).strip()

        if val_principal_actual != mejor:
            rango = f"'{HOJA}'!{principal['letra']}{r+1}"
            updates.append({"range": rango, "values": [[mejor]]})
            if val_principal_actual and not es_radicado_valido(val_principal_actual):
                limpiezas.append(f"  Fila {r+1}: '{val_principal_actual}' (dato de prueba) -> '{mejor}'")
            elif not val_principal_actual and mejor:
                limpiezas.append(f"  Fila {r+1}: (vacio) -> '{mejor}' (copiado de columna duplicada)")
            else:
                limpiezas.append(f"  Fila {r+1}: '{val_principal_actual}' -> '{mejor}'")

    print(f"\n  Correcciones a aplicar en '{principal['nombre']}':")
    if limpiezas:
        for l in limpiezas:
            print(l)
    else:
        print("  Ningun cambio necesario en la columna principal.")

    print(f"\n  Columnas a eliminar (duplicadas): {len(duplicadas)}")
    for d in duplicadas:
        print(f"    [{d['letra']}] '{d['nombre']}'")

    # --- APLICAR CAMBIOS ---
    print("\n  Aplicando cambios...")

    # 1. Actualizar valores
    if updates:
        svc.spreadsheets().values().batchUpdate(
            spreadsheetId=SS_ID,
            body={"valueInputOption": "USER_ENTERED", "data": updates}
        ).execute()
        print(f"  [OK] {len(updates)} celdas actualizadas.")

    # 2. Renombrar encabezado de la columna principal a forma estandar sin tilde
    rango_header = f"'{HOJA}'!{principal['letra']}1"
    svc.spreadsheets().values().update(
        spreadsheetId=SS_ID,
        range=rango_header,
        valueInputOption="USER_ENTERED",
        body={"values": [["Numero de Radicado"]]}
    ).execute()
    print(f"  [OK] Encabezado normalizado a 'Numero de Radicado'.")

    # 3. Eliminar columnas duplicadas
    if duplicadas:
        meta = svc.spreadsheets().get(spreadsheetId=SS_ID).execute()
        sheet_id_num = next(
            s["properties"]["sheetId"]
            for s in meta["sheets"]
            if s["properties"]["title"] == HOJA
        )
        reqs = []
        for d in sorted(duplicadas, key=lambda x: x["idx"], reverse=True):
            reqs.append({"deleteDimension": {
                "range": {
                    "sheetId": sheet_id_num,
                    "dimension": "COLUMNS",
                    "startIndex": d["idx"],
                    "endIndex": d["idx"] + 1
                }
            }})
        svc.spreadsheets().batchUpdate(
            spreadsheetId=SS_ID, body={"requests": reqs}
        ).execute()
        print(f"  [OK] {len(reqs)} columna(s) duplicada(s) eliminada(s).")

    print("\n" + "=" * 60)
    print("  LISTO - Una sola columna 'Numero de Radicado' limpia.")
    print("  Datos de prueba eliminados. Solo quedan radicados validos.")
    print("=" * 60)

if __name__ == "__main__":
    main()
