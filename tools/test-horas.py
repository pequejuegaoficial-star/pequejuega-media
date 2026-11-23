#!/usr/bin/env python3
"""Excel del test de horas y días de Peque Juega.

Lee data/reels-medicion.csv (una fila por reel; la tarea semanal añade filas y actualiza las cifras)
y data/metricool-mejor-hora-*.json (actividad por día y hora de Metricool) y escribe
data/test-horas-dias.xlsx con fórmulas (se recalcula solo al cambiar los datos en Excel).

Uso: python3 tools/test-horas.py   (después: recalcular con LibreOffice si se quiere ver los valores fuera de Excel)
"""
import csv, glob, json, os, datetime as dt
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import ColorScaleRule, CellIsRule, FormulaRule
from openpyxl.worksheet.formula import ArrayFormula
from openpyxl.comments import Comment
from openpyxl.utils import get_column_letter as L

RAIZ = os.path.join(os.path.dirname(__file__), '..')
CSV = os.path.join(RAIZ, 'data', 'reels-medicion.csv')
CAL = os.path.join(RAIZ, 'data', 'calendario.csv')
MAPA = sorted(glob.glob(os.path.join(RAIZ, 'data', 'metricool-mejor-hora-*.json')))[-1]
OUT = os.path.join(RAIZ, 'data', 'test-horas-dias.xlsx')

F = 'Arial'
H = Font(name=F, bold=True, color='FFFFFF'); HF = PatternFill('solid', fgColor='1F2937')
B = Font(name=F); BB = Font(name=F, bold=True); BLUE = Font(name=F, color='0000FF'); T = Font(name=F, bold=True, size=14)
YEL = PatternFill('solid', fgColor='FFFF00'); GREY = PatternFill('solid', fgColor='F3F4F6')
thin = Side(style='thin', color='D1D5DB'); BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
MIN_N = 5

def cab(ws, fila, nombres, anchos=None):
    for i, n in enumerate(nombres, 1):
        c = ws.cell(fila, i, n); c.font = H; c.fill = HF; c.alignment = Alignment(wrap_text=True, vertical='center'); c.border = BOX
        if anchos: ws.column_dimensions[L(i)].width = anchos[i - 1]

def num(x):
    if x in ('', None): return None
    try: return float(x)
    except ValueError: return x

wb = Workbook()
# ---------------------------------------------------------------- 1. Leyenda
ws = wb.active; ws.title = 'Leyenda'
ws['A1'] = 'Peque Juega · test de horas y días'; ws['A1'].font = T
txt = [
    'Para qué sirve: decidir con datos a qué hora y qué días publicar. Cada semana se añaden los reels nuevos y sus cifras, y el Resumen se recalcula solo.',
    'Hoja «Reels»: una fila por reel. Celdas en AZUL = datos que se escriben a mano o los pone la tarea semanal (Metricool / TikTok Studio). Celdas en negro = fórmulas.',
    'Hoja «Resumen»: n, media y mediana de visualizaciones de Instagram por hora, tipo de día, día de la semana y combinación. Con menos de 5 reels por grupo pone «muestra insuficiente».',
    'Hoja «Actividad Metricool»: cuándo está conectada la audiencia según Metricool (mejor hora para publicar, 16–22 nov 2026). Con 0–2 seguidores propios, es sobre todo el patrón general de cada red, no el nuestro. Los pesos de la puntuación combinada (celdas amarillas) se pueden cambiar.',
    'Hoja «Calendario»: el plan de diciembre. Test de 3 horas (10:00, 16:00 y 20:00) repartidas por igual y rotando, con un sábado por semana para cada hora. Cada lunes la tarea mira el Resumen y, si una hora va claramente detrás, le quita huecos poco a poco (ver «Regla de decisión»).',
    'Regla de decisión (gradual): (1) cada hora necesita n ≥ 4 antes de tocar nada; (2) si una hora va ≥ 20 % por debajo de la mejor en mediana de visualizaciones a 3–9 días, pierde 1 hueco por semana en favor de la mejor; (3) ninguna hora baja de 1 reel por semana hasta n ≥ 6; (4) con empate (< 20 %), desempata la que más comentarios LIBRO/LAMINA, guardados y compartidos tenga (señales de venta); (5) un solo cambio por semana.',
    'Cuidado: las visualizaciones son ACUMULADAS el día de la medición; los reels recientes llevan menos días (columna «Días publicado»). Comparar solo reels con ≥ 2 días.',
    'TikTok: los vídeos del 4 al 16-nov se publicaron por la API de Metricool y se quedaron en 0 (problema de la API): van vacíos y no cuentan.',
    'YouTube: Metricool no da visualizaciones por vídeo de este canal; solo el total diario del canal (ver hoja «YouTube canal»).',
    'Fuente: Metricool (getAnalyticsDataByMetrics IGRE23/IGRE24/IGRE30, YTEV02; getBestTimeToPostByNetwork). Archivo generado por tools/test-horas.py desde data/reels-medicion.csv.',
]
for i, t in enumerate(txt, 3):
    ws.cell(i, 1, t).font = B; ws.cell(i, 1).alignment = Alignment(wrap_text=True, vertical='top'); ws.row_dimensions[i].height = 45
