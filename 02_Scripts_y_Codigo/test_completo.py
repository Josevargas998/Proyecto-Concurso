"""
TEST COMPLETO - Candidato de prueba en las 4 etapas
Simula el llenado de los 4 formularios y genera todos los documentos
"""
import os, datetime, subprocess
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"

# ── Candidato de prueba ─────────────────────────────────────
CEDULA      = "1094892345"
NOMBRE      = "Carlos Alberto Gomez Herrera"
PROGRAMA    = "INGENIERIA - Ingenieria Civil"
FACULTAD    = "INGENIERIA"
PERFIL      = "Perfil 1"
VINCULO     = "Tiempo Completo"
CORREO_SEC  = "secretaria.profesorales@uniquindio.edu.co"
CORREO_COM  = "comision@uniquindio.edu.co"
CORREO_COM2 = "comite.evaluador@uniquindio.edu.co"
CORREO_JEFE = "jhvargas@uniquindio.edu.co"
HOY = datetime.date.today().strftime("%d/%m/%Y")

def autenticar():
    creds = Credentials.from_authorized_user_file(r"..\03_Credenciales_y_Accesos\token.json",
        ["https://www.googleapis.com/auth/spreadsheets"])
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return build("sheets", "v4", credentials=creds)

def escribir(service, hoja, rango, valores):
    service.spreadsheets().values().append(
        spreadsheetId=SS_ID,
        range=f"'{hoja}'!{rango}",
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body={"values": valores},
    ).execute()

