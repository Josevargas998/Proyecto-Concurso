// =====================================================================
// VARIABLES GLOBALES
// =====================================================================
var SS_ID        = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY";
var TPL_FORM2_ID = "1zMog_h7OCTm5thWbjCFP6J5D6fiWh9RJL9NHQHl29Mo"; // Plantilla Lista de Chequeo
var TPL_FORM3_ID = "1AsZXFF6IC4Ue5FNeGmfRTVk3-qAvGABxGw-hEgkmscM"; // Plantilla Hoja de Calificacion

var FORM_IDS = {
  2: "1xoVPJ8jAjrUibp-jH8zIhmdNe6r7Ilx9aPiFQUETSI4",
  3: "1DP9UE2oQJ2vCA3bV7oTnvUMW7xA5xiSiS-F96_8nnm8",
  4: "1A-YFD_8xGqwe-Dh3viMGerN6_Uj2agPRR_X8KuIwJlA"
};

// =====================================================================
// FUNCIONES AUXILIARES
// =====================================================================
function getFilaDatos(hojaName) {
  var ss   = SpreadsheetApp.openById(SS_ID);
  var hoja = ss.getSheetByName(hojaName);
  var ult  = hoja.getLastRow();
  var enc  = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var fila = hoja.getRange(ult, 1, 1, hoja.getLastColumn()).getValues()[0];

  function safe(key) {
    for (var i = 0; i < enc.length; i++) {
      if (String(enc[i]).toLowerCase().indexOf(key.toLowerCase()) !== -1) {
        return String(fila[i] || "").trim();
      }
    }
    return "";
  }

  function getColIndex(key) {
    for (var i = 0; i < enc.length; i++) {
      if (String(enc[i]).toLowerCase().indexOf(key.toLowerCase()) !== -1) {
        return i + 1;
      }
    }
    return -1;
  }

  return { hoja: hoja, ult: ult, safe: safe, getColIndex: getColIndex, enc: enc, fila: fila };
}

// =====================================================================
// DIAGNOSTICO: Corre esta funcion para ver todos los encabezados de
//              "Respuestas de formulario 2" en los Registros (Logger)
// =====================================================================
function debugF2Columnas() {
  var d = getFilaDatos("Respuestas de formulario 2");
  var lineas = ["Total columnas: " + d.enc.length, ""];
  for (var i = 0; i < d.enc.length; i++) {
    lineas.push("[" + (i + 1) + "] " + d.enc[i]);
  }
  Logger.log(lineas.join("\n"));
  SpreadsheetApp.getUi().alert("Revisa Ver > Registros para ver los nombres de las columnas.");
}