ws.column_dimensions['A'].width = 120
ws['A14'] = 'Fecha de la medición'; ws['A14'].font = BB
ws['B14'] = None

# ---------------------------------------------------------------- 2. Reels
filas = list(csv.DictReader(open(CSV, encoding='utf-8')))
r = wb.create_sheet('Reels')
cols = ['Fecha', 'Día', 'Tipo de día', 'Hora', 'Formato', 'Tipo', 'Animado', 'Reglas de retención', 'En el test', 'Post Metricool',
        'Fecha medición', 'Días publicado', 'IG visualizaciones', 'IG tiempo medio (s)', 'IG abandono < 3 s', 'TikTok visualizaciones', 'Medible (≥ 2 días)']
cab(r, 1, cols, [12, 11, 12, 8, 22, 11, 9, 11, 9, 13, 13, 10, 13, 12, 12, 13, 11])
for i, f in enumerate(filas, 2):
    fecha = dt.date.fromisoformat(f['fecha'])
    r.cell(i, 1, fecha).number_format = 'dd/mm/yyyy'
    r.cell(i, 2, f'=CHOOSE(WEEKDAY(A{i},2),"lunes","martes","miércoles","jueves","viernes","sábado","domingo")')
    r.cell(i, 3, f'=IF(WEEKDAY(A{i},2)>5,"fin de semana","laborable")')
    r.cell(i, 4, f['hora']); r.cell(i, 5, f['formato']); r.cell(i, 6, f['tipo']); r.cell(i, 7, f['animado'])
    r.cell(i, 8, f['retencion']); r.cell(i, 9, f['en_test']); r.cell(i, 10, int(f['post']) if f['post'] else None)
    fm = f['fecha_medicion']
    if fm: r.cell(i, 11, dt.date.fromisoformat(fm)).number_format = 'dd/mm/yyyy'
    r.cell(i, 12, f'=IF(K{i}="","",K{i}-A{i})')
    r.cell(i, 13, num(f['ig_visualizaciones'])); r.cell(i, 14, num(f['ig_tiempo_medio_s']))
    ab = num(f['ig_abandono_3s_pct']); r.cell(i, 15, ab / 100 if isinstance(ab, float) else None).number_format = '0.0%'
    tk = num(f['tiktok_visualizaciones']); r.cell(i, 16, tk if (tk and fecha >= dt.date(2026, 11, 18)) else None)
    r.cell(i, 17, f'=IF(AND(ISNUMBER(M{i}),ISNUMBER(L{i})),IF(L{i}>=2,"sí","no"),"")')
    r.cell(i, 14).number_format = '0.0'
    for c in range(1, 18):
        r.cell(i, c).border = BOX
        r.cell(i, c).font = BLUE if c in (1, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16) else B
