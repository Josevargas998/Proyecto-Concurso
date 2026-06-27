import zipfile, os, shutil

docx_path = r'C:\Users\jhvar\Downloads\formulario 2\LISTA DE CHEQUEO INGENIERÍA CIVIL 1.docx'
output_dir = r'C:\Users\jhvar\.gemini\antigravity-ide\scratch\Proyecto-Concurso\imagenes_plantilla'

if os.path.exists(output_dir):
    shutil.rmtree(output_dir)
os.makedirs(output_dir)

with zipfile.ZipFile(docx_path, 'r') as z:
    media_files = [f for f in z.namelist() if f.startswith('word/media/')]
    print("Imagenes encontradas:")
    for mf in media_files:
        fname = os.path.basename(mf)
        dest = os.path.join(output_dir, fname)
        with z.open(mf) as src, open(dest, 'wb') as dst:
            dst.write(src.read())
        size = os.path.getsize(dest)
        print("  {} ({} bytes) -> {}".format(fname, size, dest))

if not media_files:
    print("No se encontraron imagenes en el docx")
