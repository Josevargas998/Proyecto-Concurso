# -*- coding: utf-8 -*-
import sys, io, os, re, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
extraer_entry_ids.py
---------------------
Extrae los entry IDs REALES del formulario directamente del HTML
(sin depender de la API de Forms que puede devolver IDs en formato distinto).

Google Forms embebe todos los datos del formulario en la pagina HTML
como un array JavaScript: FB_PUBLIC_LOAD_DATA_ = [...]
De ahi extraemos los entry IDs exactos para las URLs pre-llenadas.
"""
import urllib.request

F2_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdgF_ixAH5MZ83ZaDjNJozy4J3n38iXD0S98-9HcA_lbBCblA/viewform"

def fetch_form_html(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
    })
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read().decode("utf-8")

def extraer_entry_ids(html):
    """
    Extrae la variable FB_PUBLIC_LOAD_DATA_ del HTML y parsea los campos.
    Retorna lista de dicts con {titulo, entry_id, tipo, opciones}
    """
    # Buscar el bloque de datos del formulario
    match = re.search(r'FB_PUBLIC_LOAD_DATA_\s*=\s*(\[.+?\]);\s*</script>', html, re.DOTALL)
    if not match:
        # Intentar patron alternativo
        match = re.search(r'var FB_PUBLIC_LOAD_DATA_\s*=\s*(\[.+?\]);', html, re.DOTALL)
    
    if not match:
        print("  No se pudo encontrar FB_PUBLIC_LOAD_DATA_ en el HTML")
        return []
    
    try:
        data = json.loads(match.group(1))
    except json.JSONDecodeError as e:
        print(f"  Error parseando JSON: {e}")
        return []
    
    campos = []
    
    # La estructura de FB_PUBLIC_LOAD_DATA_ es compleja.
    # Los campos del formulario estan en data[1][1]
    # Cada campo tiene formato: [id, titulo, descripcion, tipo, [[entry_id, ...], opciones], ...]
    try:
        form_items = data[1][1]  # Lista de items del formulario
    except (IndexError, TypeError):
        print("  Estructura inesperada en FB_PUBLIC_LOAD_DATA_")
        return []
    
    for item in form_items:
        try:
            titulo = item[1] if len(item) > 1 else "?"
            tipo_num = item[3] if len(item) > 3 else 0
            
            # Tipos: 0=texto, 1=parrafo, 2=multiple, 3=checkbox, 4=dropdown, 5=escala, 9=fecha, 10=hora
            TIPOS = {0: "TEXT", 1: "PARRAFO", 2: "RADIO", 3: "CHECKBOX", 4: "DROPDOWN", 5: "ESCALA", 9: "FECHA", 10: "HORA"}
            tipo_str = TIPOS.get(tipo_num, f"TIPO_{tipo_num}")
            
            # El entry_id esta en item[4][0][0]
            entry_id = None
            opciones = []
            if len(item) > 4 and item[4]:
                sub = item[4][0]
                if sub and len(sub) > 0:
                    entry_id = sub[0]
                # Opciones para dropdowns/radios
                if len(sub) > 1 and sub[1]:
                    opciones = [o[0] for o in sub[1] if o and o[0]]
            
            if entry_id is not None:
                campos.append({
                    "titulo": titulo,
                    "entry_id": entry_id,
                    "tipo": tipo_str,
                    "opciones": opciones
                })
        except (IndexError, TypeError):
            pass
    
    return campos

def main():
    print("=" * 65)
    print("  EXTRAYENDO ENTRY IDs REALES DEL FORMULARIO 2")
    print("  (directo del HTML de Google Forms)")
    print("=" * 65)
    
    print(f"\n  Descargando HTML de: {F2_URL[:60]}...")
    try:
        html = fetch_form_html(F2_URL)
        print(f"  HTML descargado: {len(html):,} caracteres")
    except Exception as e:
        print(f"  ERROR: {e}")
        return
    
    campos = extraer_entry_ids(html)
    
    if not campos:
        # Intentar extraccion alternativa buscando entry IDs directamente
        print("\n  Intentando extraccion alternativa...")
        entries = re.findall(r'"entry\.(\d+)"', html)
        entries += re.findall(r'entry\.(\d+)', html)
        entries = list(set(entries))
        print(f"  entry IDs encontrados en el HTML: {entries}")
        return
    
    print(f"\n  {len(campos)} campos encontrados:\n")
    
    BUSCAR = ["cedula", "nombre", "programa", "perfil", "area"]
    
    for c in campos:
        es_clave = any(k in str(c['titulo']).lower() for k in BUSCAR)
        marca = "  <-- CAMPO CLAVE" if es_clave else ""
        print(f"  [entry.{c['entry_id']}]  '{c['titulo']}'  ({c['tipo']}){marca}")
        for op in c['opciones'][:5]:
            print(f"    -> '{op}'")
        if len(c['opciones']) > 5:
            print(f"    ... y {len(c['opciones'])-5} opciones mas")
    
    print("\n  --- Comparacion con lo que estoy usando ---")
    print("  API Forms v1 dijo:")
    print("    Cedula   -> entry.15e231f0")
    print("    Nombre   -> entry.08608b86")
    print("    Programa -> entry.2508aa93")
    print("    Perfil   -> entry.24495222")
    print()
    print("  HTML real dice:")
    for c in campos:
        if any(k in str(c['titulo']).lower() for k in BUSCAR):
            print(f"    '{c['titulo']}' -> entry.{c['entry_id']}")

if __name__ == "__main__":
    main()