// =====================================================================
// FORMULARIO 2: VERIFICACION DE REQUISITOS
// Copia la plantilla Google Doc (TPL_FORM2_ID) y llena los datos.
// Los logos y el formato se preservan automaticamente.
// =====================================================================
function onFormSubmit_F2(e) {
  try {
    var d        = getFilaDatos("Respuestas de formulario 2");
    var cedula   = d.safe("Cedula del Candidato");
    var nombre   = d.safe("Nombre Completo del Candidato");
    var prog     = d.safe("Programa / Area del Concurso");
    var perfil   = d.safe("Perfil del Cargo");
    var obsGen        = d.safe("Observaciones Generales");
    var conceptoFinal = d.safe("Concepto Final");
    // El concepto final lo decide el evaluador en el formulario
    // SI el concepto contiene "CUMPLE CON TODOS" → tabla final = SI, de lo contrario NO
    var cumpleTodos = conceptoFinal.toUpperCase().indexOf("CUMPLE CON TODOS") >= 0;

    // Mapa explicito programa -> facultad
    // Necesario porque algunos programas no tienen guion (ej: Seguridad y Salud en el Trabajo)
    // y otros tienen guion en su nombre (ej: Comunicacion Social - Periodismo)
    var PROG_FACULTAD = {
      "licenciatura en educacion fisica":    "CIENCIAS DE LA EDUCACION",
      "educacion fisica":                    "CIENCIAS DE LA EDUCACION",
      "licenciatura en lenguas modernas":    "CIENCIAS DE LA EDUCACION",
      "lenguas modernas":                    "CIENCIAS DE LA EDUCACION",
      "licenciatura en literatura":          "CIENCIAS DE LA EDUCACION",
      "literatura y lengua castellana":      "CIENCIAS DE LA EDUCACION",
      "ingenieria civil":                    "INGENIERIA",
      "ingenieria electronica":              "INGENIERIA",
      "ingenieria de sistemas":              "INGENIERIA",
      "gerontologia":                        "CIENCIAS DE LA SALUD",
      "medicina":                            "CIENCIAS DE LA SALUD",
      "enfermeria":                          "CIENCIAS DE LA SALUD",
      "seguridad y salud en el trabajo":     "CIENCIAS DE LA SALUD",
      "ciencias de la informacion":          "CIENCIAS HUMANAS Y BELLAS ARTES",
      "archivistica":                        "CIENCIAS HUMANAS Y BELLAS ARTES",
      "trabajo social":                      "CIENCIAS HUMANAS Y BELLAS ARTES",
      "comunicacion social":                 "CIENCIAS HUMANAS Y BELLAS ARTES",
      "periodismo":                          "CIENCIAS HUMANAS Y BELLAS ARTES",
      "biologia":                            "CIENCIAS BASICAS Y TECNOLOGIAS",
      "fisica":                              "CIENCIAS BASICAS Y TECNOLOGIAS",
      "administracion financiera":           "CIENCIAS ECONOMICAS Y ADMINISTRATIVAS",
      "administracion de negocios":          "CIENCIAS ECONOMICAS Y ADMINISTRATIVAS"
    };

    // Buscar la facultad correcta segun el nombre del programa
    function getFacultad(nombrePrograma) {
      var pLow = (nombrePrograma || "").toLowerCase()
                   .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // quitar tildes
      for (var clave in PROG_FACULTAD) {
        if (pLow.indexOf(clave) >= 0) return PROG_FACULTAD[clave];
      }
      // Fallback: si Form 1 envio "FACULTAD - Programa", usar la parte izquierda del guion
      if (nombrePrograma.indexOf("-") > -1) return nombrePrograma.split("-")[0].trim().toUpperCase();
      return ""; // desconocida
    }

    var fac = getFacultad(prog);
    var prg = prog; // el programa siempre es el nombre completo


    var colEnlace = d.getColIndex("Enlace Documento");
    if (colEnlace === -1) {
      colEnlace = d.enc.length + 1;
      d.hoja.getRange(1, colEnlace).setValue("Enlace Documento");
    }

    // ── 1. COPIAR PLANTILLA (logos y formato intactos) ───────────────
    var copia   = DriveApp.getFileById(TPL_FORM2_ID)
                    .makeCopy("ETAPA2_" + cedula + "_" + nombre.substring(0, 30));
    var copyDoc = DocumentApp.openById(copia.getId());
    var body    = copyDoc.getBody();

    // ── 2. REEMPLAZAR DATOS DEL CANDIDATO EN LOS PARRAFOS ───────────
    var paras = body.getParagraphs();
    for (var p = 0; p < paras.length; p++) {
      var txt = paras[p].getText();
      var low = txt.toLowerCase();

      if (low.indexOf("nombre:") >= 0 && low.indexOf("c.c.") >= 0) {
        // NOMBRE y CC en la misma linea (preservar estructura de la plantilla)
        paras[p].setText("NOMBRE: " + nombre.toUpperCase() +
                          "                                         C.C. " + cedula);
      } else if (low.indexOf("facultad de") >= 0) {
        paras[p].setText("FACULTAD DE " + fac.toUpperCase());
      } else if (low.indexOf("programa:") >= 0 && low.indexOf("area") < 0) {
        paras[p].setText("PROGRAMA: " + prg.toUpperCase());
      } else if (low.indexOf("area o linea:") >= 0) {
        paras[p].setText("AREA O LINEA: " + perfil.toUpperCase());
      }
    }

    // Reemplazar la linea de subrayados (OBSERVACIONES GENERALES) con el texto del formulario
    // replaceText busca en TODO el documento, incluyendo dentro de tablas
    if (obsGen && obsGen.length > 0) {
      body.replaceText("_{10,}", obsGen);
    }

    // ── 3. LLENAR TABLA DE REQUISITOS ────────────────────────────────
    // Mapeo explicito: cada entrada define la fila fisica del doc (en orden a,b,c,d,e...)
    // cumpleKey: busca en columnas de cumplimiento | obsKey: busca SOLO en columnas Observaciones
    var mapeoRequisitos = [
      { cumpleKey: "(a) Formato de inscripcion",              obsKey: "Formato de Inscripcion" },
      { cumpleKey: "(b) Hoja de Vida UQ",                     obsKey: "Hoja de Vida UQ" },
      { cumpleKey: "(c) Fotocopia del titulo de pregrado",    obsKey: "Titulo Pregrado" },
      { cumpleKey: "(d) Fotocopia de titulos o actas de grado de posgrado", obsKey: "Titulo Posgrado" },
      { cumpleKey: "(e) Fotocopia de la cedula",              obsKey: "Cedula" },
      { cumpleKey: "(f) Fotocopia de matricula",              obsKey: "Matricula" },
      { cumpleKey: "(g) Certificado de inhabilidades por delitos", obsKey: "delitos" },
      { cumpleKey: "(h) Certificado de registro de deudores", obsKey: "deudores" },
      { cumpleKey: "(i) Certificacion de experiencia especifica en docencia", obsKey: "docencia" },
      { cumpleKey: "(j) Certificacion de experiencia en investigacion", obsKey: "investigacion" },
      { cumpleKey: "(k) Certificacion de experiencia en extension", obsKey: "extension" },
      { cumpleKey: "(l) Certificacion de experiencia en cargos academico", obsKey: "cargos" },
      { cumpleKey: "(m) Certificacion de experiencia profesional", obsKey: "profesional" },
      { cumpleKey: "(n) Certificacion de suficiencia linguistica", obsKey: "linguistica" },
      { cumpleKey: "Documentos debidamente foliados",          obsKey: "foliados" },
      { cumpleKey: "5. Certificados disciplinarios",           obsKey: "disciplinarios" }
    ];

    var tables = body.getTables();
    var reqTable = null;
    for (var t = 0; t < tables.length; t++) {
      if (tables[t].getNumRows() >= 10 && tables[t].getRow(0).getNumCells() >= 3) {
        reqTable = tables[t];
        break;
      }
    }

    // Pre-indexar SOLO las columnas que comienzan con "Observaciones"
    // para evitar que d.safe() encuentre el valor CUMPLE en vez de la observacion
    var obsIndex = {};
    for (var k = 0; k < d.enc.length; k++) {
      var hdr = String(d.enc[k]).trim();
      if (hdr.toLowerCase().indexOf("observaci") >= 0 && hdr.toLowerCase().indexOf("general") < 0) {
        obsIndex[hdr.toLowerCase()] = String(d.fila[k] || "").trim();
      }
    }

    function buscarObservacion(obsKey) {
      var kk = obsKey.toLowerCase();
      for (var hdr in obsIndex) {
        if (hdr.indexOf(kk) >= 0) return obsIndex[hdr];
      }
      return "";
    }

    if (reqTable) {
      for (var i = 0; i < mapeoRequisitos.length && i < reqTable.getNumRows() - 1; i++) {
        var item    = mapeoRequisitos[i];
        var row     = reqTable.getRow(i + 1);
        var vReq    = d.safe(item.cumpleKey);
        var obsItem = buscarObservacion(item.obsKey);
        // Determinar SI o NO segun lo que marco el evaluador en el formulario
        var cumple;
        if (!vReq) {
          cumple = "";
        } else if (vReq.toUpperCase().indexOf("NO CUMPLE") >= 0) {
          cumple = "NO";
        } else if (vReq.toUpperCase().indexOf("CUMPLE") >= 0) {
          cumple = "SI";
        } else if (vReq.toUpperCase().indexOf("PENDIENTE") >= 0) {
          cumple = "PENDIENTE";
        } else {
          cumple = "";
        }

        row.getCell(1).setText(obsItem || "");

        var cCump = row.getCell(2);
        cCump.setText(cumple);
        var bgColor = cumple === "SI" ? "#b7e1cd" : (cumple === "PENDIENTE" ? "#fff2cc" : "#f4cccc");
        cCump.setBackgroundColor(bgColor);
        cCump.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
        cCump.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      }
    }

    // ── 4. TABLA "CUMPLE CON TODOS LOS REQUISITOS" ───────────────────
    for (var t = 0; t < tables.length; t++) {
      if (tables[t].getNumRows() === 2 && tables[t].getRow(0).getNumCells() >= 3) {
        var dataRow = tables[t].getRow(1);
        var siCell  = dataRow.getCell(1);
        var noCell  = dataRow.getCell(2);
        siCell.setText(cumpleTodos  ? "X" : "");
        noCell.setText(!cumpleTodos ? "X" : "");
        siCell.setBackgroundColor(cumpleTodos  ? "#b7e1cd" : "#ffffff");
        noCell.setBackgroundColor(!cumpleTodos ? "#f4cccc"  : "#ffffff");
        siCell.editAsText().setFontFamily("Arial").setFontSize(12).setBold(true);
        noCell.editAsText().setFontFamily("Arial").setFontSize(12).setBold(true);
        siCell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        noCell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        break;
      }
    }

    copyDoc.saveAndClose();
    d.hoja.getRange(d.ult, colEnlace).setValue(
      "https://docs.google.com/document/d/" + copia.getId() + "/edit"
    );

    // ── 5. GENERAR ENLACE AL FORMULARIO 3 (Mapeado automatico si cumple) ──
    var colLinkF3 = d.getColIndex("Llenar Formulario 3");
    if (colLinkF3 === -1) {
      colLinkF3 = d.enc.length + 2; // Columna siguiente
      d.hoja.getRange(1, colLinkF3).setValue("Llenar Formulario 3");
    }

    if (cumpleTodos) {
      // Generar el enlace prellenado para el Formulario 3
      var f3 = FormApp.openById(FORM_IDS[3]);
      var map3 = getItemsMapping(f3);
      var linkF3 = buildUrl(f3, map3, cedula, nombre, prog, perfil);
      d.hoja.getRange(d.ult, colLinkF3).setValue(linkF3);
      Logger.log("Enlace prellenado Formulario 3 generado para: " + nombre);
    } else {
      d.hoja.getRange(d.ult, colLinkF3).setValue("N/A - No cumple requisitos habilitantes");
    }

  } catch(err) { Logger.log("Error F2: " + err); }
}

// =====================================================================
// HELPER: Extraer puntaje numerico de una opcion del formulario
// Las opciones tienen formato: "Descripcion -> X puntos" o "Descripcion -> X punto"
// =====================================================================
function extraerPuntaje(textoOpcion) {
  if (!textoOpcion) return 0;
  // Buscar patron "-> X puntos" o "-> X punto" al final del string
  var match = textoOpcion.match(/[\u2192>]\s*([\d.]+)\s*punt/i);
  if (match) return parseFloat(match[1]);
  return 0;
}