def main():
    print("=" * 65)
    print("  TEST COMPLETO — Carlos Alberto Gomez Herrera")
    print("  Cedula: " + CEDULA)
    print("=" * 65)

    service = autenticar()

    # ══════════════════════════════════════════════════════
    # ETAPA 1 — Registro de Hoja de Vida (Secretaria)
    # ══════════════════════════════════════════════════════
    print("\n[ETAPA 1] Secretaria registra la hoja de vida...")
    fila_f1 = [[
        datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S"),   # Marca temporal
        "Maria Fernanda Salazar",                                  # Nombre quien recibe
        HOY,                                                       # Fecha recepcion
        CEDULA,                                                    # Cedula
        NOMBRE,                                                    # Nombre
        "3104567890",                                              # Telefono
        "cgomez@gmail.com",                                        # Correo candidato
        "INGENIERIA",                                              # Area
        PROGRAMA,                                                  # Programa
        PERFIL,                                                    # Perfil
        VINCULO,                                                   # Tipo vinculacion
        "Formato de inscripcion firmado, Hoja de vida UQ, Fotocopia de la cedula de ciudadania, Libreta militar, Fotocopia de matricula o tarjeta profesional, Certificados disciplinarios judiciales o fiscales vigentes, Certificado de experiencia en docencia universitaria, Titulos de pregrado, Titulos de posgrado, Documentos debidamente foliados",
        "PRESELECCIONADO - Cumple todos los requisitos",           # Estado
        "",                                                        # Observaciones
        "Si",                                                      # Certif Lengua B1
        "No",                                                      # Certif Tutor Virtual
        CORREO_SEC,                                                # Email capturado
    ]]
    escribir(service, "Respuestas de formulario 1", "A1", fila_f1)
    print("  OK - HV registrada como PRESELECCIONADO")

    # ══════════════════════════════════════════════════════
    # ETAPA 2 — Verificacion de Requisitos (Comision)
    # ══════════════════════════════════════════════════════
    print("\n[ETAPA 2] Comision verifica requisitos del perfil...")
    fila_f2 = [[
        datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        CEDULA,
        NOMBRE,
        PROGRAMA,
        PERFIL,
        "Dr. Eduardo Ramos (Coordinador Comision)",
        HOY,
        "CUMPLE",                          # 1. Formato inscripcion
        "",                                # obs 1
        "CUMPLE",                          # 2. HV UQ
        "",                                # obs 2
        "CUMPLE",                          # 3. Cedula/libreta
        "",                                # obs 3
        "CUMPLE",                          # 4. Tarjeta profesional
        "",                                # obs 4
        "CUMPLE",                          # 5. Certif disciplinarios
        "",                                # obs 5
        "CUMPLE",                          # 6. Exp docente
        "",                                # obs 6
        "CUMPLE",                          # 7. Titulo pregrado
        "Titulo: Ingeniero Civil - Universidad del Quindio",
        "CUMPLE",                          # 8. Titulo posgrado
        "Maestria en Gerencia de la Construccion - Universidad del Quindio",
        "CUMPLE",                          # 9. Exp en area
        "Mas de 12 anos docencia en Ingenieria Civil",
        "CUMPLE",                          # 10. Tema disertacion
        "Planeacion y control en proyectos de construccion",
        "CUMPLE - Documentos foliados correctamente",  # 11. Foliados
        "CUMPLE CON TODOS LOS REQUISITOS - Pasa a etapa de calificacion",
        "Candidato cumple con todos los requisitos establecidos en el perfil. Documentos completos y en orden.",
        CORREO_COM,
    ]]
    escribir(service, "Respuestas de formulario 2", "A1", fila_f2)
    print("  OK - CUMPLE con todos los requisitos")

    # ══════════════════════════════════════════════════════
    # ETAPA 3 — Calificacion HV (Comite Evaluador)
    # ══════════════════════════════════════════════════════
    print("\n[ETAPA 3] Comite califica la hoja de vida...")
    fila_f3 = [[
        datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        CEDULA,
        NOMBRE,
        PROGRAMA,
        "Dra. Patricia Montoya (Comite Evaluador)",
        HOY,
        "Maestria con enfasis requerido          ->  8 puntos",  # Nivel academico
        "Maestria en Gerencia de la Construccion - Universidad del Quindio (2015)",
        "Mas de 10 anos                 ->  5 puntos",           # 2a doc universitaria
        "12 anos de experiencia docente universitaria en Ingenieria Civil - Universidad del Quindio",
        "Participacion en 3 o mas        ->  4 puntos",          # 2b investigacion
        "3 proyectos de investigacion: Puentes sismicos (2018), Gestion residuos (2020), Pavimentos (2022)",
        "Hasta 2 proyectos (ultimos 5 anos)    ->  1 punto",     # 2c extension
        "Proyecto extension 'Construccion sostenible' Armenia 2022",
        "Mas de 5 a 10 anos     ->  1.5 puntos",                 # 2d exp profesional
        "7 anos experiencia en Constructora Bolivar S.A. (2008-2015)",
        "De 1 a 3 anos         ->  1 punto",                     # 2e cargos
        "Director Programa Ingenieria Civil 2019-2021",
        "7",                                                      # 3a articulos (escala)
        "Art 1: Analisis sismico de puentes (Rev. Ingenieria A1 - 4pts)\nArt 2: Gestion residuos construccion (Rev. Construccion A2 - 3pts)",
        "2 obras / libros / software  ->  2 puntos",             # 3b libros
        "Libro: Manual de construccion sostenible (2021)\nLibro: Calculo estructural para ingenieros (2019)",
        "8",    # C1 nivel academico
        "12.5", # C2 experiencia (5+4+1+1.5+1)
        "7",    # C3 productividad (articulos 5pts + libros 2pts, max 8)
        "Excelente hoja de vida. Candidato con amplia experiencia docente y productividad academica destacada.",
        CORREO_COM2,
    ]]
    escribir(service, "Respuestas de formulario 3", "A1", fila_f3)
    print("  OK - Puntaje HV: 8 + 12.5 + 7 = 27.5 / 35 puntos")

    # ══════════════════════════════════════════════════════
    # ETAPA 4 — Ficha de Ingreso (Ganador)
    # ══════════════════════════════════════════════════════
    print("\n[ETAPA 4] Jefe registra ficha de ingreso del docente ganador...")
    fila_f4 = [[
        datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        NOMBRE,
        CEDULA,
        "Ingenieria Civil",
        FACULTAD,
        "2026",
        "Asistente",
        VINCULO,
        "Ingeniero Civil",
        "Universidad del Quindio",
        "178",
        "Maestria en Gerencia de la Construccion",
        "Universidad del Quindio",
        "40",
        "218",                 # Subtotal titulos
        "58",                  # Puntos categoria Asistente
        "36",                  # 3.1 Investigacion
        "Universidad del Quindio 6.0 x 6 anos",
        "9",                   # 3.2 Docencia universitaria
        "Universidad del Quindio 3.0 x 3 anos",
        "0",                   # 3.3 Cargos direccion
        "",
        "0",                   # 3.4 Exp profesional
        "",
        "45",                  # Subtotal exp calificada (tope asistente)
        "Analisis sismico de puentes en zonas de alta amenaza sismica - Rev. Ingenieria UQ cat A1\nGestion integral de residuos solidos en proyectos de construccion civil - Rev. Construccion cat A2",
        "Manual de construccion sostenible para el eje cafetero - UQ Ediciones\nCalculo estructural avanzado para ingenieros civiles - UQ Ediciones",
        "7",                   # Subtotal productividad
        "328",                 # TOTAL PUNTOS
        "5820000",             # Remuneracion
        "Luisa Fernanda Duque Nieves",
        "Luz Amparo Celis",
        "",
        CORREO_JEFE,
    ]]
    escribir(service, "Respuestas de formulario 4", "A1", fila_f4)
    print("  OK - Ficha de ingreso: 328 pts | Asistente | $5.820.000")

    print("\n" + "=" * 65)
    print("  DATOS INGRESADOS EN LOS 4 FORMULARIOS")
    print("  Generando documentos...")
    print("=" * 65)


if __name__ == "__main__":
    main()
