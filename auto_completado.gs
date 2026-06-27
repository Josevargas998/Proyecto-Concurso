// auto_completado.gs
// ------------------
// Genera enlaces pre-llenados para los Formularios 2, 3 y 4
// desde las respuestas del Formulario 1.
//
// CORRECCIONES v2:
//   - fillItem: valida opciones del dropdown antes de crear la respuesta
//   - fillItem: registra errores con Logger en lugar de silenciarlos
//   - generarTodosLosEnlaces: regenera SIEMPRE (no solo si esta vacio)
//   - Nueva funcion: onFormSubmit para auto-generar al recibir inscripcion

var FORM_IDS = {
  2: "1xoVPJ8jAjrUibp-jH8zIhmdNe6r7Ilx9aPiFQUETSI4",
  3: "1DP9UE2oQJ2vCA3bV7oTnvUMW7xA5xiSiS-F96_8nnm8",
  4: "1A-YFD_8xGqwe-Dh3viMGerN6_Uj2agPRR_X8KuIwJlA"
};

// ── Menu de herramientas ──────────────────────────────────────────────────
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Acciones Concurso')
      .addItem('Generar / Actualizar TODOS los enlaces', 'generarTodosLosEnlaces')
      .addToUi();
}

// ── Trigger al recibir nueva inscripcion en Formulario 1 ─────────────────
function onFormSubmit(e) {
  // Se activa con trigger: "Al enviar formulario" en la hoja del Formulario 1
  Utilities.sleep(2000); // esperar a que el Sheets registre la fila
  generarTodosLosEnlaces();
}

// ── Funcion principal: genera/actualiza enlaces para TODOS los candidatos──
function generarTodosLosEnlaces() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
  if (!sheet) {
    Logger.log("ERROR: No se encontro la hoja 'Respuestas de formulario 1'");
    return;
  }

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    Logger.log("No hay datos en el formulario 1");
    return;
  }

  var headers = data[0];

  // Detectar columnas clave por nombre
  var colCedula = -1, colNombre = -1, colPrograma = -1, colPerfil = -1;
  var colLink2 = headers.indexOf("Llenar Formulario 2");
  var colLink3 = headers.indexOf("Llenar Formulario 3");
  var colLink4 = headers.indexOf("Llenar Formulario 4");

  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).toLowerCase().trim();
    if ((h.indexOf("cedula") !== -1 || h.indexOf("cédula") !== -1) && colCedula === -1) {
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

  Logger.log("Columnas detectadas -> cedula:" + colCedula + " nombre:" + colNombre +
             " programa:" + colPrograma + " perfil:" + colPerfil);

  if (colCedula === -1 || colNombre === -1) {
    SpreadsheetApp.getUi().alert("Error: No se encontró la columna de Nombre o Cédula.");
    return;
  }

  // Crear columnas de links si no existen
  if (colLink2 === -1) {
    colLink2 = headers.length;
    sheet.getRange(1, colLink2 + 1).setValue("Llenar Formulario 2");
    headers.push("Llenar Formulario 2");
  }
  if (colLink3 === -1) {
    colLink3 = headers.length;
    sheet.getRange(1, colLink3 + 1).setValue("Llenar Formulario 3");
    headers.push("Llenar Formulario 3");
  }
  if (colLink4 === -1) {
    colLink4 = headers.length;
    sheet.getRange(1, colLink4 + 1).setValue("Llenar Formulario 4");
    headers.push("Llenar Formulario 4");
  }

  // Abrir formularios y detectar campos
  var f2 = FormApp.openById(FORM_IDS[2]);
  var f3 = FormApp.openById(FORM_IDS[3]);
  var f4 = FormApp.openById(FORM_IDS[4]);

  var map2 = getItemsMapping(f2);
  var map3 = getItemsMapping(f3);
  var map4 = getItemsMapping(f4);

  Logger.log("Mapa F2 -> perfil encontrado: " + (map2.perfil !== null));
  Logger.log("Mapa F3 -> perfil encontrado: " + (map3.perfil !== null));
  Logger.log("Mapa F4 -> perfil encontrado: " + (map4.perfil !== null));

  var actualizados = 0;

  for (var r = 1; r < data.length; r++) {
    var fila = data[r];
    var cedula  = String(fila[colCedula]  || "").trim();
    var nombre  = String(fila[colNombre]  || "").trim();
    var programa = colPrograma !== -1 ? String(fila[colPrograma] || "").trim() : "";
    var perfil   = colPerfil   !== -1 ? String(fila[colPerfil]   || "").trim() : "";

    if (!cedula || !nombre) continue;

    Logger.log("Generando links para: " + nombre + " | CC: " + cedula + " | Perfil: '" + perfil + "'");

    // SIEMPRE regenerar (para corregir links anteriores con el bug del perfil)
    var link2 = buildUrl(f2, map2, cedula, nombre, programa, perfil);
    var link3 = buildUrl(f3, map3, cedula, nombre, programa, perfil);
    var link4 = buildUrl(f4, map4, cedula, nombre, programa, perfil);

    sheet.getRange(r + 1, colLink2 + 1).setValue(link2);
    sheet.getRange(r + 1, colLink3 + 1).setValue(link3);
    sheet.getRange(r + 1, colLink4 + 1).setValue(link4);

    actualizados++;
  }

  Logger.log("Proceso completado. " + actualizados + " candidato(s) actualizados.");
  SpreadsheetApp.getUi().alert(
    "✅ Listo\n\n" + actualizados + " candidato(s) con enlaces actualizados.\n" +
    "Revisa el menu Ver > Registros para ver el detalle."
  );
}

