# Ganchos psicológicos — Peque Juega (test desde dic-2026)

Objetivo (Jorge, 23-nov): "ir probando para conseguir ventas con ganchos psicológicos y viendo lo que más gusta o lo que más se queda la gente".

El gancho es el titular del fotograma 0 (máx. 7 palabras, 2–3 resaltadas). En los reels que no son de venta, la palabra GRATIS va SIEMPRE en la etiqueta de arriba (`"etiqueta": "GRATIS · …"`), así el "gratis" es constante y lo que se prueba es el tipo de gancho. Cada ficha lleva `"gancho_tipo"` con uno de estos valores (y se copia en `data/reels-medicion.csv`).

| Tipo (`gancho_tipo`) | Palanca psicológica | Ejemplos (español neutro) |
|---|---|---|
| gratis (control) | Reciprocidad: recibir algo sin pagar | "3 juegos *gratis* para esta tarde" |
| problema | Identificación: "eso me pasa a mí" | "¿Llueve y tu peque *no para*?" · "¿Pide la tablet *otra vez*?" |
| número/tiempo | Facilidad concreta: poco esfuerzo, resultado claro | "*5 minutos*, 1 caja, 3 juegos" · "Maracas caseras en *5 minutos*" |
| resultado | Aspiración: imaginar el después | "Una tarde *tranquila* sin pantallas" |
| contrario | Romper el patrón: lo inesperado | "*No tires* los rollos de papel" · "Guarda esa caja: *no es basura*" |
| curiosidad | Brecha de información (se resuelve en el vídeo) | "El juego que solo necesita *una cuchara*" · "¿Para qué sirve *una pinza*?" |
| urgencia de calendario | Fecha real que se acerca (nunca escasez inventada) | "Faltan *24 días* para Navidad" · "Plan para *este sábado*" |
| pregunta reto | Participación: invita a comentar | "¿Tu peque aguanta *10 segundos* quieto?" |

## Prohibido (aunque "funcione")
- Prueba social inventada ("miles de padres ya…"), cifras o estudios que no tengamos.
- Escasez o descuentos falsos ("últimas unidades", "solo hoy").
- Miedo o culpa sobre el desarrollo o la salud de los niños ("si no haces esto, tu hijo…"), afirmaciones médicas.
- Clickbait que el vídeo no cumple: la promesa del gancho se entrega en las ideas.
- Hablar a los niños: siempre a los padres.

## Cómo se mide
- Métrica principal del gancho: % que se va antes de 3 s (Instagram IGRE30; cuanto más bajo, mejor) y tiempo medio visto (IGRE24; TikTok tiempo medio).
- Secundaria (lo que vende): comentarios (LAMINA/LIBRO), guardados, compartidos, clics de afiliado.
- Resumen por tipo en `data/test-horas-dias.xlsx` → hoja Resumen → "Por tipo de GANCHO".
- Regla gradual (la aplica la tarea de los lunes): con n ≥ 3 por tipo, el tipo con peor abandono (≥ 5 puntos peor que la mediana del resto) sale de la rotación y entra uno nuevo o una variante del mejor; un solo cambio por semana. Los tipos que ganen con n ≥ 5 pasan a usarse en la mitad de los reels, y la otra mitad sigue probando.
- TikTok acelera el test sin gastar cupo: cada reedición usa un tipo de gancho distinto al del original.

## Punto de partida (Instagram, reels hasta el 22-nov, etiquetados a posteriori)
| Tipo | n | Mediana visualizaciones | Mediana abandono < 3 s |
|---|---|---|---|
| número/tiempo | 4 | 108 | 66,2 % |
| problema | 5 (2 son de venta) | 76 | 74,0 % |
| resultado | 2 | 81 | 79,3 % |
| contrario | 1 | 38 | 69,4 % |
| gratis | 1 | 84 | 65,8 % |
Muestra insuficiente en todos: es solo el punto de partida.
