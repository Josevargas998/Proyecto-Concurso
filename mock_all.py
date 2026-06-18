import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"

creds = Credentials.from_authorized_user_file("token.json", SCOPES)
service = build("sheets", "v4", credentials=creds)

def insertar_simulacro(hoja, mock_dict):
    try:
        res = service.spreadsheets().values().get(spreadsheetId=SS_ID, range=f"{hoja}!A1:ZZ1").execute()
        headers = res.get("values", [[]])[0]
        row = [""] * len(headers)
        for i, header in enumerate(headers):
            h = header.lower()
            for k, v in mock_dict.items():
                if k in h:
                    row[i] = v
                    break
        body = {"values": [row]}
        service.spreadsheets().values().append(
            spreadsheetId=SS_ID, range=f"{hoja}!A:A",
            valueInputOption="USER_ENTERED", insertDataOption="INSERT_ROWS", body=body).execute()
        print(f"Fila insertada en {hoja}.")
    except Exception as e:
        print(f"No se pudo insertar en {hoja}. Error: {e}")

f1_data = {
    "nombre": "Diego Montoya Molina",
    "cedula": "1094123456",
    "programa": "INGENIERIA CIVIL",
    "correo": "diego.montoya@email.com",
    "telefono": "3001234567"
}

f2_data = {
    "nombre": "Diego Montoya Molina",
    "cedula": "1094123456",
    "programa": "INGENIERIA CIVIL - Vias y Transporte",
    "perfil": "Ingeniero civil con maestria en vias",
    "1. formato de inscrip": "CUMPLE",
    "observaciones - formato de inscripcion": "Entregado presencialmente.",
    "2. hoja de vida uq": "CUMPLE",
    "observaciones - hoja de vida": "Formato institucional completo.",
    "3. fotocopia": "CUMPLE",
    "observaciones - cedula": "Al 150%.",
    "4. fotocopia de matricula": "CUMPLE",
    "observaciones - matricula": "Vigente.",
    "5. certificados": "CUMPLE",
    "observaciones - certificados": "Sin antecedentes.",
    "6. certificado": "CUMPLE",
    "observaciones - experiencia docente": "3 anos certificados.",
    "7. titulo de pregrado": "CUMPLE",
    "observaciones - titulo pregrado": "Ingeniero civil.",
    "8. titulo de posgrado": "CUMPLE",
    "observaciones - titulo posgrado": "Magister en vias.",
    "9. experiencia": "CUMPLE",
    "observaciones - experiencia en el area": "4 anos.",
    "concepto final": "CUMPLE CON TODOS LOS REQUISITOS",
    "observaciones generales": "Verificacion correcta, pasa a etapa de evaluacion.",
    "enlace": ""
}

f3_data = {
    "nombre": "Diego Montoya Molina",
    "cedula": "1094123456",
    "programa": "INGENIERIA CIVIL - Vias y Transporte",
    "evaluador": "Dr. Carlos Ruiz (Comite)",
    "puntaje total criterio 1": "10",
    "puntaje total criterio 2": "12",
    "puntaje total criterio 3": "5",
    "nivel academico": "Maestria Ingenieria",
    "justificacion - nivel": "Titulo valido.",
    "2a. experiencia docente": "Obtiene 4 ptos.",
    "2b. experiencia en investigacion": "Obtiene 2 ptos.",
    "2c. experiencia en extension": "0",
    "2d. experiencia profesional diferente": "Obtiene 2 ptos.",
    "2e. experiencia en cargos": "Obtiene 1 pto.",
    "detalle de articulos": "1 articulo en revista indexada",
    "detalle de libros": "N/A",
    "observaciones generales del evaluador": "Muy buen perfil profesional.",
    "enlace": ""
}

f4_data = {
    "nombre": "Diego Montoya Molina",
    "cedula": "1094123456",
    "programa": "INGENIERIA CIVIL",
    "facultad": "INGENIERIA",
    "anno": "2026",
    "categoria": "ASISTENTE",
    "titulo de pregrado": "Ingeniero Civil",
    "institucion pregrado": "Universidad del Quindio",
    "puntaje titulo pregrado": "80",
    "titulo de posgrado": "Magister en Vias",
    "institucion posgrado": "Universidad Nacional",
    "puntaje titulo posgrado": "40",
    "subtotal titulos": "120",
    "puntos por categoria": "30",
    "3.1 investigacion": "15",
    "detalle investigacion": "Participacion grupo ViasUQ",
    "3.2 docencia universitaria": "20",
    "detalle docencia universitaria": "Profesor catedra 3 anos",
    "3.3 experiencia en cargos": "0",
    "detalle cargos": "N/A",
    "3.4 experiencia profesional": "10",
    "detalle experiencia profesional": "Ingeniero disenador",
    "subtotal experiencia calificada": "45",
    "articulos en revistas": "Articulo A\nArticulo B",
    "libros y capitulos": "N/A",
    "subtotal productividad": "15",
    "total puntos finales": "210",
    "remuneracion mensual": "4.500.000",
    "proyecto": "Maria Perez",
    "aprobo": "Jefe Oficina Profesorales",
    "enlace": ""
}

insertar_simulacro("Respuestas de formulario 1", f1_data)
insertar_simulacro("Respuestas de formulario 2", f2_data)
insertar_simulacro("Respuestas de formulario 3", f3_data)
insertar_simulacro("Respuestas de formulario 4", f4_data)
print("COMPLETO")