// ── Detecta campos clave en un formulario por nombre ─────────────────────
function getItemsMapping(form) {
  var items = form.getItems();
  var map = { cedula: null, nombre: null, programa: null, perfil: null };

  for (var i = 0; i < items.length; i++) {
    var t = items[i].getTitle().toLowerCase().trim();

    if ((t.indexOf("cedula") !== -1 || t.indexOf("cédula") !== -1) && !map.cedula) {
      map.cedula = items[i];
    } else if (t.indexOf("nombre") !== -1 && t.indexOf("recibe") === -1 &&
               t.indexOf("evaluador") === -1 && t.indexOf("miembro") === -1 && !map.nombre) {
      map.nombre = items[i];
    } else if (t.indexOf("programa") !== -1 && !map.programa) {
      map.programa = items[i];
    } else if (t.indexOf("perfil") !== -1 && !map.perfil) {
      // Solo asignar si es un campo de pregunta real (no seccion de encabezado)
      var tipo = items[i].getType();
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

// ── Construye la URL pre-llenada ─────────────────────────────────────────
function buildUrl(form, map, cedula, nombre, programa, perfil) {
  var formResponse = form.createResponse();

  if (map.cedula)                 fillItem(formResponse, map.cedula,   cedula);
  if (map.nombre)                 fillItem(formResponse, map.nombre,   nombre);
  if (map.programa && programa)   fillItem(formResponse, map.programa, programa);
  if (map.perfil   && perfil)     fillItem(formResponse, map.perfil,   perfil);

  return formResponse.toPrefilledUrl();
}

// ── Rellena un campo de cualquier tipo en el formResponse ─────────────────
function fillItem(formResponse, item, value) {
  var v = String(value || "").trim();
  if (!v) return;

  var t = item.getType();
  var titulo = item.getTitle();

  try {
    if (t === FormApp.ItemType.TEXT) {
      formResponse.withItemResponse(item.asTextItem().createResponse(v));

    } else if (t === FormApp.ItemType.PARAGRAPH_TEXT) {
      formResponse.withItemResponse(item.asParagraphTextItem().createResponse(v));

    } else if (t === FormApp.ItemType.MULTIPLE_CHOICE) {
      // Radio button: verificar que la opcion exista
      var choicesMC = item.asMultipleChoiceItem().getChoices();
      var matchMC = buscarOpcion(choicesMC, v);
      if (matchMC) {
        formResponse.withItemResponse(item.asMultipleChoiceItem().createResponse(matchMC));
      } else {
        Logger.log("RADIO '" + titulo + "': opcion '" + v + "' no encontrada entre: " +
          choicesMC.map(function(c) { return c.getValue(); }).join(", "));
      }

    } else if (t === FormApp.ItemType.LIST) {
      // Dropdown: verificar que la opcion exista (CORRECCION PRINCIPAL)
      var choicesList = item.asListItem().getChoices();
      var matchList = buscarOpcion(choicesList, v);
      if (matchList) {
        formResponse.withItemResponse(item.asListItem().createResponse(matchList));
        Logger.log("DROPDOWN '" + titulo + "': opcion '" + matchList + "' seleccionada OK");
      } else {
        Logger.log("DROPDOWN '" + titulo + "': opcion '" + v + "' NO encontrada entre: " +
          choicesList.map(function(c) { return c.getValue(); }).join(", "));
      }

    } else if (t === FormApp.ItemType.CHECKBOX) {
      formResponse.withItemResponse(item.asCheckboxItem().createResponse([v]));

    } else {
      Logger.log("Tipo no manejado en '" + titulo + "': " + t);
    }

  } catch (e) {
    Logger.log("ERROR en fillItem '" + titulo + "': " + e.message);
  }
}

// ── Busca la opcion en un array de choices (case-insensitive + trim) ──────
function buscarOpcion(choices, valor) {
  var vNorm = valor.trim().toLowerCase();
  for (var i = 0; i < choices.length; i++) {
    var choiceVal = choices[i].getValue();
    if (choiceVal.trim().toLowerCase() === vNorm) {
      return choiceVal; // retorna el valor EXACTO de la opcion
    }
  }
  return null;
}