// =====================================================================
// FORMULARIO 3: HOJA DE CALIFICACION - Acuerdo 029 de 2026
// =====================================================================
function onFormSubmit_F3(e) {
  try {
    var d = getFilaDatos("Respuestas de formulario 3");
    var cedula   = d.safe("Cedula del Candidato");
    var nombre   = d.safe("Nombre Completo del Candidato");
    var prog     = d.safe("Programa / Area del Concurso");
    var perfil   = d.safe("Perfil del Cargo");
    var evaluador = d.safe("Nombre del Evaluador");

    var colEnlace = d.getColIndex("Enlace Documento");
    if (colEnlace === -1) { colEnlace = d.enc.length + 1; d.hoja.getRange(1, colEnlace).setValue("Enlace Documento"); }

    // ── LEER CAMPOS Y CALCULAR PUNTAJES ──────────────────────────────
    // Criterio 1: Nivel academico adicional (max 5 pts)
    var v1  = d.safe("Nivel Academico Acreditado");
    var p1  = extraerPuntaje(v1);

    // Criterio 2a: Experiencia docente (max 5 pts)
    var v2a = d.safe("2a. Experiencia Docente");
    var p2a = extraerPuntaje(v2a);

    // Criterio 2b: Extension - coordinador + facilitador + labor (max 8 pts)
    var v2bCoord = d.safe("2b. Participacion como Coordinador");
    var v2bFacil = d.safe("2b. Participacion como Facilitador");
    var v2bLabor = d.safe("2b. Participacion por labor");
    var p2b = Math.min(8, extraerPuntaje(v2bCoord) + extraerPuntaje(v2bFacil) + extraerPuntaje(v2bLabor));

    // Criterio 2c: Experiencia profesional diferente (max 2 pts)
    var v2c = d.safe("2c. Experiencia Profesional Diferente");
    var p2c = extraerPuntaje(v2c);

    // Criterio 2d: Cargos academico-administrativos (max 2 pts)
    var v2d = d.safe("2d. Experiencia en Cargos Academico");
    var p2d = extraerPuntaje(v2d);

    var p2Total = Math.min(17, p2a + p2b + p2c + p2d);

    // Criterio 3: Productividad academica (max 8 pts)
    var v3a1 = d.safe("3a. Articulos en Revistas Indexadas - Categoria A1");
    var v3a2 = d.safe("3b. Articulos en Revistas Indexadas - Categoria A2");
    var v3lib = d.safe("3c. Libros");
    var v3obr = d.safe("3d. Obras Artisticas");
    var v3sof = d.safe("3e. Software");
    var v3aud = d.safe("3f. Produccion Audiovisual");
    var p3Total = Math.min(8,
      extraerPuntaje(v3a1) + extraerPuntaje(v3a2) +
      extraerPuntaje(v3lib) + extraerPuntaje(v3obr) +
      extraerPuntaje(v3sof) + extraerPuntaje(v3aud)
    );

    var pHojaVida = Math.min(30, p1 + p2Total + p3Total);
    var obsGen = d.safe("Observaciones Generales del Evaluador");

    // ── GENERAR COPIA DEL TEMPLATE EXCEL ─────────────────────────────
    var file   = DriveApp.getFileById(TPL_FORM3_ID).makeCopy("ETAPA3_" + cedula + "_" + nombre.substring(0, 30));
    var ssCopy = SpreadsheetApp.openById(file.getId());
    var ws     = ssCopy.getSheets()[0];

    // Mapa programa -> facultad (reutilizar logica de F2)
    var PROG_FACULTAD_F3 = {
      "Licenciatura en Educacion Fisica":     "FACULTAD DE CIENCIAS DE LA EDUCACION",
      "Licenciatura en Lenguas Modernas":     "FACULTAD DE CIENCIAS DE LA EDUCACION",
      "Licenciatura en Literatura":           "FACULTAD DE CIENCIAS DE LA EDUCACION",
      "Ingenieria Civil":                     "FACULTAD DE INGENIERIA",
      "Ingenieria Electronica":               "FACULTAD DE INGENIERIA",
      "Ingenieria de Sistemas":               "FACULTAD DE INGENIERIA",
      "Gerontologia":                         "FACULTAD DE CIENCIAS DE LA SALUD",
      "Medicina":                             "FACULTAD DE CIENCIAS DE LA SALUD",
      "Enfermeria":                           "FACULTAD DE CIENCIAS DE LA SALUD",
      "Seguridad y Salud":                    "FACULTAD DE CIENCIAS DE LA SALUD",
      "Ciencias de la Informacion":           "FACULTAD DE CIENCIAS HUMANAS Y BELLAS ARTES",
      "Trabajo Social":                       "FACULTAD DE CIENCIAS HUMANAS Y BELLAS ARTES",
      "Comunicacion Social":                  "FACULTAD DE CIENCIAS HUMANAS Y BELLAS ARTES",
      "Biologia":                             "FACULTAD DE CIENCIAS BASICAS Y TECNOLOGIAS",
      "Fisica":                               "FACULTAD DE CIENCIAS BASICAS Y TECNOLOGIAS",
      "Administracion Financiera":            "FACULTAD DE CIENCIAS ECONOMICAS"
    };
    var fac3 = "";
    var progNorm = prog.toLowerCase();
    for (var key3 in PROG_FACULTAD_F3) {
      if (progNorm.indexOf(key3.toLowerCase()) >= 0) { fac3 = PROG_FACULTAD_F3[key3]; break; }
    }
    if (!fac3) fac3 = prog;

    ws.getRange("A5").setValue("Candidato: " + nombre + "   CC: " + cedula);
    ws.getRange("A6").setValue("Facultad: " + fac3);
    ws.getRange("A7").setValue("Programa: " + prog);
    ws.getRange("A8").setValue("Perfil: " + perfil + "   Evaluador: " + evaluador);

    // Puntajes en el template
    ws.getRange("D70").setValue(p1);
    ws.getRange("D71").setValue(p2Total);
    ws.getRange("D72").setValue(p3Total);
    ws.getRange("C73").setValue(pHojaVida);

    // ── HOJA DETALLE ─────────────────────────────────────────────────
    var det = ssCopy.insertSheet("Detalle Evaluacion - Acuerdo 029");
    det.getRange("A1").setValue("HOJA DE CALIFICACION — ACUERDO 029 DE 2026").setFontWeight("bold").setFontSize(12);
    det.getRange("A2").setValue("Candidato: " + nombre + "   CC: " + cedula);
    det.getRange("A3").setValue("Evaluador: " + evaluador);
    det.getRange("A4").setValue("Programa: " + prog + " — " + perfil);
    det.getRange("A5").setValue("");

    var data029 = [
      ["=== CRITERIO 1: NIVEL ACADEMICO ADICIONAL (max 5 pts) ===", ""],
      ["Nivel adicional acreditado:", v1],
      ["Justificacion:",            d.safe("Justificacion - Nivel Academico")],
      ["PUNTAJE CRITERIO 1:",       p1],
      ["", ""],
      ["=== CRITERIO 2: EXPERIENCIA (max 17 pts) ===", ""],
      ["2a. Experiencia docente:",          v2a + " [" + p2a + " pts]"],
      ["    Justificacion 2a:",             d.safe("Justificacion - Experiencia Docente")],
      ["2b. Coordinador proyectos ext.:",   v2bCoord],
      ["2b. Facilitador cursos IES:",       v2bFacil],
      ["2b. Participacion por labor:",      v2bLabor],
      ["    Justificacion 2b:",             d.safe("Justificacion - Extension / Proyeccion")],
      ["    Puntaje 2b subtotal:",          p2b + " pts (max 8)"],
      ["2c. Exp. profesional != docencia:", v2c + " [" + p2c + " pts]"],
      ["    Justificacion 2c:",             d.safe("Justificacion - Experiencia Profesional")],
      ["2d. Cargos acad.-admin. en IES:",   v2d + " [" + p2d + " pts]"],
      ["    Justificacion 2d:",             d.safe("Justificacion - Cargos Academico Administrativos")],
      ["PUNTAJE CRITERIO 2:",              p2Total + " (max 17)"],
      ["", ""],
      ["=== CRITERIO 3: PRODUCTIVIDAD ACADEMICA (max 8 pts) ===", ""],
      ["Articulos A1 Minciencias:",     v3a1],
      ["Articulos A2 Minciencias:",     v3a2],
      ["Detalle articulos:",            d.safe("Detalle de articulos indexados")],
      ["Libros:",                       v3lib],
      ["Obras artisticas:",             v3obr],
      ["Software:",                     v3sof],
      ["Produccion audiovisual:",       v3aud],
      ["Detalle libros/obras:",         d.safe("Detalle de libros / obras")],
      ["PUNTAJE CRITERIO 3:",           p3Total + " (max 8)"],
      ["", ""],
      ["=== TOTAL HOJA DE VIDA ===", ""],
      ["Criterio 1 (max 5):",   p1],
      ["Criterio 2 (max 17):",  p2Total],
      ["Criterio 3 (max 8):",   p3Total],
      ["TOTAL HOJA DE VIDA:",   pHojaVida + " / 30"],
      ["", ""],
      ["Observaciones del Evaluador:", obsGen]
    ];

    for (var i = 0; i < data029.length; i++) {
      det.getRange(i + 6, 1).setValue(data029[i][0]);
      det.getRange(i + 6, 2).setValue(data029[i][1]);
      if (String(data029[i][0]).indexOf("===" ) >= 0) {
        det.getRange(i + 6, 1).setFontWeight("bold").setBackground("#cfe2f3");
        det.getRange(i + 6, 2).setBackground("#cfe2f3");
      }
      if (String(data029[i][0]).indexOf("PUNTAJE") >= 0 || String(data029[i][0]).indexOf("TOTAL") >= 0) {
        det.getRange(i + 6, 1).setFontWeight("bold");
        det.getRange(i + 6, 2).setFontWeight("bold").setBackground("#d9ead3");
      }
    }
    det.setColumnWidth(1, 280);
    det.setColumnWidth(2, 400);
    det.autoResizeRows(1, data029.length + 6);

    d.hoja.getRange(d.ult, colEnlace).setValue("https://docs.google.com/spreadsheets/d/" + ssCopy.getId() + "/edit");
    Logger.log("F3 OK — " + nombre + " — Total HV: " + pHojaVida + "/30");
  } catch(err) { Logger.log("Error F3: " + err); }
}
      
      ["3a. Articulos Revistas:", d.safe("3a. Articulos en Revistas Indexadas")],
      ["Detalle Articulos:", d.safe("Detalle de articulos indexados")],
      
      ["3b. Libros / Obras:", d.safe("3b. Libros, Obras, Software")],
      ["Detalle Libros / Obras:", d.safe("Detalle de libros / obras")],
      
      ["Observaciones:", d.safe("Observaciones Generales del Evaluador")]
    ];
    for (var i = 0; i < data.length; i++) {
      det.getRange(i + 6, 1).setValue(data[i][0]);
      det.getRange(i + 6, 2).setValue(data[i][1]);
    }
    det.setColumnWidth(1, 250);
    det.setColumnWidth(2, 350);

    d.hoja.getRange(d.ult, colEnlace).setValue("https://docs.google.com/spreadsheets/d/" + ssCopy.getId() + "/edit");
  } catch(err) { Logger.log("Error F3: " + err); }
}

