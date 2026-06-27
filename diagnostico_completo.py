# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
diagnostico_completo.py
------------------------
Revisa TODAS las hojas del concurso buscando:
  1. Columnas con nombres duplicados (normalizados)
  2. Columnas completamente vacias
  3. Datos que parecen de prueba o invalidos
  4. Filas completamente vacias (fantasmas)
  5. Inconsistencias de cedulas entre formularios
"""

import os, re, unicodedata
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow

SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"

HOJAS = [
    "Respuestas de formulario 1",
    "Respuestas de formulario 2",
    "Respuestas de formulario 3",
    "Respuestas de formulario 4",
]

# Palabras/patrones que sugieren dato de prueba
PATRON_PRUEBA = re.compile(
    r"^(test|prueba|mock|ejemplo|sample|asdf|qwerty|rosa\d*|"
    r"juan\s*\d*|pedro\s*\d*|aaaa|bbbb|xxxx|lorem|dummy|fake|n/?a)$",
    re.IGNORECASE
)

# Cedulas deben ser numericas y tener entre 6 y 12 digitos
PATRON_CEDULA = re.compile(r"^\d{6,12}$")

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

def col_letter(n):
    s = ""
    while n > 0:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s

def leer_hoja(svc, nombre):
    res = svc.spreadsheets().values().get(
        spreadsheetId=SS_ID,
        range=f"'{nombre}'!A1:ZZ500"
    ).execute()
    return res.get("values", [])

def diagnosticar_hoja(nombre, values):
    issues = []

    if not values or len(values) < 1:
        issues.append(("ERROR", "Hoja completamente vacia"))
        return issues

    headers = values[0]
    n_filas = len(values) - 1

    # ── 1. COLUMNAS DUPLICADAS (normalizadas) ─────────────────
    seen_norm = {}
    for i, h in enumerate(headers):
        h_norm = normalizar(h)
        if h_norm in seen_norm:
            issues.append((
                "DUPLICADO",
                f"Col [{col_letter(i+1)}] '{h}' es duplicado de "
                f"[{col_letter(seen_norm[h_norm]+1)}] '{headers[seen_norm[h_norm]]}'"
            ))
        else:
            seen_norm[h_norm] = i

    # ── 2. COLUMNAS COMPLETAMENTE VACIAS ──────────────────────
    for i, h in enumerate(headers):
        tiene_dato = any(
            i < len(values[r]) and str(values[r][i]).strip()
            for r in range(1, len(values))
        )
        if not tiene_dato:
            issues.append(("VACIA", f"Col [{col_letter(i+1)}] '{h}' no tiene ningun dato"))

    # ── 3. FILAS FANTASMA (fila con solo timestamps o vacias) ──
    for r in range(1, len(values)):
        fila = values[r]
        datos_significativos = [
            str(v).strip() for v in fila
            if str(v).strip() and not re.match(r"^\d{1,2}/\d{1,2}/\d{4}", str(v))
        ]
        if len(datos_significativos) <= 1:
            issues.append(("FILA_VACIA", f"Fila {r+1} parece estar casi vacia ({len(datos_significativos)} dato(s) util(es))"))

    # ── 4. CEDULAS INVALIDAS ───────────────────────────────────
    col_cedula = None
    for i, h in enumerate(headers):
        h_n = normalizar(h)
        if "cedula" in h_n or "c.c" in h_n or "ciudadania" in h_n:
            col_cedula = i
            break

    if col_cedula is not None:
        for r in range(1, len(values)):
            v = values[r][col_cedula] if col_cedula < len(values[r]) else ""
            v = str(v).strip()
            if v and not PATRON_CEDULA.match(v):
                issues.append(("CEDULA_INVALIDA", f"Fila {r+1}: cedula '{v}' no parece valida (esperado: 6-12 digitos)"))

    # ── 5. DATOS DE PRUEBA ────────────────────────────────────
    for i, h in enumerate(headers):
        h_n = normalizar(h)
        # Solo revisar columnas de texto clave (no puntajes ni fechas)
        if any(k in h_n for k in ["nombre", "observacion", "radicado", "correo"]):
            for r in range(1, len(values)):
                v = values[r][i] if i < len(values[r]) else ""
                v_str = str(v).strip()
                if v_str and PATRON_PRUEBA.match(v_str):
                    issues.append((
                        "DATO_PRUEBA",
                        f"Fila {r+1}, Col [{col_letter(i+1)}] '{h}': "
                        f"valor '{v_str}' parece dato de prueba"
                    ))

    # ── 6. COLUMNAS CON NOMBRE GENERICO ───────────────────────
    for i, h in enumerate(headers):
        h_n = normalizar(h)
        if re.match(r"^column\s*\d+$", h_n) or re.match(r"^columna\s*\d+$", h_n):
            issues.append(("NOMBRE_GENERICO", f"Col [{col_letter(i+1)}] tiene nombre generico: '{h}'"))

    return issues

def main():
    print("=" * 65)
    print("  DIAGNOSTICO COMPLETO - TODAS LAS HOJAS DEL CONCURSO")
    print("=" * 65)

    svc = autenticar()

    # Leer cedulas del formulario 1 como referencia
    values_f1 = leer_hoja(svc, HOJAS[0])
    cedulas_f1 = set()
    if values_f1:
        headers_f1 = values_f1[0]
        col_ced_f1 = next((i for i, h in enumerate(headers_f1)
                           if "cedula" in normalizar(h) or "ciudadania" in normalizar(h)), None)
        if col_ced_f1 is not None:
            for fila in values_f1[1:]:
                v = fila[col_ced_f1] if col_ced_f1 < len(fila) else ""
                v = str(v).strip()
                if v:
                    cedulas_f1.add(v)

    print(f"\n  Cedulas registradas en Formulario 1: {sorted(cedulas_f1)}")

    resumen_global = {}

    for nombre_hoja in HOJAS:
        print(f"\n{'='*65}")
        print(f"  HOJA: {nombre_hoja}")
        print(f"{'='*65}")

        values = leer_hoja(svc, nombre_hoja)
        if not values:
            print("  [!] Hoja vacia o sin acceso.")
            continue

        headers = values[0]
        n_filas = len(values) - 1
        print(f"  Columnas : {len(headers)}")
        print(f"  Filas    : {n_filas}")

        # Mostrar todas las columnas
        print(f"\n  --- Columnas ---")
        seen_n = {}
        for i, h in enumerate(headers):
            h_n = normalizar(h)
            marca = ""
            if h_n in seen_n:
                marca = " <-- DUPLICADO de col " + col_letter(seen_n[h_n]+1)
            seen_n[h_n] = i
            tiene_dato = any(i < len(values[r]) and str(values[r][i]).strip()
                             for r in range(1, len(values)))
            estado = "[OK]" if tiene_dato else "[VACIA]"
            print(f"  {col_letter(i+1):3} {estado:8} {h[:55]}{marca}")

        # Diagnostico
        issues = diagnosticar_hoja(nombre_hoja, values)

        # Cruzar cedulas con Formulario 1 (para formularios 2, 3, 4)
        if nombre_hoja != HOJAS[0]:
            col_ced = next((i for i, h in enumerate(headers)
                            if "cedula" in normalizar(h)), None)
            if col_ced is not None:
                for r in range(1, len(values)):
                    v = values[r][col_ced] if col_ced < len(values[r]) else ""
                    v = str(v).strip()
                    if v and v not in cedulas_f1:
                        issues.append((
                            "CEDULA_NO_REGISTRADA",
                            f"Fila {r+1}: cedula '{v}' no esta en Formulario 1 (candidato no inscrito?)"
                        ))

        print(f"\n  --- Problemas encontrados: {len(issues)} ---")
        if issues:
            tipos = {}
            for tipo, msg in issues:
                tipos.setdefault(tipo, []).append(msg)
                print(f"  [{tipo}] {msg}")
        else:
            print("  [OK] Ninguna anomalia detectada.")

        resumen_global[nombre_hoja] = issues

    # RESUMEN FINAL
    print(f"\n{'='*65}")
    print("  RESUMEN GLOBAL")
    print(f"{'='*65}")
    total_issues = 0
    for hoja, issues in resumen_global.items():
        n = len(issues)
        total_issues += n
        estado = f"{n} problema(s)" if n else "OK"
        print(f"  {hoja:45} -> {estado}")

    print(f"\n  Total de anomalias encontradas: {total_issues}")
    if total_issues:
        print("\n  Revisar arriba para el detalle de cada problema.")
    print("=" * 65)

if __name__ == "__main__":
    main()
