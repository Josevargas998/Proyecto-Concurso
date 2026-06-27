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

    var fac = prog.indexOf("-") > -1 ? prog.split("-")[0].trim() : prog;
    var prg = prog.indexOf("-") > -1 ? prog.split("-")[1].trim() : prog;

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
    var REQS = [
      "1. Formato de Inscripcion firmado por el aspirante",
      "2. Hoja de Vida UQ (Formato GH-FOR-006)",
      "3. Fotocopia de cedula y libreta militar",
      "4. Fotocopia de matricula o tarjeta profesional",
      "5. Certificados disciplinarios, judiciales o fiscales vigentes",
      "6. Certificado de experiencia docente universitaria",
      "7. Titulo de Pregrado requerido por el perfil",
      "8. Titulo de Posgrado requerido por el perfil",
      "9. Experiencia minima en el area del concurso (segun perfil)",
      "10. Tema de disertacion presentado",
      "11. Documentos debidamente foliados"
    ];

    var tables = body.getTables();

    // Buscar la tabla de requisitos: la que tiene 3 columnas y al menos 10 filas
    var reqTable = null;
    for (var t = 0; t < tables.length; t++) {
      if (tables[t].getNumRows() >= 10 && tables[t].getRow(0).getNumCells() >= 3) {
        reqTable = tables[t];
        break;
      }
    }

    var cumpleTodos = true;
    if (reqTable) {
      for (var i = 0; i < REQS.length && i < reqTable.getNumRows() - 1; i++) {
        var row     = reqTable.getRow(i + 1); // Fila 0 es encabezado
        var vReq    = d.safe(REQS[i]);
        var obsItem = d.safe("Observaciones - " + (i + 1));
        var cumple  = (vReq.toUpperCase().indexOf("CUMPLE") >= 0 &&
                       vReq.toUpperCase().indexOf("NO CUMPLE") < 0) ? "SI" : "NO";
        if (cumple === "NO") cumpleTodos = false;

        // Columna OBSERVACIONES (col 1)
        row.getCell(1).setText(obsItem || "");

        // Columna CUMPLE (col 2): VERDE o ROJO
        var cCump = row.getCell(2);
        cCump.setText(cumple);
        cCump.setBackgroundColor(cumple === "SI" ? "#b7e1cd" : "#f4cccc");
        cCump.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
        cCump.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      }
    }

    // ── 4. TABLA "CUMPLE CON TODOS LOS REQUISITOS" ───────────────────
    // Buscar: 2 filas y 3 columnas
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
      ["Justificacion nivel:", d.safe("Justificacion - Nivel Academico")],
      ["2a. Exp. Docente:", d.safe("2a. Experiencia Docente")],
      ["2b. Investigacion:", d.safe("2b. Experiencia en Investigacion")],
      ["2c. Extension:", d.safe("2c. Experiencia en Extension")],
      ["2d. Exp. Profesional:", d.safe("2d. Experiencia Profesional Diferente")],
      ["2e. Cargos Academicos:", d.safe("2e. Experiencia en Cargos Academico")],
      ["Articulos indexados:", d.safe("Detalle de articulos indexados")],
      ["Libros / obras:", d.safe("Detalle de libros / obras")],
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

  ScriptApp.newTrigger("onFormSubmit_F2").forSpreadsheet(ss).onFormSubmit().create();
  ScriptApp.newTrigger("onFormSubmit_F3").forSpreadsheet(ss).onFormSubmit().create();
  ScriptApp.newTrigger("onFormSubmit_F4").forSpreadsheet(ss).onFormSubmit().create();

  Logger.log("Triggers de Formularios 2, 3 y 4 instalados correctamente");
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

// Trigger: se activa cuando un candidato envia el Formulario 1
function onFormSubmit(e) {
  Utilities.sleep(2000);
  generarTodosLosEnlaces();
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