// =====================================================================
// FORMULARIO 4: FICHA DE INGRESO (Doc Programatico)
// =====================================================================
function onFormSubmit_F4(e) {
  try {
    var d = getFilaDatos("Respuestas de formulario 4");
    var cedula = d.safe("Cedula de Ciudadania");
    var nombre = d.safe("Nombre Completo");
    var colEnlace = d.getColIndex("Enlace Documento");
    if (colEnlace === -1) { colEnlace = d.enc.length + 1; d.hoja.getRange(1, colEnlace).setValue("Enlace Documento"); }

    var doc  = DocumentApp.create("ETAPA4_" + cedula + "_" + nombre.substring(0, 30));
    var body = doc.getBody();

    function addCenterBold(t, sz) {
      var p = body.appendParagraph(t);
      p.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      p.editAsText().setBold(true);
      if (sz) p.editAsText().setFontSize(sz);
    }

    addCenterBold("FICHA DE INGRESO A LA CARRERA DOCENTE - ANNO " + d.safe("Anno del Concurso"), 12);
    addCenterBold("NOMBRE: " + nombre.toUpperCase() + "   C.C. " + cedula, 11);
    addCenterBold("PROGRAMA: " + d.safe("Programa Academico").toUpperCase() + "   FACULTAD: " + d.safe("Facultad").toUpperCase(), 11);
    addCenterBold(d.safe("Categoria de Ingreso").toUpperCase() + "=" + d.safe("Puntos por Categoria") + " PTS.   TOPE EXP. CALIFICADA= " + d.safe("SUBTOTAL EXPERIENCIA CALIFICADA") + " PTS", 10);
    body.appendParagraph("");

    var tb = body.appendTable();
    function addR(c0, c1, c2, bold) {
      var r  = tb.appendTableRow();
      r.appendTableCell(c0);
      r.appendTableCell(c1);
      var c = r.appendTableCell(String(c2));
      c.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
      if (bold) {
        r.getCell(0).editAsText().setBold(true);
        r.getCell(1).editAsText().setBold(true);
        r.getCell(2).editAsText().setBold(true);
      }
    }

    addR("", "PUNTOS", "", true);
    addR("PREGRADO", d.safe("Institucion Pregrado") + "   " + d.safe("Titulo de Pregrado"), d.safe("Puntaje Titulo Pregrado"), false);
    addR("1. TITULOS", "", "", false);
    addR("POSTGRADO", d.safe("Institucion Posgrado") + "   " + d.safe("Titulo de Posgrado"), d.safe("Puntaje Titulo Posgrado"), false);
    addR("2. CATEGORIA", d.safe("Categoria de Ingreso") + " Cumple con requisitos", d.safe("Puntos por Categoria"), false);
    addR("3.1 INVESTIGACION", d.safe("Detalle Investigacion"), d.safe("3.1 Investigacion (puntos)"), false);
    addR("3.2 DOCENCIA UNIV.", d.safe("Detalle Docencia Universitaria"), d.safe("3.2 Docencia Universitaria (puntos)"), false);
    addR("3.3 CARGOS DIR.", d.safe("Detalle Cargos Direccion") || "N/P", d.safe("3.3 Experiencia en Cargos de Direccion"), false);
    addR("3.4 EXP. PROF.", d.safe("Detalle Experiencia Profesional") || "N/P", d.safe("3.4 Experiencia Profesional (puntos)"), false);
    addR("SUBTOTAL", "", d.safe("SUBTOTAL EXPERIENCIA CALIFICADA"), true);

    var arts = d.safe("Articulos en Revistas Indexadas").split("\n");
    for (var i = 0; i < arts.length; i++) if (arts[i].trim()) addR(i === 0 ? "4. PRODUCTIVIDAD" : "", arts[i].trim(), "", false);

    var libros = d.safe("Libros y Capitulos de Libro").split("\n");
    for (var i = 0; i < libros.length; i++) if (libros[i].trim()) addR("LIBROS", libros[i].trim(), "", false);

    addR("SUBTOTAL", "", d.safe("SUBTOTAL PRODUCTIVIDAD ACADEMICA"), true);

    body.appendParagraph("");
    addCenterBold("TOTAL PUNTOS: " + d.safe("TOTAL PUNTOS FINALES"), 12);
    body.appendParagraph("Remuneracion mensual: $ " + d.safe("Remuneracion Mensual") + " MONEDA CORRIENTE")
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    body.appendParagraph("");
    body.appendParagraph("PROYECTO: " + d.safe("Proyecto") + "\nAPROBO: " + d.safe("Aprobo"));

    doc.saveAndClose();
    d.hoja.getRange(d.ult, colEnlace).setValue("https://docs.google.com/document/d/" + doc.getId() + "/edit");
  } catch(err) { Logger.log("Error F4: " + err); }
}

// =====================================================================
// INSTALADOR DE TRIGGERS
// =====================================================================
function instalarTodosLosTriggers() {
  var ss       = SpreadsheetApp.openById(SS_ID);
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) ScriptApp.deleteTrigger(triggers[i]);

  // F1: genera enlaces automaticamente al enviar Formulario 1
  ScriptApp.newTrigger("onFormSubmit_F1").forSpreadsheet(ss).onFormSubmit().create();
  // F2, F3, F4: generan documentos al enviar cada formulario
  ScriptApp.newTrigger("onFormSubmit_F2").forSpreadsheet(ss).onFormSubmit().create();
  ScriptApp.newTrigger("onFormSubmit_F3").forSpreadsheet(ss).onFormSubmit().create();
  ScriptApp.newTrigger("onFormSubmit_F4").forSpreadsheet(ss).onFormSubmit().create();

  Logger.log("Triggers de Formularios 1, 2, 3 y 4 instalados correctamente");
}

// =====================================================================
// PRELLENADO DE ENLACES - v2 CORREGIDO
// =====================================================================
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Acciones Concurso")
    .addItem("Generar / Actualizar TODOS los enlaces", "generarTodosLosEnlaces")
    .addToUi();
}

// Trigger: genera enlaces solo cuando el envio viene del Formulario 1
function onFormSubmit_F1(e) {
  try {
    var nombreHoja = e.range.getSheet().getName();
    if (nombreHoja !== "Respuestas de formulario 1") return;
    Utilities.sleep(2000);
    generarEnlacesFila(e.range.getRow());
  } catch(err) { Logger.log("Error en onFormSubmit_F1: " + err); }
}

