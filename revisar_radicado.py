# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
revisar_radicado.py
--------------------
Analiza las columnas duplicadas de 'Numero de Radicado' 
en 'Respuestas de formulario 1' y las fusiona en una sola.
"""

import os, unicodedata
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow

SS_ID     = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"
HOJA      = "Respuestas de formulario 1"
MODO      = "--fusionar" in sys.argv

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
    """Quita tildes y pasa a minusculas para comparar."""
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return s.lower().strip()

def col_letter(n):
    s = ""
    while n > 0:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s

def main():
    print("=" * 60)
    print("  ANALISIS: columnas duplicadas 'Numero de Radicado'")
    print("=" * 60)

    svc = autenticar()

    res = svc.spreadsheets().values().get(
        spreadsheetId=SS_ID,
        range=f"'{HOJA}'!A1:ZZ500"
    ).execute()
    values = res.get("values", [])

    if not values:
        print("  Hoja vacia.")
        return

    headers = values[0]
    print(f"\n  Total columnas: {len(headers)}")
    print(f"  Total filas de datos: {len(values) - 1}")

    # Buscar TODAS las columnas que al normalizarse sean "numero de radicado"
    TARGET = "numero de radicado"
    encontradas = []
    for i, h in enumerate(headers):
        if normalizar(str(h)) == TARGET:
            encontradas.append({"idx": i, "letra": col_letter(i+1), "nombre": str(h)})

    print(f"\n  Columnas encontradas con nombre similar a 'Numero de Radicado':")
    for c in encontradas:
        datos_col = [values[r][c["idx"]] if c["idx"] < len(values[r]) else "" 
                     for r in range(1, len(values))]
        datos_col = [str(d).strip() for d in datos_col if str(d).strip()]
        print(f"\n    [{c['letra']}] '{c['nombre']}'")
        print(f"         Celdas con datos: {len(datos_col)}")
        for d in datos_col:
            print(f"         -> {d}")

    if len(encontradas) < 2:
        print("\n  [OK] No hay duplicacion real, solo 1 columna.")
        return

    # Decidir cual conservar y cual eliminar
    # Conservamos la que tenga mas datos; en empate, la primera
    def contar_datos(col_info):
        return sum(
            1 for r in range(1, len(values))
            if col_info["idx"] < len(values[r]) and str(values[r][col_info["idx"]]).strip()
        )

    encontradas_con_n = [(c, contar_datos(c)) for c in encontradas]
    encontradas_con_n.sort(key=lambda x: (-x[1], x[0]["idx"]))

    conservar  = encontradas_con_n[0][0]
    eliminar   = [c for c, _ in encontradas_con_n[1:]]

    print(f"\n  DECISION:")
    print(f"    Conservar : [{conservar['letra']}] '{conservar['nombre']}' ({encontradas_con_n[0][1]} datos)")
    for e, n in encontradas_con_n[1:]:
        print(f"    Eliminar  : [{e['letra']}] '{e['nombre']}' ({n} datos)")

    # Si la columna a eliminar tiene datos que la principal no tiene -> fusionar primero
    print(f"\n  FUSION de datos (copiando lo que falte a '{conservar['nombre']}'):")
    updates = []
    for r in range(1, len(values)):
        val_conservar = values[r][conservar["idx"]] if conservar["idx"] < len(values[r]) else ""
        val_conservar = str(val_conservar).strip()
        # Buscar si alguna columna a eliminar tiene dato que la principal no tiene
        for e in eliminar:
            val_elim = values[r][e["idx"]] if e["idx"] < len(values[r]) else ""
            val_elim = str(val_elim).strip()
            if val_elim and not val_conservar:
                rango = f"'{HOJA}'!{conservar['letra']}{r+1}"
                updates.append({"range": rango, "values": [[val_elim]]})
                print(f"    Fila {r+1}: '{val_elim}' copiado desde [{e['letra']}] a [{conservar['letra']}]")
                val_conservar = val_elim  # actualizar en memoria

    if not updates:
        print("    No hay datos que fusionar (la columna principal ya tiene todo).")

    if MODO:
        # Aplicar fusion
        if updates:
            svc.spreadsheets().values().batchUpdate(
                spreadsheetId=SS_ID,
                body={"valueInputOption": "USER_ENTERED", "data": updates}
            ).execute()
            print(f"  [OK] {len(updates)} celdas fusionadas.")

        # Eliminar columnas duplicadas (de mayor a menor indice)
        sheet_meta = svc.spreadsheets().get(spreadsheetId=SS_ID).execute()
        sheet_id_num = next(
            s["properties"]["sheetId"]
            for s in sheet_meta["sheets"]
            if s["properties"]["title"] == HOJA
        )
        reqs = []
        for e in sorted(eliminar, key=lambda x: x["idx"], reverse=True):
            reqs.append({"deleteDimension": {
                "range": {"sheetId": sheet_id_num, "dimension": "COLUMNS",
                          "startIndex": e["idx"], "endIndex": e["idx"] + 1}
            }})
        svc.spreadsheets().batchUpdate(
            spreadsheetId=SS_ID, body={"requests": reqs}
        ).execute()
        print(f"  [OK] {len(reqs)} columna(s) duplicada(s) eliminada(s).")
        print("\n  La hoja quedo con UNA sola columna 'Numero de Radicado'. ✓")
    else:
        print(f"\n  NINGUN CAMBIO aplicado (modo diagnostico).")
        print(f"  Ejecuta: python revisar_radicado.py --fusionar")
        print(f"  para aplicar la fusion y eliminar el duplicado.")

    print("=" * 60)

if __name__ == "__main__":
    main()