last = len(filas) + 1
r.freeze_panes = 'B2'; r.auto_filter.ref = f'A1:Q{last}'
r.conditional_formatting.add(f'M2:M{last}', ColorScaleRule(start_type='min', start_color='FEE2E2', mid_type='percentile', mid_value=50, mid_color='FFFFFF', end_type='max', end_color='BBF7D0'))
r.cell(1, 13).comment = Comment('Metricool IGRE23, acumulado a la fecha de medición.', 'Claude')
r.cell(1, 15).comment = Comment('Metricool IGRE30: % que se va antes de 3 s. Cuanto más bajo, mejor.', 'Claude')
wb['Leyenda']['B14'] = f'=MAX(Reels!K2:K{last})'; wb['Leyenda']['B14'].number_format = 'dd/mm/yyyy'
wb['Leyenda']['B14'].font = B

# ---------------------------------------------------------------- 3. Resumen
s = wb.create_sheet('Resumen')
s['A1'] = 'Resumen de Instagram (solo reels del test, medibles y con visualizaciones)'; s['A1'].font = T
RNG = lambda c: f'Reels!${c}$2:${c}${last}'
cond = f'({RNG("I")}="sí")*({RNG("Q")}="sí")'
def bloque(fila, titulo, col, valores):
    s.cell(fila, 1, titulo).font = BB
    cab(s, fila + 1, ['Grupo', 'n', 'Media visualizaciones', 'Mediana visualizaciones', 'Mediana tiempo medio (s)', 'Mediana abandono < 3 s', 'Lectura'])
    for j, v in enumerate(valores):
        rr = fila + 2 + j
        s.cell(rr, 1, v).font = B
        s.cell(rr, 2, f'=SUMPRODUCT({cond}*({RNG(col)}=A{rr}))')
        s.cell(rr, 3, f'=IFERROR(SUMPRODUCT({cond}*({RNG(col)}=A{rr})*{RNG("M")})/B{rr},"")').number_format = '0'
        for c, colm, fmt in ((4, 'M', '0'), (5, 'N', '0.0'), (6, 'O', '0.0%')):
            ref = f'{L(c)}{rr}'
            s[ref] = ArrayFormula(ref, f'=IFERROR(MEDIAN(IF(({RNG("I")}="sí")*({RNG("Q")}="sí")*({RNG(col)}=A{rr}),{RNG(colm)})),"")')
            s[ref].number_format = fmt
        s.cell(rr, 7, f'=IF(B{rr}<{MIN_N},"muestra insuficiente (n<{MIN_N})","n suficiente")')
        for c in range(1, 8): s.cell(rr, c).border = BOX; s.cell(rr, c).font = B
    return fila + 3 + len(valores)
for c, w in zip('ABCDEFG', [22, 6, 14, 14, 14, 14, 26]): s.column_dimensions[c].width = w
f0 = 3
f0 = bloque(f0, 'Por hora', 'D', ['10:00', '16:00', '18:00', '20:00'])
f0 = bloque(f0, 'Por tipo de día', 'C', ['laborable', 'fin de semana'])
f0 = bloque(f0, 'Por día de la semana', 'B', DIAS)
f0 = bloque(f0, 'Por tipo de reel', 'F', ['gratis', 'cuaderno', 'afiliado'])
f0 = bloque(f0, 'Con o sin reglas de retención (antes/después: no es un experimento)', 'H', ['no', 'sí'])
s.cell(f0, 1, 'Combinaciones (solo descriptivo)').font = BB
cab(s, f0 + 1, ['Tipo de día', 'Hora', 'n', 'Mediana visualizaciones'])
for j, (d, h) in enumerate([(d, h) for d in ('laborable', 'fin de semana') for h in ('10:00', '16:00', '18:00', '20:00')]):
    rr = f0 + 2 + j
    s.cell(rr, 1, d); s.cell(rr, 2, h)
    s.cell(rr, 3, f'=SUMPRODUCT({cond}*({RNG("C")}=A{rr})*({RNG("D")}=B{rr}))')
    s[f'D{rr}'] = ArrayFormula(f'D{rr}', f'=IFERROR(MEDIAN(IF(({RNG("I")}="sí")*({RNG("Q")}="sí")*({RNG("C")}=A{rr})*({RNG("D")}=B{rr}),{RNG("M")})),"")')
    for c in range(1, 5): s.cell(rr, c).border = BOX; s.cell(rr, c).font = B