// Genera enlaces SOLO para la fila recien enviada (rapido)
function generarEnlacesFila(numFila) {
  var sheet = SpreadsheetApp.openById(SS_ID).getSheetByName("Respuestas de formulario 1");
  if (!sheet) return;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var fila    = sheet.getRange(numFila, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colCedula = -1, colNombre = -1, colPrograma = -1, colPerfil = -1;
  var colLink2  = headers.indexOf("Llenar Formulario 2");
  var colLink3  = headers.indexOf("Llenar Formulario 3");
  var colLink4  = headers.indexOf("Llenar Formulario 4");
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).toLowerCase().trim();
    if (h.indexOf("cedula") !== -1 && colCedula === -1) colCedula = i;
    else if (h.indexOf("nombre") !== -1 && h.indexOf("recibe") === -1 &&
             h.indexOf("evaluador") === -1 && h.indexOf("miembro") === -1 && colNombre === -1) colNombre = i;
    else if (h.indexOf("programa") !== -1 && colPrograma === -1) colPrograma = i;
    else if (h.indexOf("perfil") !== -1 && colPerfil === -1) colPerfil = i;
  }
  if (colCedula === -1 || colNombre === -1) return;
  if (colLink2 === -1) { colLink2 = headers.length; sheet.getRange(1, colLink2+1).setValue("Llenar Formulario 2"); headers.push("Llenar Formulario 2"); }
  if (colLink3 === -1) { colLink3 = headers.length; sheet.getRange(1, colLink3+1).setValue("Llenar Formulario 3"); headers.push("Llenar Formulario 3"); }
  if (colLink4 === -1) { colLink4 = headers.length; sheet.getRange(1, colLink4+1).setValue("Llenar Formulario 4"); headers.push("Llenar Formulario 4"); }
  var cedula   = String(fila[colCedula]  || "").trim();
  var nombre   = String(fila[colNombre]  || "").trim();
  var programa = colPrograma !== -1 ? String(fila[colPrograma] || "").trim() : "";
  var perfil   = colPerfil   !== -1 ? String(fila[colPerfil]   || "").trim() : "";
  if (!cedula || !nombre) return;
  var f2 = FormApp.openById(FORM_IDS[2]);
  var f3 = FormApp.openById(FORM_IDS[3]);
  var f4 = FormApp.openById(FORM_IDS[4]);
  var map2 = getItemsMapping(f2);
  var map3 = getItemsMapping(f3);
  var map4 = getItemsMapping(f4);
  // Form 2 usa el nombre del programa SIN el prefijo de facultad
  var programaF2 = programa.indexOf("-") > -1 ? programa.split("-").slice(1).join("-").trim() : programa;
  sheet.getRange(numFila, colLink2+1).setValue(buildUrl(f2, map2, cedula, nombre, programaF2, perfil));
  sheet.getRange(numFila, colLink3+1).setValue(buildUrl(f3, map3, cedula, nombre, programa, perfil));
  sheet.getRange(numFila, colLink4+1).setValue(buildUrl(f4, map4, cedula, nombre, programa, perfil));
  Logger.log("Enlaces generados para fila " + numFila + ": " + nombre);
}

function generarTodosLosEnlaces() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
  if (!sheet) {
    Logger.log("ERROR: No se encontro la hoja 'Respuestas de formulario 1'");
    return;
  }
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return;
  var headers = data[0];

  var colCedula = -1, colNombre = -1, colPrograma = -1, colPerfil = -1;
  var colLink2  = headers.indexOf("Llenar Formulario 2");
  var colLink3  = headers.indexOf("Llenar Formulario 3");
  var colLink4  = headers.indexOf("Llenar Formulario 4");

  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).toLowerCase().trim();
    if ((h.indexOf("cedula") !== -1 || h.indexOf("cedula") !== -1) && colCedula === -1) {
      colCedula = i;
    } else if (h.indexOf("nombre") !== -1 && h.indexOf("recibe") === -1 &&
               h.indexOf("evaluador") === -1 && h.indexOf("miembro") === -1 && colNombre === -1) {
      colNombre = i;
    } else if (h.indexOf("programa") !== -1 && colPrograma === -1) {
      colPrograma = i;
    } else if (h.indexOf("perfil") !== -1 && colPerfil === -1) {
      colPerfil = i;
    }
  }

  Logger.log("Columnas -> cedula:" + colCedula + " nombre:" + colNombre + " programa:" + colPrograma + " perfil:" + colPerfil);

  if (colCedula === -1 || colNombre === -1) {
    SpreadsheetApp.getUi().alert("Error: No se encontro la columna de Nombre o Cedula.");
    return;
  }

  if (colLink2 === -1) { colLink2 = headers.length; sheet.getRange(1, colLink2 + 1).setValue("Llenar Formulario 2"); headers.push("Llenar Formulario 2"); }
  if (colLink3 === -1) { colLink3 = headers.length; sheet.getRange(1, colLink3 + 1).setValue("Llenar Formulario 3"); headers.push("Llenar Formulario 3"); }
  if (colLink4 === -1) { colLink4 = headers.length; sheet.getRange(1, colLink4 + 1).setValue("Llenar Formulario 4"); headers.push("Llenar Formulario 4"); }

  var f2   = FormApp.openById(FORM_IDS[2]);
  var f3   = FormApp.openById(FORM_IDS[3]);
  var f4   = FormApp.openById(FORM_IDS[4]);
  var map2 = getItemsMapping(f2);
  var map3 = getItemsMapping(f3);
  var map4 = getItemsMapping(f4);

  Logger.log("F2 perfil encontrado: " + (map2.perfil !== null ? map2.perfil.getTitle() : "NO"));

  var actualizados = 0;
  for (var r = 1; r < data.length; r++) {
    var fila     = data[r];
    var cedula   = String(fila[colCedula]  || "").trim();
    var nombre   = String(fila[colNombre]  || "").trim();
    var programa = colPrograma !== -1 ? String(fila[colPrograma] || "").trim() : "";
    var perfil   = colPerfil   !== -1 ? String(fila[colPerfil]   || "").trim() : "";
    if (!cedula || !nombre) continue;

    Logger.log("Candidato: " + nombre + " | Perfil: '" + perfil + "'");

    sheet.getRange(r + 1, colLink2 + 1).setValue(buildUrl(f2, map2, cedula, nombre, programa, perfil));
    sheet.getRange(r + 1, colLink3 + 1).setValue(buildUrl(f3, map3, cedula, nombre, programa, perfil));
    sheet.getRange(r + 1, colLink4 + 1).setValue(buildUrl(f4, map4, cedula, nombre, programa, perfil));
    actualizados++;
  }

  Logger.log("Completado: " + actualizados + " candidato(s) actualizados.");
  SpreadsheetApp.getUi().alert("Listo\n\n" + actualizados + " candidato(s) actualizados.\nRevisa Ver > Registros para ver el detalle.");
}

// Verifica el tipo del item antes de asignarlo como "perfil"
// para evitar asignar encabezados de seccion
function getItemsMapping(form) {
  var items = form.getItems();
  var map   = { cedula: null, nombre: null, programa: null, perfil: null };
  for (var i = 0; i < items.length; i++) {
    var t    = items[i].getTitle().toLowerCase().trim();
    var tipo = items[i].getType();
    if ((t.indexOf("cedula") !== -1 || t.indexOf("cedula") !== -1) && !map.cedula) {
      map.cedula = items[i];
    } else if (t.indexOf("nombre") !== -1 && t.indexOf("recibe") === -1 &&
               t.indexOf("evaluador") === -1 && t.indexOf("miembro") === -1 && !map.nombre) {
      map.nombre = items[i];
    } else if (t.indexOf("programa") !== -1 && !map.programa) {
      map.programa = items[i];
    } else if (t.indexOf("perfil") !== -1 && t.indexOf("chequeo") === -1 && !map.perfil) {
      if (tipo === FormApp.ItemType.LIST ||
          tipo === FormApp.ItemType.MULTIPLE_CHOICE ||
          tipo === FormApp.ItemType.TEXT) {
        map.perfil = items[i];
        Logger.log("Perfil mapeado -> '" + items[i].getTitle() + "' tipo: " + tipo);
      }
    }
  }
  return map;
}

function buildUrl(form, map, cedula, nombre, programa, perfil) {
  var formResponse = form.createResponse();
  if (map.cedula)               fillItem(formResponse, map.cedula,   cedula);
  if (map.nombre)               fillItem(formResponse, map.nombre,   nombre);
  if (map.programa && programa) fillItem(formResponse, map.programa, programa);
  if (map.perfil   && perfil)   fillItem(formResponse, map.perfil,   perfil);
  return formResponse.toPrefilledUrl();
}

