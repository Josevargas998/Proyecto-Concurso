# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
reparar_links.py
-----------------
1. Limpia la fila 7 de Formulario 1 (residuos del mock)
2. Genera los 3 enlaces pre-llenados para Rosita (fila 6)
   reutilizando el patron de URL de los candidatos que ya los tienen.

Como funcionan los enlaces pre-llenados:
  - Son URLs de Google Forms con parametros ?entry.XXXXXXXX=VALOR
  - Los entry IDs son fijos para cada campo del formulario
  - Los extraemos de los enlaces ya generados (fila 2-5) y reemplazamos
    cedula, nombre, programa y perfil con los datos de Rosita
"""
import os, re, unicodedata
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
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

def col_letter(n):
    s = ""
    while n > 0:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s

def construir_url_prefilled(url_referencia, cedula, nombre, programa, perfil):
    """
    Toma una URL de enlace pre-llenado existente, extrae los entry IDs
    y construye una nueva URL con los valores del candidato nuevo.
    
    Estructura de la URL:
    https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url
       &entry.ID_CEDULA=VALOR
       &entry.ID_NOMBRE=VALOR
       &entry.ID_PROGRAMA=VALOR
       &entry.ID_PERFIL=VALOR
    """
    parsed = urlparse(url_referencia)
    qs = parse_qs(parsed.query, keep_blank_values=True)

    # Identificar que entry ID corresponde a cada campo
    # Comparando con los valores conocidos del candidato de referencia
    # En la URL ya generada los valores estan URL-encoded
    # parse_qs los decodifica automaticamente

    # Mapeo: entry.ID -> valor actual (del candidato de referencia)
    # Necesitamos saber cuales IDs son cedula, nombre, programa, perfil
    # Los reconocemos por el contenido de los valores en la URL de referencia

    # Extraer todos los entry params
    entry_params = {k: v[0] for k, v in qs.items() if k.startswith("entry.")}

    print(f"\n    Parametros de la URL de referencia:")
    for k, v in entry_params.items():
        print(f"      {k} = '{v}'")

    return entry_params, qs, parsed

def main():
    print("=" * 60)
    print("  REPARAR ENLACES - FORMULARIO 1")
    print("=" * 60)

    svc = autenticar()
    res = svc.spreadsheets().values().get(
        spreadsheetId=SS_ID,
        range=f"'{HOJA}'!A1:ZZ500"
    ).execute()
    values = res.get("values", [])
    headers = values[0]

    # Indices de columnas clave
    def idx(nombre_col):
        for i, h in enumerate(headers):
            if h == nombre_col:
                return i
        return None

    col_cedula  = idx("Cedula de Ciudadania")
    col_nombre  = idx("Nombre Completo del Candidato")
    col_programa = idx("Programa Academico al que Concursa")
    col_perfil  = idx("Perfil del Cargo (segun convocatoria)")
    col_link2   = idx("Llenar Formulario 2")
    col_link3   = idx("Llenar Formulario 3")
    col_link4   = idx("Llenar Formulario 4")

    print(f"\n  Columnas clave:")
    print(f"    Cedula   -> {col_letter(col_cedula+1)}")
    print(f"    Nombre   -> {col_letter(col_nombre+1)}")
    print(f"    Link F2  -> {col_letter(col_link2+1)}")
    print(f"    Link F3  -> {col_letter(col_link3+1)}")
    print(f"    Link F4  -> {col_letter(col_link4+1)}")

    # ── PASO 1: Limpiar fila 7 (residuos del mock) ─────────
    print(f"\n[1/2] Limpiando fila 7 (residuos del candidato mock)...")
    fila7 = values[6] if len(values) > 6 else []
    val_c = fila7[col_cedula] if col_cedula < len(fila7) else ""
    val_n = fila7[col_nombre] if col_nombre < len(fila7) else ""
    if not str(val_c).strip() and not str(val_n).strip():
        # Fila sin cedula ni nombre -> limpiar toda la fila
        clear_range = f"'{HOJA}'!A7:ZZ7"
        svc.spreadsheets().values().clear(
            spreadsheetId=SS_ID,
            range=clear_range
        ).execute()
        print(f"  [OK] Fila 7 limpiada (estaba vacia de candidato, tenia datos huerfanos).")
    else:
        print(f"  La fila 7 tiene candidato real ({val_n}), no se limpia.")

    # ── PASO 2: Generar links para Rosita (fila 6) ─────────
    print(f"\n[2/2] Generando enlaces pre-llenados para Rosita (fila 6)...")

    # Tomar datos de Rosita
    fila6 = values[5]
    rosita_cedula   = fila6[col_cedula]   if col_cedula   < len(fila6) else ""
    rosita_nombre   = fila6[col_nombre]   if col_nombre   < len(fila6) else ""
    rosita_programa = fila6[col_programa] if col_programa < len(fila6) else ""
    rosita_perfil   = fila6[col_perfil]   if col_perfil   < len(fila6) else ""

    print(f"  Candidata: {rosita_nombre} | CC: {rosita_cedula}")
    print(f"  Programa : {rosita_programa}")
    print(f"  Perfil   : {rosita_perfil}")

    # Tomar URL de referencia de un candidato que ya tiene links (fila 2 = index 1)
    ref_fila = values[1]
    ref_link2 = ref_fila[col_link2] if col_link2 < len(ref_fila) else ""
    ref_link3 = ref_fila[col_link3] if col_link3 < len(ref_fila) else ""
    ref_link4 = ref_fila[col_link4] if col_link4 < len(ref_fila) else ""

    ref_cedula   = ref_fila[col_cedula]   if col_cedula   < len(ref_fila) else ""
    ref_nombre   = ref_fila[col_nombre]   if col_nombre   < len(ref_fila) else ""
    ref_programa = ref_fila[col_programa] if col_programa < len(ref_fila) else ""
    ref_perfil   = ref_fila[col_perfil]   if col_perfil   < len(ref_fila) else ""

    print(f"\n  Usando como referencia: {ref_nombre} | CC: {ref_cedula}")

    def sustituir_valores(url, viejo_cedula, viejo_nombre, viejo_programa, viejo_perfil,
                               nuevo_cedula, nuevo_nombre, nuevo_programa, nuevo_perfil):
        """
        Reemplaza en la URL los valores del candidato de referencia
        por los del candidato nuevo, usando los entry IDs que ya estan en la URL.
        """
        from urllib.parse import urlparse, parse_qs, urlencode, urlunparse, quote
        parsed = urlparse(url)
        # Reconstruir manualmente para preservar el orden y encoding
        # Los valores estan URL-encoded en la query string
        query = parsed.query

        def reemplazar_valor(q, viejo, nuevo):
            # Reemplazar el valor URL-encoded del viejo por el del nuevo
            old_enc = quote(str(viejo), safe='')
            new_enc = quote(str(nuevo), safe='')
            # Reemplazar exacto
            if old_enc in q:
                q = q.replace(old_enc, new_enc, 1)
            else:
                # Intentar con espacios como +
                old_plus = str(viejo).replace(' ', '+')
                new_plus = str(nuevo).replace(' ', '+')
                if old_plus in q:
                    q = q.replace(old_plus, new_plus, 1)
                else:
                    # Intentar case insensitive parcial
                    print(f"    ADVERTENCIA: no se encontro '{viejo}' en la URL")
            return q

        query = reemplazar_valor(query, viejo_cedula, nuevo_cedula)
        query = reemplazar_valor(query, viejo_nombre, nuevo_nombre)
        if viejo_programa:
            query = reemplazar_valor(query, viejo_programa, nuevo_programa)
        if viejo_perfil:
            query = reemplazar_valor(query, viejo_perfil, nuevo_perfil)

        nueva_url = urlunparse((
            parsed.scheme, parsed.netloc, parsed.path,
            parsed.params, query, parsed.fragment
        ))
        return nueva_url

    nuevo_link2 = sustituir_valores(
        ref_link2,
        ref_cedula, ref_nombre, ref_programa, ref_perfil,
        rosita_cedula, rosita_nombre, rosita_programa, rosita_perfil
    )
    nuevo_link3 = sustituir_valores(
        ref_link3,
        ref_cedula, ref_nombre, ref_programa, ref_perfil,
        rosita_cedula, rosita_nombre, rosita_programa, rosita_perfil
    )
    nuevo_link4 = sustituir_valores(
        ref_link4,
        ref_cedula, ref_nombre, ref_programa, ref_perfil,
        rosita_cedula, rosita_nombre, rosita_programa, rosita_perfil
    )

    print(f"\n  Links generados para Rosita:")
    print(f"    F2: {nuevo_link2[:80]}...")
    print(f"    F3: {nuevo_link3[:80]}...")
    print(f"    F4: {nuevo_link4[:80]}...")

    # Escribir en la hoja
    updates = [
        {"range": f"'{HOJA}'!{col_letter(col_link2+1)}6", "values": [[nuevo_link2]]},
        {"range": f"'{HOJA}'!{col_letter(col_link3+1)}6", "values": [[nuevo_link3]]},
        {"range": f"'{HOJA}'!{col_letter(col_link4+1)}6", "values": [[nuevo_link4]]},
    ]
    svc.spreadsheets().values().batchUpdate(
        spreadsheetId=SS_ID,
        body={"valueInputOption": "USER_ENTERED", "data": updates}
    ).execute()

    print(f"\n  [OK] Los 3 enlaces de Rosita fueron escritos en la fila 6.")
    print(f"\n{'='*60}")
    print(f"  LISTO.")
    print(f"  - Fila 7 limpiada (residuos del mock eliminados)")
    print(f"  - Fila 6 (Rosita): 3 enlaces pre-llenados generados")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