s.freeze_panes = 'A3'

# ---------------------------------------------------------------- 4. Actividad Metricool
mapa = json.load(open(MAPA, encoding='utf-8'))
a = wb.create_sheet('Actividad Metricool')
a['A1'] = 'Actividad de la audiencia por día y hora (Metricool, «mejor hora para publicar», 16–22 nov 2026, hora de Madrid)'; a['A1'].font = T
a['A2'] = 'Pesos de la puntuación combinada (reparto de visualizaciones por red; dato del 15-nov: YouTube 77 % · Instagram 23 %). Cámbialos y la tabla se recalcula:'; a['A2'].font = B
a['A3'] = 'Peso YouTube'; a['B3'] = 0.77; a['A4'] = 'Peso Instagram'; a['B4'] = 0.23
for c in ('B3', 'B4'): a[c].fill = YEL; a[c].font = BLUE; a[c].number_format = '0%'
a['C3'] = 'Fuente: claude/calendario-libros-afiliados.md (2.129 de ~2.750 visualizaciones en YouTube al 15-nov)'; a['C3'].font = B
fila = 6; pos = {}
for red in ('instagram', 'youtube', 'tiktok', 'combinada'):
    a.cell(fila, 1, {'instagram': 'Instagram', 'youtube': 'YouTube', 'tiktok': 'TikTok', 'combinada': 'Puntuación combinada Metricool (IG + YouTube), 0–1'}[red]).font = BB
    cab(a, fila + 1, ['Día'] + [f'{h}h' for h in range(24)] + ['Mejor hora'])
    pos[red] = fila + 2
    for d in range(7):
        rr = fila + 2 + d; a.cell(rr, 1, DIAS[d]).font = B
        for h in range(24):
            c = a.cell(rr, 2 + h)
            if red == 'combinada':
                yi, ii = pos['youtube'] + d, pos['instagram'] + d
                ymax = f'MAX(${L(2)}${pos["youtube"]}:${L(25)}${pos["youtube"] + 6})'
                imax = f'MAX(${L(2)}${pos["instagram"]}:${L(25)}${pos["instagram"] + 6})'
                c.value = f'=$B$3*{L(2 + h)}{yi}/{ymax}+$B$4*{L(2 + h)}{ii}/{imax}'; c.number_format = '0.00'
            else:
                c.value = mapa[red][str(d + 1)][h]; c.font = BLUE
            c.border = BOX
        a.cell(rr, 26, f'=INDEX($B${fila + 1}:$Y${fila + 1},MATCH(MAX(B{rr}:Y{rr}),B{rr}:Y{rr},0))').font = BB
    a.conditional_formatting.add(f'B{fila + 2}:Y{fila + 8}', ColorScaleRule(start_type='min', start_color='FFFFFF', end_type='max', end_color='16A34A'))
    fila += 11
a.cell(fila, 1, 'Media semanal de la puntuación combinada por hora').font = BB
cab(a, fila + 1, ['Hora', 'Media'])
for j, h in enumerate((10, 12, 16, 17, 18, 20)):
    rr = fila + 2 + j
    a.cell(rr, 1, f'{h}h'); a.cell(rr, 2, f'=AVERAGE({L(2 + h)}{pos["combinada"]}:{L(2 + h)}{pos["combinada"] + 6})').number_format = '0.00'
a.column_dimensions['A'].width = 16
for c in range(2, 26): a.column_dimensions[L(c)].width = 7
a.column_dimensions['Z'].width = 11

# ---------------------------------------------------------------- 5. YouTube canal
y = wb.create_sheet('YouTube canal')
y['A1'] = 'Visualizaciones diarias del canal de YouTube (Metricool YTEV02; no hay dato por vídeo)'; y['A1'].font = T
cab(y, 2, ['Fecha', 'Día', 'Visualizaciones del canal', '¿Se publicó un Short ese día?'], [12, 11, 14, 16])
yt = {'2026-11-04': 194, '2026-11-05': 231, '2026-11-06': 1, '2026-11-07': 1021, '2026-11-08': 3, '2026-11-09': 2, '2026-11-10': 476,
      '2026-11-11': 86, '2026-11-12': 115, '2026-11-13': 232, '2026-11-14': 227, '2026-11-15': 24, '2026-11-16': 7, '2026-11-17': 12,
      '2026-11-18': 222, '2026-11-19': 11, '2026-11-20': 116}