// Valida que la opcion exista en el dropdown antes de crear la respuesta
function fillItem(formResponse, item, value) {
  var v      = String(value || "").trim();
  if (!v) return;
  var t      = item.getType();
  var titulo = item.getTitle();
  try {
    if (t === FormApp.ItemType.TEXT) {
      formResponse.withItemResponse(item.asTextItem().createResponse(v));
    } else if (t === FormApp.ItemType.PARAGRAPH_TEXT) {
      formResponse.withItemResponse(item.asParagraphTextItem().createResponse(v));
    } else if (t === FormApp.ItemType.MULTIPLE_CHOICE) {
      var cMC  = item.asMultipleChoiceItem().getChoices();
      var mMC  = buscarOpcion(cMC, v);
      if (mMC) {
        formResponse.withItemResponse(item.asMultipleChoiceItem().createResponse(mMC));
      } else {
        Logger.log("RADIO '" + titulo + "': '" + v + "' no encontrada. Opciones: " + cMC.map(function(c) { return c.getValue(); }).join(", "));
      }
    } else if (t === FormApp.ItemType.LIST) {
      var cL = item.asListItem().getChoices();
      var mL = buscarOpcion(cL, v);
      if (mL) {
        formResponse.withItemResponse(item.asListItem().createResponse(mL));
        Logger.log("DROPDOWN '" + titulo + "': '" + mL + "' OK");
      } else {
        Logger.log("DROPDOWN '" + titulo + "': '" + v + "' NO encontrada. Opciones: " + cL.map(function(c) { return c.getValue(); }).join(", "));
      }
    } else if (t === FormApp.ItemType.CHECKBOX) {
      formResponse.withItemResponse(item.asCheckboxItem().createResponse([v]));
    } else {
      Logger.log("Tipo no manejado '" + titulo + "': " + t);
    }
  } catch(e) {
    Logger.log("ERROR fillItem '" + titulo + "': " + e.message);
  }
}

// Busca una opcion ignorando mayusculas/minusculas y espacios
function buscarOpcion(choices, valor) {
  var vN = valor.trim().toLowerCase();
  for (var i = 0; i < choices.length; i++) {
    if (choices[i].getValue().trim().toLowerCase() === vN) {
      return choices[i].getValue();
    }
  }
  return null;
}

// =====================================================================
// ACTUALIZAR PLANTILLA GOOGLE DOC - FORMULARIO 2
// Ejecutar UNA SOLA VEZ cuando cambies el orden de los requisitos.
// Reconstruye la tabla en orden ALFABETICO ESTRICTO: a,b,c,d,e,f,g,h,i,m,n
// IMPORTANTE: despues de ejecutar esta funcion, ejecuta onFormSubmit_F2
//             para que el mapeo del script coincida con la plantilla.
// =====================================================================
function actualizarPlantillaF2() {
  var doc  = DocumentApp.openById(TPL_FORM2_ID);
  var body = doc.getBody();

  // Orden ALFABETICO ESTRICTO segun Acuerdo 029 - Articulo Noveno
  var REQUISITOS = [
    "(a) Formato de inscripcion (A-GH-03-F-13) diligenciado y firmado por el aspirante",
    "(b) Hoja de Vida UQ (VIG-M-DO-03-F-12) diligenciada y firmada por el aspirante",
    "(c) Fotocopia del titulo de pregrado exigido para el perfil o Acta de Grado",
    "(d) Fotocopia de titulos o actas de grado de posgrado exigidos para el perfil",
    "(e) Fotocopia de la cedula y libreta militar (Ley 1861/2017)",
    "(f) Fotocopia de matricula o tarjeta profesional (o constancia de tramite)",
    "(g) Certificado de inhabilidades por delitos sexuales",
    "(h) Certificado de registro de deudores alimentarios morosos (REDAM)",
    "(i) Certificacion de experiencia especifica en docencia universitaria (minimo 3 anos)",
    "(j) Certificacion de experiencia en investigacion (rol, titulo del proyecto)",
    "(k) Certificacion de experiencia en extension o desarrollo social",
    "(l) Certificacion de experiencia en cargos academico-administrativos en IES",
    "(m) Certificacion de experiencia profesional diferente a docencia (minimo 5 anos - Art. 7 literal c)",
    "(n) Certificacion de suficiencia linguistica nivel B1 en ingles",
    "Documentos debidamente foliados (Art. 9 Acuerdo 029)"
  ];

  var tables   = body.getTables();
  var reqTable = null;
  for (var t = 0; t < tables.length; t++) {
    if (tables[t].getNumRows() >= 8 && tables[t].getRow(0).getNumCells() >= 3) {
      reqTable = tables[t];
      break;
    }
  }

  if (!reqTable) {
    Logger.log("No se encontro la tabla de requisitos en la plantilla.");
    return;
  }

  Logger.log("Tabla encontrada con " + reqTable.getNumRows() + " filas. Reconstruyendo...");

  // Eliminar TODAS las filas de datos (dejar solo el encabezado en fila 0)
  var filasActuales = reqTable.getNumRows();
  for (var f = filasActuales - 1; f >= 1; f--) {
    reqTable.removeRow(f);
  }

  // Insertar las 12 filas en orden alfabetico estricto
  for (var i = 0; i < REQUISITOS.length; i++) {
    var nuevaFila   = reqTable.appendTableRow();

    var celdaReq    = nuevaFila.appendTableCell(REQUISITOS[i]);
    celdaReq.editAsText().setFontFamily("Arial").setFontSize(9).setBold(false);
    celdaReq.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.LEFT);

    var celdaObs    = nuevaFila.appendTableCell("");
    celdaObs.editAsText().setFontFamily("Arial").setFontSize(9);

    var celdaCumple = nuevaFila.appendTableCell("");
    celdaCumple.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
    celdaCumple.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  }

  doc.saveAndClose();
  Logger.log("Plantilla actualizada correctamente con " + REQUISITOS.length + " requisitos en orden a,b,c,d,e,f,g,h,i,m,n.");
}

// =====================================================================
// AGREGAR PREGUNTAS FALTANTES EN EL FORMULARIO 2 (j, k, l)
// Ejecutar una sola vez. Busca si existen las preguntas para (j), (k), (l)
// en el formulario y si no existen, las crea automáticamente.
// =====================================================================
function agregarPreguntasFaltantesF2() {
  var form = FormApp.openById(FORM_IDS[2]);
  var items = form.getItems();
  var titulosExistentes = items.map(function(item) { return item.getTitle().toLowerCase(); });

  var nuevasPreguntas = [
    {
      tipo: "MC", // Multiple Choice
      titulo: "(j) Certificacion de experiencia en investigacion (rol, titulo del proyecto)",
      opciones: ["CUMPLE", "NO CUMPLE", "PENDIENTE - Requiere revision"]
    },
    {
      tipo: "TXT", // Text
      titulo: "Observaciones - Certificacion de experiencia en investigacion"
    },
    {
      tipo: "MC",
      titulo: "(k) Certificacion de experiencia en extension o desarrollo social",
      opciones: ["CUMPLE", "NO CUMPLE", "PENDIENTE - Requiere revision"]
    },
    {
      tipo: "TXT",
      titulo: "Observaciones - Certificacion de experiencia en extension"
    },
    {
      tipo: "MC",
      titulo: "(l) Certificacion de experiencia en cargos academico-administrativos en IES",
      opciones: ["CUMPLE", "NO CUMPLE", "PENDIENTE - Requiere revision"]
    },
    {
      tipo: "TXT",
      titulo: "Observaciones - Certificacion de experiencia en cargos"
    }
  ];

  var creadas = 0;
  for (var i = 0; i < nuevasPreguntas.length; i++) {
    var p = nuevasPreguntas[i];
    if (titulosExistentes.indexOf(p.titulo.toLowerCase()) === -1) {
      if (p.tipo === "MC") {
        var mcItem = form.addMultipleChoiceItem();
        mcItem.setTitle(p.titulo);
        mcItem.setChoices(p.opciones.map(function(op) { return mcItem.createChoice(op); }));
        mcItem.setRequired(true);
      } else if (p.tipo === "TXT") {
        var txtItem = form.addParagraphTextItem();
        txtItem.setTitle(p.titulo);
      }
      creadas++;
      Logger.log("Creada pregunta: " + p.titulo);
    }
  }

  if (creadas > 0) {
    // Si creamos preguntas nuevas, llamamos a reordenar para que queden en el lugar alfabético correcto
    Logger.log("Reordenando formulario...");
    reordenarFormulario2();
    SpreadsheetApp.getUi().alert("Se crearon " + creadas + " preguntas y el Formulario 2 fue reordenado con éxito.");
  } else {
    SpreadsheetApp.getUi().alert("Las preguntas ya existían en el formulario.");
  }
}

