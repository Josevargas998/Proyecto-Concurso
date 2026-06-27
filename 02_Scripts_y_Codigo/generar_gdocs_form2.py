"""
Genera documentos de Google Docs para TODAS las filas del formulario 2
que no tengan documento, y actualiza el enlace en la columna AG del Sheet.
"""
import os
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"
HOJA  = "Respuestas de formulario 2"

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents",
]

def autenticar():
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return creds

def main():
    creds = autenticar()
    sheets  = build("sheets", "v4",    credentials=creds)
    drive   = build("drive",  "v3",    credentials=creds)
    docs    = build("docs",   "v1",    credentials=creds)

    # ── 1. Leer todas las filas ──────────────────────────────
    res = sheets.spreadsheets().values().get(
        spreadsheetId=SS_ID,
        range=f"'{HOJA}'!A1:ZZ500"
    ).execute()
    filas = res.get("values", [])
    if len(filas) < 2:
        print("No hay respuestas en el formulario 2.")
        return

    encabezados = filas[0]
    datos       = filas[1:]

    # ── 2. Detectar columna "Enlace Documento" ───────────────
    col_enlace = None
    for i, h in enumerate(encabezados):
        if "Enlace" in h or "enlace" in h:
            col_enlace = i
            break

    if col_enlace is None:
        col_enlace = len(encabezados)
        encabezados.append("Enlace Documento")
        sheets.spreadsheets().values().update(
            spreadsheetId=SS_ID,
            range="'" + HOJA + "'!A1",
            valueInputOption="USER_ENTERED",
            body={"values": [encabezados]}
        ).execute()

    # Convertir indice a letra de columna (soporta hasta columna ZZ)
    def idx_to_col(n):
        if n < 26:
            return chr(ord('A') + n)
        return chr(ord('A') + n // 26 - 1) + chr(ord('A') + n % 26)

    col_letra = idx_to_col(col_enlace)

    def safe(fila, clave, default=""):
        try:
            idx = encabezados.index(clave)
            return fila[idx] if idx < len(fila) else default
        except:
            return default

    print(f"Total filas: {len(datos)}")
    print(f"Columna 'Enlace Documento': {col_letra} (índice {col_enlace})")
    print()

    generados = 0
    for i, fila in enumerate(datos):
        fila_num  = i + 2  # fila real en el Sheet (1-indexed + encabezado)
        # La fila no tiene el enlace si su longitud es <= col_enlace
        enlace_actual = fila[col_enlace] if col_enlace < len(fila) else ""

        if enlace_actual.strip():
            print(f"  Fila {fila_num}: Ya tiene documento ✓ ({enlace_actual[:60]})")
            continue
        print(f"  Fila {fila_num}: Sin documento — generando para {safe(fila, 'Nombre Completo del Candidato')}...")

        # ── Datos del candidato ──────────────────────────────
        cedula   = safe(fila, "Cedula del Candidato")
        nombre   = safe(fila, "Nombre Completo del Candidato")
        programa = safe(fila, "Programa / Area del Concurso")
        perfil   = safe(fila, "Perfil del Cargo")
        concepto = safe(fila, "Concepto Final")
        obs      = safe(fila, "Observaciones Generales de la Verificacion")
        fecha    = safe(fila, "Fecha de Verificacion")

        req_cols = [
            "1. Formato de Inscripcion firmado por el aspirante",
            "2. Hoja de Vida UQ (Formato GH-FOR-006)",
            "3. Fotocopia de cedula y libreta militar",
            "4. Fotocopia de matricula o tarjeta profesional",
            "5. Certificados disciplinarios, judiciales o fiscales vigentes",
            "6. Certificado de experiencia docente universitaria (minimo 2 anos / 1024 horas catedra)",
            "7. Titulo de Pregrado requerido por el perfil",
            "8. Titulo de Posgrado requerido por el perfil",
            "9. Experiencia minima en el area del concurso (segun perfil)",
            "10. Tema de disertacion presentado (si aplica)",
            "11. Documentos debidamente foliados (Art. 8 A.C.A. 396)",
        ]
        obs_cols = [c.replace(c.split(".")[0]+". ", "Observaciones - ") for c in req_cols]
        obs_map  = {
            req_cols[0]:  "Observaciones - Formato de Inscripcion",
            req_cols[1]:  "Observaciones - Hoja de Vida UQ",
            req_cols[2]:  "Observaciones - Cedula / Libreta Militar",
            req_cols[3]:  "Observaciones - Matricula / Tarjeta Profesional",
            req_cols[4]:  "Observaciones - Certificados disciplinarios",
            req_cols[5]:  "Observaciones - Experiencia Docente",
            req_cols[6]:  "Observaciones - Titulo Pregrado",
            req_cols[7]:  "Observaciones - Titulo Posgrado",
            req_cols[8]:  "Observaciones - Experiencia en el Area",
            req_cols[9]:  "Observaciones - Tema de Disertacion",
            req_cols[10]: "Observaciones - Tema de Disertacion",
        }

        # ── Crear el Google Doc ──────────────────────────────
        titulo_doc = f"ETAPA2_Verificacion_{cedula}_{nombre[:30]}"
        doc_meta = drive.files().create(
            body={
                "name":     titulo_doc,
                "mimeType": "application/vnd.google-apps.document",
            },
            fields="id"
        ).execute()
        doc_id = doc_meta["id"]

        # ── Construir el contenido del documento ─────────────
        def req_texto(col):
            v = safe(fila, col)
            return "SI" if v.upper().startswith("CUMPLE") and "NO" not in v.upper()[:3] else "NO"

        tabla_rows = []
        for col in req_cols:
            obs_col = obs_map.get(col, "")
            estado  = req_texto(col)
            obs_val = safe(fila, obs_col)
            tabla_rows.append((col, obs_val, estado))

        # Construir requests para Google Docs API
        requests_doc = []

        # Título
        requests_doc.append({"insertText": {"location": {"index": 1},
            "text": f"VERIFICACIÓN DE REQUISITOS DEL PERFIL\n\n"}})

        # Encabezado
        encabezado_txt = (
            f"NOMBRE: {nombre}    C.C. {cedula}\n"
            f"PROGRAMA: {programa}\n"
            f"ÁREA O LÍNEA: {perfil}\n"
            f"FECHA DE VERIFICACIÓN: {fecha}\n\n"
        )
        requests_doc.append({"insertText": {"location": {"index": 1},
            "text": encabezado_txt}})

        # Tabla de requisitos
        tabla_txt = "REQUISITO\tOBSERVACIONES\tCUMPLE\n"
        for req, obs_v, est in tabla_rows:
            tabla_txt += f"{req}\t{obs_v}\t{est}\n"
        tabla_txt += "\n"
        requests_doc.append({"insertText": {"location": {"index": 1},
            "text": tabla_txt}})

        # Concepto final
        concepto_txt = (
            f"CONCEPTO FINAL: {concepto}\n\n"
            f"OBSERVACIONES GENERALES:\n{obs}\n\n"
            f"____________________________________\t\t____________________________________\n"
            f"NOMBRE Y FIRMA MIEMBRO COMISIÓN\t\tNOMBRE Y FIRMA FUNCIONARIO ASUNTOS PROFESORALES\n\n"
            f"____________________________________\t\t____________________________________\n"
            f"Vo.Bo. COORDINADOR COMISIÓN\t\tVo.Bo. JEFE OFICINA ASUNTOS PROFESORALES\n"
        )
        requests_doc.append({"insertText": {"location": {"index": 1},
            "text": concepto_txt}})

        docs.documents().batchUpdate(
            documentId=doc_id,
            body={"requests": list(reversed(requests_doc))}
        ).execute()

        enlace = f"https://docs.google.com/document/d/{doc_id}/edit"

        # ── Actualizar el Sheet con el enlace ─────────────────
        sheets.spreadsheets().values().update(
            spreadsheetId=SS_ID,
            range=f"'{HOJA}'!{col_letra}{fila_num}",
            valueInputOption="USER_ENTERED",
            body={"values": [[enlace]]}
        ).execute()

        print(f"  Fila {fila_num}: ✅ Documento generado para {nombre}")
        generados += 1

    print(f"\nTotal documentos generados: {generados}")
    if generados > 0:
        print(f"Los enlaces están en la columna '{col_letra}' del Sheet.")

if __name__ == "__main__":
    main()