for i, (k, v) in enumerate(sorted(yt.items()), 3):
    y.cell(i, 1, dt.date.fromisoformat(k)).number_format = 'dd/mm/yyyy'
    y.cell(i, 2, f'=CHOOSE(WEEKDAY(A{i},2),"lunes","martes","miércoles","jueves","viernes","sábado","domingo")')
    y.cell(i, 3, v).font = BLUE
    y.cell(i, 4, f'=IF(COUNTIF(Reels!$A$2:$A${last},A{i})>0,"sí","no")')
yl = 2 + len(yt)
y.cell(yl + 2, 1, 'Media con Short publicado').font = BB; y.cell(yl + 2, 3, f'=AVERAGEIF(D3:D{yl},"sí",C3:C{yl})').number_format = '0'
y.cell(yl + 3, 1, 'Media sin Short').font = BB; y.cell(yl + 3, 3, f'=AVERAGEIF(D3:D{yl},"no",C3:C{yl})').number_format = '0'
y.cell(yl + 4, 1, 'Metricool aún no tiene los días 21–23 nov. Lectura: las visualizaciones del canal llegan casi todas el día en que sale un Short → la frecuencia importa en YouTube.').font = B

# ---------------------------------------------------------------- 6. Calendario
if os.path.exists(CAL):
    k = wb.create_sheet('Calendario')
    k['A1'] = 'Calendario de diciembre 2026 (decidido con datos el 23-nov; se revisa cada lunes)'; k['A1'].font = T
    cal = list(csv.DictReader(open(CAL, encoding='utf-8')))
    cab(k, 2, ['Fecha', 'Día', 'Tipo de día', 'Hora', 'Papel en el test', 'Tipo de reel', 'Estado'], [12, 11, 13, 8, 30, 26, 22])
    for i, c in enumerate(cal, 3):
        k.cell(i, 1, dt.date.fromisoformat(c['fecha'])).number_format = 'dd/mm/yyyy'
        k.cell(i, 2, f'=CHOOSE(WEEKDAY(A{i},2),"lunes","martes","miércoles","jueves","viernes","sábado","domingo")')
        k.cell(i, 3, f'=IF(WEEKDAY(A{i},2)>5,"fin de semana","laborable")')
        k.cell(i, 4, c['hora']); k.cell(i, 5, c['papel']); k.cell(i, 6, c['tipo']); k.cell(i, 7, c['estado'])
        for j in range(1, 8): k.cell(i, j).border = BOX; k.cell(i, j).font = BLUE if j in (1, 4, 5, 6, 7) else B
    n = len(cal) + 2
    k.cell(n + 2, 1, 'Publicaciones de Metricool en diciembre').font = BB
    k.cell(n + 2, 5, f'=COUNTA(A3:A{n})').font = BB
    k.cell(n + 3, 1, 'Cupo del plan gratis').font = BB; k.cell(n + 3, 5, 20).font = BLUE
    k.cell(n + 4, 1, 'Reserva').font = BB; k.cell(n + 4, 5, f'=E{n + 3}-E{n + 2}').font = BB
    k.conditional_formatting.add(f'D3:D{n}', CellIsRule(operator='equal', formula=['"16:00"'], fill=PatternFill('solid', fgColor='DBEAFE')))
    k.conditional_formatting.add(f'D3:D{n}', CellIsRule(operator='equal', formula=['"20:00"'], fill=PatternFill('solid', fgColor='FCE7F3')))

for w in wb.worksheets:
    for row in w.iter_rows():
        for c in row:
            if c.font and c.font.name != F: c.font = Font(name=F, bold=c.font.bold, color=c.font.color, size=c.font.size)
wb.save(OUT)
print(OUT)
