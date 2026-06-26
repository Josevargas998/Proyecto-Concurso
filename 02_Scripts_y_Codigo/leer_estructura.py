import openpyxl
import pdfplumber

wb = openpyxl.load_workbook(r'3.xlsx')
ws = wb.active
print('=== 3.xlsx estructura ===')
for row in ws.iter_rows():
    for cell in row:
        if cell.value is not None:
            bg = None
            try:
                if cell.fill.fill_type == 'solid':
                    bg = cell.fill.fgColor.rgb
            except:
                pass
            print(f'  {cell.coordinate}: {str(cell.value)[:60]!r}  bold={cell.font.bold}  bg={bg}')

print()
print('MERGED:', list(str(m) for m in ws.merged_cells.ranges))
print('COL WIDTHS:')
for k, v in ws.column_dimensions.items():
    if v.width:
        print(f'  {k}: {v.width}')
print('ROW HEIGHTS:')
for k, v in ws.row_dimensions.items():
    if v.height:
        print(f'  {k}: {v.height}')

print()
print('=== 4.pdf estructura ===')
with pdfplumber.open(r'4.pdf') as pdf:
    for i, page in enumerate(pdf.pages[:3]):
        text = page.extract_text()
        if text:
            print(f'--- pagina {i+1} ---')
            print(text)
