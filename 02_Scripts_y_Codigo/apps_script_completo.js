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
    var obsGen   = d.safe("Observaciones Generales de la Verificacion");

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

    var cumpleTodos = true;

    // Pre-indexar SOLO las columnas que comienzan con "Observaciones"
    // para evitar que d.safe() encuentre el valor CUMPLE en vez de la observacion
    var obsIndex = {}; // { palabra_clave_lower -> valor_celda }
    for (var k = 0; k < d.enc.length; k++) {
      var hdr = String(d.enc[k]).trim();
      if (hdr.toLowerCase().indexOf("observaci") === 0 ||
          (hdr.toLowerCase().indexOf("observaci") >= 0 && hdr.toLowerCase().indexOf("general") < 0)) {
        // Guardar el header completo en minusculas como clave de busqueda
        obsIndex[hdr.toLowerCase()] = String(d.fila[k] || "").trim();
      }
    }

    function buscarObservacion(obsKey) {
      var k = obsKey.toLowerCase();
      // Buscar coincidencia exacta primero
      for (var hdr in obsIndex) {
        if (hdr.indexOf(k) >= 0) return obsIndex[hdr];
      }
      return "";
    }

    if (reqTable) {
      for (var i = 0; i < mapeoRequisitos.length && i < reqTable.getNumRows() - 1; i++) {
        var item    = mapeoRequisitos[i];
        var row     = reqTable.getRow(i + 1);
        var vReq    = d.safe(item.cumpleKey);
        var obsItem = buscarObservacion(item.obsKey);
        var cumple  = (vReq.toUpperCase().indexOf("CUMPLE") >= 0 &&
                       vReq.toUpperCase().indexOf("NO CUMPLE") < 0) ? "SI" : "NO";
        if (!vReq) cumple = "NO";
        if (cumple === "NO") cumpleTodos = false;

        row.getCell(1).setText(obsItem || "");

        var cCump = row.getCell(2);
        cCump.setText(cumple);
        cCump.setBackgroundColor(cumple === "SI" ? "#b7e1cd" : "#f4cccc");
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

  } catch(err) { Logger.log("Error F2: " + err); }
}

// =====================================================================
// FORMULARIO 3: HOJA DE CALIFICACION (Sheet)
// =====================================================================
function onFormSubmit_F3(e) {
  try {
    var d = getFilaDatos("Respuestas de formulario 3");
    var cedula = d.safe("Cedula del Candidato");
    var nombre = d.safe("Nombre Completo del Candidato");
    var colEnlace = d.getColIndex("Enlace Documento");
    if (colEnlace === -1) { colEnlace = d.enc.length + 1; d.hoja.getRange(1, colEnlace).setValue("Enlace Documento"); }

    var file   = DriveApp.getFileById(TPL_FORM3_ID).makeCopy("ETAPA3_" + cedula + "_" + nombre.substring(0, 30));
    var ssCopy = SpreadsheetApp.openById(file.getId());
    var ws     = ssCopy.getSheets()[0];

    var prog = d.safe("Programa / Area del Concurso");
    var fac  = prog.indexOf("-") > -1 ? prog.split("-")[0].trim() : prog;
    var prg  = prog.indexOf("-") > -1 ? prog.split("-")[1].trim() : prog;

    ws.getRange("A5").setValue("Nombre:  " + nombre);
    ws.getRange("A6").setValue("Facultad: " + fac);
    ws.getRange("A7").setValue("Programa: " + prg);
    ws.getRange("A8").setValue("Area o linea: " + d.safe("Nombre del Evaluador"));

    var p1 = d.safe("Puntaje Total Criterio 1");
    var p2 = d.safe("Puntaje Total Criterio 2");
    var p3 = d.safe("Puntaje Total Criterio 3");
    ws.getRange("D70").setValue(p1);
    ws.getRange("D71").setValue(p2);
    ws.getRange("D72").setValue(p3);

    try {
      var tot = parseFloat(p1.replace(",", ".")) + parseFloat(p2.replace(",", ".")) + parseFloat(p3.replace(",", "."));
      ws.getRange("C73").setValue(tot);
    } catch(ex) {}

    var det = ssCopy.insertSheet("Detalle Evaluacion");
    det.getRange("A1").setValue("DETALLE DE LA EVALUACION").setFontWeight("bold");
    det.getRange("A2").setValue("Candidato: " + nombre + "   CC: " + cedula);
    det.getRange("A3").setValue("Evaluador: " + d.safe("Nombre del Evaluador"));
    det.getRange("A4").setValue("Programa: " + prog);

    var data = [
      ["NIVEL ACADEMICO:", d.safe("Nivel Academico Acreditado")],
      ["Justificacion Nivel:", d.safe("Justificacion - Nivel Academico")],
      
      ["2a. Exp. Docente:", d.safe("2a. Experiencia Docente")],
      ["Justificacion 2a:", d.safe("Justificacion - Experiencia Docente")],
      
      ["2b. Investigacion:", d.safe("2b. Experiencia en Investigacion")],
      ["Justificacion 2b:", d.safe("Justificacion - Investigacion")],
      
      ["2c. Extension:", d.safe("2c. Experiencia en Extension")],
      ["Justificacion 2c:", d.safe("Justificacion - Extension / Proyeccion")],
      
      ["2d. Exp. Profesional:", d.safe("2d. Experiencia Profesional Diferente")],
      ["Justificacion 2d:", d.safe("Justificacion - Experiencia Profesional")],
      
      ["2e. Cargos Academicos:", d.safe("2e. Experiencia en Cargos Academico")],
      ["Justificacion 2e:", d.safe("Justificacion - Cargos Academico Administrativos")],
      
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