// =====================================================================
// REORDENAR FORMULARIO 2
// Reorganiza todas las preguntas del Formulario 2 en orden alfabetico.
// =====================================================================
function reordenarFormulario2() {
  var form  = FormApp.openById(FORM_IDS[2]);
  var items = form.getItems();

  var ordenDeseado = [
    "Cedula del Candidato",
    "Nombre Completo del Candidato",
    "Programa / Area del Concurso",
    "Perfil del Cargo",
    "Fecha de Verificacion",
    "(a) Formato de inscripcion",
    "Observaciones - Formato de Inscripcion",
    "(b) Hoja de Vida UQ",
    "Observaciones - Hoja de Vida UQ",
    "(c) Fotocopia del titulo de pregrado",
    "Observaciones - Titulo Pregrado",
    "(d) Fotocopia de titulos o actas de grado de posgrado",
    "Observaciones - Titulo Posgrado",
    "(e) Fotocopia de la cedula",
    "Observaciones - Cedula / Libreta Militar",
    "(f) Fotocopia de matricula",
    "Observaciones - Matricula / Tarjeta Profesional",
    "(g) Certificado de inhabilidades por delitos",
    "delitos sexuales",
    "(h) Certificado de registro de deudores",
    "registro de deudores alimentarios",
    "(i) Certificacion de experiencia especifica en docencia",
    "experiencia especifica en docencia",
    "(j) Certificacion de experiencia en investigacion",
    "Observaciones - Certificacion de experiencia en investigacion",
    "(k) Certificacion de experiencia en extension",
    "Observaciones - Certificacion de experiencia en extension",
    "(l) Certificacion de experiencia en cargos academico",
    "Observaciones - Certificacion de experiencia en cargos",
    "(m) Certificacion de experiencia profesional diferente a docencia",
    "experiencia profesional diferente a docencia",
    "(n) Certificacion de suficiencia linguistica",
    "suficiencia linguistica nivel B1",
    "Documentos debidamente foliados",
    "Documentos debidamente foliados",
    "5. Certificados disciplinarios",
    "Observaciones - Certificados disciplinarios",
    "Concepto Final",
    "Observaciones Generales"
  ];

  var posActual = 0;
  for (var o = 0; o < ordenDeseado.length; o++) {
    var clave = ordenDeseado[o].toLowerCase();
    for (var j = posActual; j < items.length; j++) {
      if (items[j].getTitle().toLowerCase().indexOf(clave) !== -1) {
        if (j !== posActual) {
          form.moveItem(j, posActual);
          items = form.getItems(); // refrescar
        }
        posActual++;
        break;
      }
    }
  }
  Logger.log("Formulario 2 reordenado correctamente.");
}

// =====================================================================
// CONSTRUIR FORMULARIO 3 DESDE CERO — ACUERDO 029 DE 2026 ART. 14
// ADVERTENCIA: Borra todas las preguntas existentes y reconstruye.
// Ejecutar UNA SOLA VEZ despues de confirmar que no hay respuestas.
// =====================================================================
function construirFormulario3Acuerdo029() {
  var form = FormApp.openById(FORM_IDS[3]);

  // Borrar todas las preguntas existentes
  var items = form.getItems();
  for (var i = items.length - 1; i >= 0; i--) {
    form.deleteItem(items[i]);
  }

  form.setTitle("ETAPA 3 - Hoja de Calificacion - Concurso Publico de Meritos 2026");
  form.setDescription(
    "Universidad del Quindio | Oficina de Asuntos Profesorales\n" +
    "Hoja de Calificacion segun Articulo Decimo Cuarto del Acuerdo 029 de 2026.\n" +
    "Total Hoja de Vida: 30 puntos.\n\n" +
    "NOTA: Diligencie unicamente para candidatos que CUMPLIERON todos los requisitos en la Etapa 2."
  );

  // ── DATOS BASICOS ──────────────────────────────────────────────────
  form.addTextItem().setTitle("Cedula del Candidato").setRequired(true);
  form.addTextItem().setTitle("Nombre Completo del Candidato").setRequired(true);
  form.addTextItem().setTitle("Programa / Area del Concurso").setRequired(true);
  form.addTextItem().setTitle("Perfil del Cargo").setRequired(true);
  form.addTextItem().setTitle("Nombre del Evaluador").setRequired(true);

  // ── CRITERIO 1: NIVEL ACADEMICO ADICIONAL (max 5 pts) ─────────────
  form.addPageBreakItem()
    .setTitle("CRITERIO 1 — Maximo Nivel Academico Adicional al Requerido")
    .setHelpText("Hasta 5 puntos. Solo se califica el titulo ADICIONAL al exigido por el perfil.");

  var v1 = form.addMultipleChoiceItem();
  v1.setTitle("Nivel Academico Acreditado");
  v1.setHelpText("Seleccione el titulo adicional que presenta el candidato (diferente al requerido por el perfil).");
  v1.setChoices([
    v1.createChoice("Sin titulo adicional al requerido \u2192 0 puntos"),
    v1.createChoice("Maestria adicional a la requerida \u2192 3 puntos"),
    v1.createChoice("Especializacion Medico-Quirurgica adicional \u2192 3 puntos"),
    v1.createChoice("Doctorado adicional al requerido \u2192 5 puntos")
  ]);
  v1.setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Justificacion - Nivel Academico")
    .setHelpText("Indique nombre del titulo adicional, institucion y anio de grado.")
    .setRequired(true);

  // ── CRITERIO 2: EXPERIENCIA (max 17 pts) ──────────────────────────
  form.addPageBreakItem()
    .setTitle("CRITERIO 2 — Experiencia (Hasta 17 puntos total)")
    .setHelpText("Suma de: Docencia (5) + Extension (8) + Profesional (2) + Cargos Admin. (2)");

  // 2a: Docencia universitaria
  form.addSectionHeaderItem()
    .setTitle("2a. Experiencia Docente Universitaria — Hasta 5 puntos");
  var v2a = form.addMultipleChoiceItem();
  v2a.setTitle("2a. Experiencia Docente");
  v2a.setHelpText("Total de años certificados en docencia universitaria (contabilizados en TCE).");
  v2a.setChoices([
    v2a.createChoice("3 anios o menos (solo el minimo requerido) \u2192 0 puntos"),
    v2a.createChoice("Superior a 3 y hasta 7 anios \u2192 1 punto"),
    v2a.createChoice("Superior a 7 y hasta 11 anios \u2192 3 puntos"),
    v2a.createChoice("Superior a 11 anios \u2192 5 puntos")
  ]);
  v2a.setRequired(true);
  form.addParagraphTextItem()
    .setTitle("Justificacion - Experiencia Docente")
    .setHelpText("Indique instituciones, periodos y TCE calculado.").setRequired(true);

  // 2b: Extension y Desarrollo Social
  form.addSectionHeaderItem()
    .setTitle("2b. Extension y Desarrollo Social — Hasta 8 puntos (proyectos ultimos 5 anios cerrados/liquidados)");

  var v2bCoord = form.addMultipleChoiceItem();
  v2bCoord.setTitle("2b. Participacion como Coordinador de proyectos de Extension");
  v2bCoord.setChoices([
    v2bCoord.createChoice("Sin participacion como coordinador \u2192 0 puntos"),
    v2bCoord.createChoice("Entre 1 y 10 proyectos como coordinador \u2192 2 puntos"),
    v2bCoord.createChoice("Desde 11 y mas proyectos como coordinador \u2192 4 puntos")
  ]);
  v2bCoord.setRequired(true);

  var v2bFacil = form.addMultipleChoiceItem();
  v2bFacil.setTitle("2b. Participacion como Facilitador (cursos formacion continua en IES)");
  v2bFacil.setHelpText("Docente/tutor de cursos de formacion continua o aprendizaje permanente en IES.");
  v2bFacil.setChoices([
    v2bFacil.createChoice("Sin participacion como facilitador \u2192 0 puntos"),
    v2bFacil.createChoice("Entre 200 y 400 horas como facilitador \u2192 1 punto"),
    v2bFacil.createChoice("401 horas o mas como facilitador \u2192 2 puntos")
  ]);
  v2bFacil.setRequired(true);

  var v2bLabor = form.addMultipleChoiceItem();
  v2bLabor.setTitle("2b. Participacion por labor en proyectos de Extension");
  v2bLabor.setChoices([
    v2bLabor.createChoice("Sin participacion por labor \u2192 0 puntos"),
    v2bLabor.createChoice("Entre 1 y 10 proyectos por labor \u2192 1 punto"),
    v2bLabor.createChoice("Desde 11 y mas proyectos por labor \u2192 2 puntos")
  ]);
  v2bLabor.setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Justificacion - Extension / Proyeccion")
    .setHelpText("Liste proyectos, rol, entidad y anios.").setRequired(true);

  // 2c: Experiencia profesional != docente
  form.addSectionHeaderItem()
    .setTitle("2c. Experiencia Profesional Diferente a Docente — Hasta 2 puntos");
  var v2c = form.addMultipleChoiceItem();
  v2c.setTitle("2c. Experiencia Profesional Diferente");
  v2c.setHelpText("Años de experiencia profesional diferente a la docente (superior al minimo de 5 años).");
  v2c.setChoices([
    v2c.createChoice("5 anios o menos (solo el minimo requerido) \u2192 0 puntos"),
    v2c.createChoice("Superior a 5 y hasta 10 anios \u2192 1 punto"),
    v2c.createChoice("Superior a 10 anios \u2192 2 puntos")
  ]);
  v2c.setRequired(true);
  form.addParagraphTextItem()
    .setTitle("Justificacion - Experiencia Profesional")
    .setHelpText("Indique empresa/entidad, cargo y periodo.").setRequired(true);

  // 2d: Cargos academico-administrativos
  form.addSectionHeaderItem()
    .setTitle("2d. Experiencia en Cargos Academico-Administrativos en IES — Hasta 2 puntos");
  var v2d = form.addMultipleChoiceItem();
  v2d.setTitle("2d. Experiencia en Cargos Academico");
  v2d.setHelpText("Cargos de direccion o administracion academica en Instituciones de Educacion Superior.");
  v2d.setChoices([
    v2d.createChoice("Sin experiencia en cargos academico-administrativos \u2192 0 puntos"),
    v2d.createChoice("De 1 a 4 anios en cargos academico-administrativos \u2192 0.5 puntos"),
    v2d.createChoice("Superior a 4 y hasta 8 anios \u2192 1 punto"),
    v2d.createChoice("Superior a 8 anios \u2192 2 puntos")
  ]);
  v2d.setRequired(true);
  form.addParagraphTextItem()
    .setTitle("Justificacion - Cargos Academico Administrativos")
    .setHelpText("Indique cargo, IES y periodo.").setRequired(true);

  // ── CRITERIO 3: PRODUCTIVIDAD ACADEMICA (max 8 pts) ───────────────
  form.addPageBreakItem()
    .setTitle("CRITERIO 3 — Productividad Academica (Hasta 8 puntos)")
    .setHelpText("Solo publicaciones de los ULTIMOS 5 ANIOS. Libros/software: maximo 3 autores.");

  // Articulos A1
  var v3a1 = form.addMultipleChoiceItem();
  v3a1.setTitle("3a. Articulos en Revistas Indexadas - Categoria A1 Minciencias");
  v3a1.setChoices([
    v3a1.createChoice("No presenta articulos A1 \u2192 0 puntos"),
    v3a1.createChoice("1 a 2 articulos A1 \u2192 0.5 puntos"),
    v3a1.createChoice("3 articulos A1 \u2192 1 punto"),
    v3a1.createChoice("4 articulos A1 \u2192 1.5 puntos"),
    v3a1.createChoice("5 o mas articulos A1 \u2192 2 puntos")
  ]);
  v3a1.setRequired(true);

  // Articulos A2
  var v3a2 = form.addMultipleChoiceItem();
  v3a2.setTitle("3b. Articulos en Revistas Indexadas - Categoria A2 Minciencias");
  v3a2.setChoices([
    v3a2.createChoice("No presenta articulos A2 \u2192 0 puntos"),
    v3a2.createChoice("1 a 2 articulos A2 \u2192 0.5 puntos"),
    v3a2.createChoice("3 articulos A2 \u2192 1 punto"),
    v3a2.createChoice("4 articulos A2 \u2192 1.5 puntos"),
    v3a2.createChoice("5 o mas articulos A2 \u2192 2 puntos")
  ]);
  v3a2.setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Detalle de articulos indexados")
    .setHelpText("Titulo, revista, anio, categoria (A1/A2).");

  // Libros
  var v3lib = form.addMultipleChoiceItem();
  v3lib.setTitle("3c. Libros (maximo 3 autores, ultimos 5 anios)");
  v3lib.setChoices([
    v3lib.createChoice("No presenta libros \u2192 0 puntos"),
    v3lib.createChoice("1 libro \u2192 0.5 puntos"),
    v3lib.createChoice("2 o mas libros \u2192 1 punto")
  ]);
  v3lib.setRequired(true);

  // Obras artisticas
  var v3obr = form.addMultipleChoiceItem();
  v3obr.setTitle("3d. Obras Artisticas (ultimos 5 anios)");
  v3obr.setChoices([
    v3obr.createChoice("No presenta obras artisticas \u2192 0 puntos"),
    v3obr.createChoice("1 obra \u2192 0.5 puntos"),
    v3obr.createChoice("2 o mas obras \u2192 1 punto")
  ]);
  v3obr.setRequired(true);

  // Software
  var v3sof = form.addMultipleChoiceItem();
  v3sof.setTitle("3e. Software (maximo 3 autores, ultimos 5 anios)");
  v3sof.setChoices([
    v3sof.createChoice("No presenta software \u2192 0 puntos"),
    v3sof.createChoice("1 software \u2192 0.5 puntos"),
    v3sof.createChoice("2 o mas software \u2192 1 punto")
  ]);
  v3sof.setRequired(true);

  // Produccion audiovisual
  var v3aud = form.addMultipleChoiceItem();
  v3aud.setTitle("3f. Produccion Audiovisual y Comunicativa (ultimos 5 anios)");
  v3aud.setChoices([
    v3aud.createChoice("No presenta produccion audiovisual \u2192 0 puntos"),
    v3aud.createChoice("1 produccion audiovisual \u2192 0.5 puntos"),
    v3aud.createChoice("2 o mas producciones audiovisuales \u2192 1 punto")
  ]);
  v3aud.setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Detalle de libros / obras")
    .setHelpText("Titulo, editorial/plataforma, anio, tipo, numero de autores.");

  // ── OBSERVACIONES ─────────────────────────────────────────────────
  form.addPageBreakItem()
    .setTitle("Observaciones del Evaluador");
  form.addParagraphTextItem()
    .setTitle("Observaciones Generales del Evaluador")
    .setHelpText("Comentarios adicionales, salvedades o aclaraciones sobre la evaluacion.");

  var total = form.getItems().length;
  Logger.log("Formulario 3 reconstruido con " + total + " preguntas — Acuerdo 029 de 2026.");
  SpreadsheetApp.getUi().alert(
    "Formulario 3 reconstruido exitosamente con " + total + " preguntas\n" +
    "segun el Articulo 14 del Acuerdo 029 de 2026.\n\n" +
    "Los puntajes se calculan AUTOMATICAMENTE al enviar."
  );
}

