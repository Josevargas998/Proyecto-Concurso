# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
profesionalizar_sheets.py
--------------------------
Deja el Google Sheets del Concurso de Meritos limpio y profesional:
  1. Elimina columnas basura (hlol, Column 8..17)
  2. Reordena pestanas: Formulario 1 -> 2 -> 3 -> 4
  3. Congela la fila de encabezados en cada pestana
  4. Aplica color institucional a cada tab (por etapa)
  5. Aplica formato al encabezado: fondo morado UQ, texto blanco, negrita
  6. Ajusta ancho de columnas clave automaticamente
"""

import os, re
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow

SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"

# Orden logico del proceso
ORDEN_DESEADO = [
    "Respuestas de formulario 1",
    "Respuestas de formulario 2",
    "Respuestas de formulario 3",
    "Respuestas de formulario 4",
]

# Color por pestaña (RGB hex, sin #)  — paleta institucional Universidad del Quindio
COLORES_TAB = {
    "Respuestas de formulario 1": {"red": 0.38, "green": 0.49, "blue": 0.55},   # Teal oscuro
    "Respuestas de formulario 2": {"red": 0.45, "green": 0.31, "blue": 0.64},   # Morado UQ
    "Respuestas de formulario 3": {"red": 0.20, "green": 0.49, "blue": 0.47},   # Verde esmeralda
    "Respuestas de formulario 4": {"red": 0.13, "green": 0.35, "blue": 0.59},   # Azul institucional
}

# Color encabezado (fondo morado UQ oscuro)
COLOR_HEADER_BG = {"red": 0.29, "green": 0.19, "blue": 0.49}
COLOR_HEADER_TEXT = {"red": 1.0, "green": 1.0, "blue": 1.0}

# Patrones de columnas a eliminar automaticamente
PATRONES_ELIMINAR = [
    r"^hlol$",
    r"^column\s*\d+$",   # "Column 8", "Column 9", etc.
    r"^columna\s*\d+$",
    r"^test$",
    r"^prueba$",
]

COLUMNAS_PROTEGIDAS = [
    "enlace documento", "llenar formulario", "fecha", "cedula",
    "nombre", "programa", "perfil", "radicad", "correo",
    "marca temporal", "observacion", "concepto", "puntaje",
    "criterio", "experiencia", "nivel", "titulo", "justificacion",
    "articulo", "libro", "productividad", "categoria", "remuner",
    "ingreso", "carrera", "verificacion", "calificacion",
]

# ─────────────────────────────────────────────────
def autenticar():
    SCOPES = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
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

def col_letter(n):
    s = ""
    while n > 0:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s

def es_basura(nombre_col):
    nc = str(nombre_col).strip().lower()
    for prot in COLUMNAS_PROTEGIDAS:
        if prot in nc:
            return False
    for pat in PATRONES_ELIMINAR:
        if re.fullmatch(pat, nc, re.IGNORECASE):
            return True
    return False

def col_vacia(values, col_idx):
    for fila in values[1:]:
        if col_idx < len(fila) and str(fila[col_idx]).strip():
            return False
    return True

# ─────────────────────────────────────────────────
# 1. DETECTAR COLUMNAS BASURA
# ─────────────────────────────────────────────────
def detectar_basura(service, sheet_name):
    res = service.spreadsheets().values().get(
        spreadsheetId=SS_ID, range=f"'{sheet_name}'!A1:ZZ500"
    ).execute()
    values = res.get("values", [])
    if not values:
        return []
    headers = values[0]
    basura = []
    seen = {}
    for i, h in enumerate(headers):
        h_str = str(h).strip()
        h_lower = h_str.lower()
        if h_lower in seen:
            basura.append({"idx": i, "letra": col_letter(i+1), "nombre": h_str, "razon": "Duplicada"})
        elif es_basura(h_str):
            if col_vacia(values, i):
                basura.append({"idx": i, "letra": col_letter(i+1), "nombre": h_str, "razon": "Basura vacia"})
            else:
                # Tiene datos pero nombre es basura -> eliminar de todas formas (hlol, Column N)
                basura.append({"idx": i, "letra": col_letter(i+1), "nombre": h_str, "razon": "Nombre basura"})
        seen[h_lower] = i
    return basura

# ─────────────────────────────────────────────────
# 2. ELIMINAR COLUMNAS
# ─────────────────────────────────────────────────
def eliminar_columnas(service, sheet_id_num, columnas):
    if not columnas:
        return 0
    reqs = []
    for c in sorted(columnas, key=lambda x: x["idx"], reverse=True):
        reqs.append({"deleteDimension": {
            "range": {"sheetId": sheet_id_num, "dimension": "COLUMNS",
                      "startIndex": c["idx"], "endIndex": c["idx"] + 1}
        }})
    service.spreadsheets().batchUpdate(
        spreadsheetId=SS_ID, body={"requests": reqs}
    ).execute()
    return len(reqs)

# ─────────────────────────────────────────────────
# 3. REORDENAR PESTAÑAS
# ─────────────────────────────────────────────────
def reordenar_pestanas(service, all_sheets):
    name_to_id = {s["properties"]["title"]: s["properties"]["sheetId"] for s in all_sheets}
    reqs = []
    for idx, nombre in enumerate(ORDEN_DESEADO):
        if nombre in name_to_id:
            reqs.append({"updateSheetProperties": {
                "properties": {"sheetId": name_to_id[nombre], "index": idx},
                "fields": "index"
            }})
    if reqs:
        service.spreadsheets().batchUpdate(
            spreadsheetId=SS_ID, body={"requests": reqs}
        ).execute()

# ─────────────────────────────────────────────────
# 4. COLOR DE PESTAÑA + CONGELAR FILA 1
# ─────────────────────────────────────────────────
def aplicar_tab_formato(service, all_sheets):
    reqs = []
    for sheet in all_sheets:
        props = sheet["properties"]
        nombre = props["title"]
        sid = props["sheetId"]
        
        # Color de la pestaña
        color = COLORES_TAB.get(nombre)
        if color:
            reqs.append({"updateSheetProperties": {
                "properties": {
                    "sheetId": sid,
                    "tabColor": color,
                    "tabColorStyle": {"rgbColor": color},
                },
                "fields": "tabColor,tabColorStyle"
            }})
        
        # Congelar fila 1
        reqs.append({"updateSheetProperties": {
            "properties": {
                "sheetId": sid,
                "gridProperties": {"frozenRowCount": 1},
            },
            "fields": "gridProperties.frozenRowCount"
        }})
    
    if reqs:
        service.spreadsheets().batchUpdate(
            spreadsheetId=SS_ID, body={"requests": reqs}
        ).execute()

# ─────────────────────────────────────────────────
# 5. FORMATO HEADER (fondo morado, texto blanco, negrita, centrado)
# ─────────────────────────────────────────────────
def aplicar_formato_header(service, all_sheets):
    reqs = []
    for sheet in all_sheets:
        props = sheet["properties"]
        sid = props["sheetId"]
        n_cols = props.get("gridProperties", {}).get("columnCount", 50)
        
        reqs.append({
            "repeatCell": {
                "range": {
                    "sheetId": sid,
                    "startRowIndex": 0,
                    "endRowIndex": 1,
                    "startColumnIndex": 0,
                    "endColumnIndex": n_cols,
                },
                "cell": {
                    "userEnteredFormat": {
                        "backgroundColor": COLOR_HEADER_BG,
                        "backgroundColorStyle": {"rgbColor": COLOR_HEADER_BG},
                        "textFormat": {
                            "foregroundColor": COLOR_HEADER_TEXT,
                            "foregroundColorStyle": {"rgbColor": COLOR_HEADER_TEXT},
                            "bold": True,
                            "fontSize": 10,
                        },
                        "horizontalAlignment": "CENTER",
                        "verticalAlignment": "MIDDLE",
                        "wrapStrategy": "WRAP",
                    }
                },
                "fields": "userEnteredFormat(backgroundColor,backgroundColorStyle,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)",
            }
        })
        
        # Altura fila encabezado = 40px para que quepan nombres largos
        reqs.append({
            "updateDimensionProperties": {
                "range": {"sheetId": sid, "dimension": "ROWS",
                           "startIndex": 0, "endIndex": 1},
                "properties": {"pixelSize": 55},
                "fields": "pixelSize"
            }
        })
    
    if reqs:
        service.spreadsheets().batchUpdate(
            spreadsheetId=SS_ID, body={"requests": reqs}
        ).execute()

# ─────────────────────────────────────────────────
# 6. FORMATO DATOS (filas alternas, fuente limpia)
# ─────────────────────────────────────────────────
def aplicar_formato_datos(service, all_sheets):
    COLOR_FILA_PAR   = {"red": 0.95, "green": 0.93, "blue": 0.98}  # lila muy claro
    COLOR_FILA_IMPAR = {"red": 1.0,  "green": 1.0,  "blue": 1.0}   # blanco

    reqs = []
    for sheet in all_sheets:
        props = sheet["properties"]
        sid = props["sheetId"]
        n_cols = props.get("gridProperties", {}).get("columnCount", 50)
        n_rows = props.get("gridProperties", {}).get("rowCount", 100)

        # Filas alternas (1 a 100 para no sobrecargar)
        for row_idx in range(1, min(n_rows, 100)):
            color = COLOR_FILA_PAR if row_idx % 2 == 0 else COLOR_FILA_IMPAR
            reqs.append({
                "repeatCell": {
                    "range": {
                        "sheetId": sid,
                        "startRowIndex": row_idx,
                        "endRowIndex": row_idx + 1,
                        "startColumnIndex": 0,
                        "endColumnIndex": n_cols,
                    },
                    "cell": {
                        "userEnteredFormat": {
                            "backgroundColor": color,
                            "backgroundColorStyle": {"rgbColor": color},
                            "textFormat": {"fontSize": 10},
                            "verticalAlignment": "MIDDLE",
                        }
                    },
                    "fields": "userEnteredFormat(backgroundColor,backgroundColorStyle,textFormat,verticalAlignment)",
                }
            })

    # Aplicar en lotes de 100 requests para no exceder límite
    for i in range(0, len(reqs), 100):
        lote = reqs[i:i+100]
        service.spreadsheets().batchUpdate(
            spreadsheetId=SS_ID, body={"requests": lote}
        ).execute()

# ─────────────────────────────────────────────────
# 7. AJUSTAR ANCHO COLUMNAS CLAVE
# ─────────────────────────────────────────────────
def ajustar_anchos(service, all_sheets):
    reqs = []
    for sheet in all_sheets:
        sid = sheet["properties"]["sheetId"]
        n_cols = sheet["properties"].get("gridProperties", {}).get("columnCount", 30)
        # Columna A (timestamp): angosta
        reqs.append({"updateDimensionProperties": {
            "range": {"sheetId": sid, "dimension": "COLUMNS", "startIndex": 0, "endIndex": 1},
            "properties": {"pixelSize": 130},
            "fields": "pixelSize"
        }})
        # Columnas B y C (cedula y nombre): medianas
        reqs.append({"updateDimensionProperties": {
            "range": {"sheetId": sid, "dimension": "COLUMNS", "startIndex": 1, "endIndex": 3},
            "properties": {"pixelSize": 160},
            "fields": "pixelSize"
        }})
        # Resto: auto-ajuste
        reqs.append({"autoResizeDimensions": {
            "dimensions": {"sheetId": sid, "dimension": "COLUMNS",
                           "startIndex": 3, "endIndex": min(n_cols, 40)}
        }})
    if reqs:
        service.spreadsheets().batchUpdate(
            spreadsheetId=SS_ID, body={"requests": reqs}
        ).execute()

# ─────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  PROFESIONALIZANDO EL GOOGLE SHEETS DEL CONCURSO")
    print("=" * 60)

    service = autenticar()
    print("\n[1/7] Autenticacion exitosa.")

    meta = service.spreadsheets().get(spreadsheetId=SS_ID).execute()
    all_sheets = meta.get("sheets", [])
    print(f"[2/7] {len(all_sheets)} hojas encontradas.")

    # Paso 1: Eliminar columnas basura en cada hoja
    print("\n[3/7] Limpiando columnas basura...")
    total_eliminadas = 0
    for sheet in all_sheets:
        nombre = sheet["properties"]["title"]
        sid    = sheet["properties"]["sheetId"]
        basura = detectar_basura(service, nombre)
        if basura:
            n = eliminar_columnas(service, sid, basura)
            total_eliminadas += n
            for c in basura:
                print(f"  [-] '{nombre}': columna [{c['letra']}] '{c['nombre']}' eliminada.")
        else:
            print(f"  [OK] '{nombre}': sin columnas basura.")
    print(f"  Total eliminadas: {total_eliminadas}")

    # Recargar metadata post-eliminacion
    meta = service.spreadsheets().get(spreadsheetId=SS_ID).execute()
    all_sheets = meta.get("sheets", [])

    # Paso 2: Reordenar pestanas
    print("\n[4/7] Reordenando pestanas (1 -> 2 -> 3 -> 4)...")
    reordenar_pestanas(service, all_sheets)
    print("  [OK] Pestanas reordenadas.")

    # Paso 3: Color de tab + congelar fila 1
    print("\n[5/7] Aplicando colores de pestana y congelando encabezados...")
    aplicar_tab_formato(service, all_sheets)
    print("  [OK] Colores y freeze aplicados.")

    # Paso 4: Formato profesional del encabezado
    print("\n[6/7] Formateando fila de encabezados (morado UQ, blanco, negrita)...")
    aplicar_formato_header(service, all_sheets)
    print("  [OK] Encabezados formateados.")

    # Paso 5: Filas alternas en datos
    print("\n[6b/7] Aplicando filas alternas en datos...")
    aplicar_formato_datos(service, all_sheets)
    print("  [OK] Formato de datos aplicado.")

    # Paso 6: Ajustar anchos
    print("\n[7/7] Ajustando ancho de columnas...")
    ajustar_anchos(service, all_sheets)
    print("  [OK] Anchos ajustados.")

    print("\n" + "=" * 60)
    print("  LISTO - El Google Sheets quedo profesional.")
    print("  Pestanas en orden: Form 1 > Form 2 > Form 3 > Form 4")
    print("  Encabezados: fondo morado UQ, texto blanco, negrita")
    print("  Filas alternas lila/blanco para facil lectura")
    print("  Columnas basura eliminadas")
    print("=" * 60)

if __name__ == "__main__":
    main()