// =====================================================================
// REORDENAR FORMULARIO 3
// Reorganiza todas las preguntas del Formulario 3 en orden lógico.
// =====================================================================
function reordenarFormulario3() {
  var form  = FormApp.openById(FORM_IDS[3]);
  var items = form.getItems();

  var ordenDeseado = [
    "Cedula del Candidato",
    "Nombre Completo del Candidato",
    "Programa / Area del Concurso",
    "Perfil del Cargo",
    "Nombre del Evaluador",
    "Nivel Academico Acreditado",
    "Institucion Pregrado",
    "Titulo de Pregrado",
    "Puntaje Titulo Pregrado",
    "Posgrado Requerido por el Perfil",
    "Institucion Posgrado",
    "Titulo de Posgrado",
    "Puntaje Titulo Posgrado",
    "Justificacion - Nivel Academico",
    "Puntaje Total Criterio 1",
    "2a. Experiencia Docente",
    "Justificacion - Experiencia Docente",
    "2b. Experiencia en Investigacion",
    "Justificacion - Investigacion",
    "2c. Experiencia en Extension",
    "Justificacion - Extension / Proyeccion",
    "2d. Experiencia Profesional Diferente",
    "Justificacion - Experiencia Profesional",
    "2e. Experiencia en Cargos Academico",
    "Justificacion - Cargos Academico Administrativos",
    "Puntaje Total Criterio 2",
    "3a. Articulos en Revistas Indexadas",
    "Detalle de articulos indexados",
    "3b. Libros, Obras, Software",
    "Detalle de libros / obras",
    "Puntaje Total Criterio 3",
    "Observaciones Generales del Evaluador"
  ];

  var posActual = 0;
  for (var o = 0; o < ordenDeseado.length; o++) {
    var clave = ordenDeseado[o].toLowerCase();
    for (var j = posActual; j < items.length; j++) {
      if (items[j].getTitle().toLowerCase().indexOf(clave) !== -1) {
        if (j !== posActual) {
          form.moveItem(j, posActual);
          items = form.getItems(); // refrescar
        }
        posActual++;
        break;
      }
    }
  }
  Logger.log("Formulario 3 reordenado correctamente.");
}



