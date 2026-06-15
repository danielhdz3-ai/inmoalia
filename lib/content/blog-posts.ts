export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  category: string
  readingMinutes: number
  /** Markdown simplificado */
  content: string
  relatedLinks: { href: string; label: string }[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'como-elegir-sillon-oficina-ergonomico',
    title: 'Cómo elegir un sillón de oficina ergonómico en 2026',
    excerpt:
      'Guía práctica para teletrabajo: malla vs tejido, basculante, altura regulable y qué modelos ofrecen la mejor relación calidad-precio.',
    publishedAt: '2026-05-20',
    category: 'Sillas de oficina',
    readingMinutes: 6,
    relatedLinks: [
      { href: '/categorias/sillas-oficina', label: 'Ver sillas de oficina' },
      { href: '/categorias/sillas-ergonomicas', label: 'Sillas ergonómicas' },
      { href: '/categorias/ofertas', label: 'Ofertas en sillas' },
    ],
    content: `Trabajar desde casa exige una silla que aguante 6–8 horas sin castigar la espalda. No hace falta gastar cientos de euros: lo importante es elegir bien según tu uso.

## 1. Malla transpirable o asiento acolchado

**Malla** en el respaldo mantiene la espalda fresca — ideal si sudas o trabajas en verano. Modelos como **BERNAY**, **GRAZ** o **VERTON** combinan malla con asiento en tejido.

**Tejido acolchado** aporta más confort en sesiones largas sentado reclinado. **CLAYTON** o **MELLAC** son opciones con buen acolchado y aspecto ejecutivo.

## 2. Mecanismo basculante o syncro

El **basculante** permite inclinar ligeramente el respaldo al estirarte. Las **FISS NEW** o **RISLEY** lo incluyen a precio muy competitivo.

El **syncro** sincroniza respaldo y asiento — mejor para jornadas intensas. Búscalo en **CLAYTON**, **ARANJUEZ** o **MELLAC**.

## 3. Regulación de altura y brazos

El pistón de gas debe permitir que tus pies apoyen en el suelo con rodillas a 90°. Si mides más de 1,80 m, prioriza respaldo **alto** (**UTRECHT**, **BERNAY**, **GRAZ**).

## 4. Presupuesto orientativo en INMOALIA

| Rango | Para quién | Modelos |
| --- | --- | --- |
| 80–95 € | Estudio / uso moderado | FISS NEW, CLENT, RISLEY |
| 95–120 € | Teletrabajo diario | BERNAY, GRAZ, VERTON |
| 120–210 € | Ejecutivo / 8 h+ | CLAYTON, ARANJUEZ, MELLAC |

## 5. Consejo final

Mide el espacio disponible (ancho × fondo) antes de comprar. Si dudas entre dos modelos, consulta las medidas en cada ficha o revisa nuestra [guía de sillas](/blog/como-elegir-sillon-oficina-ergonomico).

Explora toda la [categoría de sillas de oficina](/categorias/sillas-oficina) con envío en 4–8 días laborables a toda España.`,
  },
  {
    slug: 'silla-oficina-vs-gaming-diferencias',
    title: 'Silla de oficina vs gaming: ¿cuál te conviene?',
    excerpt:
      'PORTIMAO, RISLEY y más: comparamos estética racing, ergonomía real y para qué tipo de usuario encaja cada estilo.',
    publishedAt: '2026-05-18',
    category: 'Sillas de oficina',
    readingMinutes: 4,
    relatedLinks: [
      { href: '/productos/sillon-gaming-portimao-amarillo-negro', label: 'Sillón PORTIMAO gaming' },
      { href: '/categorias/sillas-oficina', label: 'Todas las sillas' },
    ],
    content: `Las sillas **gaming** (estilo racing) y las **de oficina** comparten pistón de gas, ruedas y basculante. La diferencia está sobre todo en estética y en el tipo de soporte lumbar.

## Silla gaming: cuándo elegirla

- Setup con estética deportiva o streaming
- Respaldo alto y apariencia llamativa
- Uso mixto trabajo + ocio

En INMOALIA, el **PORTIMAO** en amarillo y negro o la **RISLEY** roja aportan ese look racing sin renunciar a regulación de altura.

## Silla de oficina clásica: cuándo elegirla

- Despacho profesional o videollamadas frecuentes
- Preferencia por líneas sobrias (negro, blanco, gris)
- Malla transpirable para climas cálidos

**CLAYTON**, **BERNAY** o **FISS NEW** encajan en entornos corporativos o salones de estudio discretos.

## Ergonomía: lo que importa de verdad

1. Altura regulable con pies apoyados
2. Respaldo que acompañe la curva lumbar
3. Asiento con profundidad suficiente (mín. 45 cm útil)

El estilo gaming no es más ergonómico por defecto — depende del modelo concreto.

## Resumen

| Prioridad | Recomendación |
| --- | --- |
| Estética gaming | PORTIMAO, RISLEY |
| Oficina sobria | BERNAY, CLAYTON, FISS NEW |
| Presupuesto ajustado | FISS NEW, CLENT |
| Malla fresca | GRAZ, VERTON, BERNAY |

[Ver categoría de sillas de oficina](/categorias/sillas-oficina).`,
  },
  {
    slug: 'teletrabajo-setup-silla-escritorio',
    title: 'Setup de teletrabajo: silla + consejos de postura',
    excerpt:
      'Monta un puesto saludable en casa: altura del monitor, distancia al teclado y qué silla elegir según tus horas de pantalla.',
    publishedAt: '2026-05-15',
    category: 'Guías hogar',
    readingMinutes: 5,
    relatedLinks: [
      { href: '/categorias/sillas-ergonomicas', label: 'Sillas ergonómicas' },
      { href: '/blog/como-elegir-sillon-oficina-ergonomico', label: 'Guía de compra' },
    ],
    content: `Un buen setup de teletrabajo empieza por la **silla**, pero no termina ahí. Estos puntos reducen fatiga cervical y lumbar.

## Postura básica

- Pantalla a la altura de los ojos (o ligeramente por debajo)
- Codos a 90° sobre el teclado
- Espalda apoyada en el respaldo, no inclinada hacia delante

## Qué silla según horas de uso

**2–4 h/día:** una silla basculante económica (**FISS NEW**, **CLENT**) suele bastar.

**4–8 h/día:** invierte en malla transpirable y respaldo alto (**GRAZ**, **BERNAY**, **VERTON**).

**Jornada completa + reuniones:** syncro y brazos regulables (**CLAYTON**, **MELLAC**, **ARANJUEZ**).

## Complementos útiles

- Alfombrilla bajo la silla para proteger suelo
- Reposapiés si no llegas al suelo con los pies
- Pausas de 5 min cada hora

## En INMOALIA

Todas nuestras sillas de oficina incluyen descripción técnica, dimensiones y envío en **4–8 días laborables** a toda España. Consulta la [categoría sillas de oficina](/categorias/sillas-oficina) o las [ofertas actuales](/categorias/ofertas).`,
  },
  {
    slug: 'como-elegir-sillas-comedor',
    title: 'Cómo elegir sillas de comedor: materiales, altura y estilo',
    excerpt:
      'Madera, tapizado o mixto: guía para acertar con las sillas de tu mesa de comedor sin sacrificar comodidad ni diseño.',
    publishedAt: '2026-06-01',
    category: 'Sillas de comedor',
    readingMinutes: 5,
    relatedLinks: [
      { href: '/categorias/sillas-comedor', label: 'Sillas de comedor' },
      { href: '/categorias/mesas', label: 'Mesas de comedor' },
      { href: '/blog/cuantas-sillas-mesa-comedor', label: 'Cuántas sillas por mesa' },
    ],
    content: `Las sillas de comedor marcan el tono de toda la estancia. Más allá del color, conviene pensar en **comodidad**, **altura** y **mantenimiento**.

## Altura y mesa

La distancia ideal entre el asiento y la tabla de la mesa es de **28–32 cm**. Si ya tienes mesa, mide su altura antes de comprar. Las sillas estándar suelen tener asiento a 45–48 cm del suelo.

## Materiales

**Madera o contrachapado:** duraderas, fáciles de limpiar, encajan en estilos nórdicos y rústicos.

**Tapizado en tela o terciopelo:** más confort en comidas largas; revisa si el tejido es lavable o antimanchas.

**Estructura metálica + asiento acolchado:** look contemporáneo y buena relación peso/resistencia.

## Estilo coordinado

No hace falta un set idéntico: puedes mezclar sillas de la misma altura con respaldos distintos. En INMOALIA puedes combinar [sillas de comedor](/categorias/sillas-comedor) con [mesas](/categorias/mesas) de madera o cerámica.

## Cuántas comprar

Consulta nuestra guía [cuántas sillas caben en tu mesa](/blog/cuantas-sillas-mesa-comedor) según largo (140, 160, 180 cm…).

## Envío

Todas las sillas incluyen **envío en el precio** y entrega en 4–8 días laborables a toda España.`,
  },
  {
    slug: 'cuantas-sillas-mesa-comedor',
    title: 'Cuántas sillas de comedor necesitas según el tamaño de la mesa',
    excerpt:
      'Regla práctica: 60 cm por comensal. Tabla para mesas de 120 a 220 cm y consejos si tienes poco espacio.',
    publishedAt: '2026-05-28',
    category: 'Sillas de comedor',
    readingMinutes: 3,
    relatedLinks: [
      { href: '/categorias/sillas-comedor', label: 'Ver sillas de comedor' },
      { href: '/categorias/mesas', label: 'Mesas' },
    ],
    content: `La pregunta clásica al amueblar el comedor: **¿cuántas sillas compro?** La regla de oro en interior es **60 cm de ancho por persona** a lo largo del lado largo de la mesa.

## Tabla orientativa

| Largo mesa | Sillas (solo lados largos) | Con cabeceras |
| --- | --- | --- |
| 120 cm | 4 | 4 |
| 140 cm | 4 | 4–6 |
| 160 cm | 4–6 | 6 |
| 180 cm | 6 | 6–8 |
| 200 cm | 6–8 | 8 |
| 220 cm | 8 | 8–10 |

## Si el comedor es pequeño

- Sillas **sin brazos** ocupan menos y se deslizan mejor bajo la mesa.
- Modelos **apilables** liberan espacio cuando no hay invitados.
- Deja **90 cm** de circulación entre la mesa y la pared o mueble.

## Siguiente paso

Explora [sillas de comedor](/categorias/sillas-comedor) y combínalas con el largo de tu mesa. Envío incluido en toda España.`,
  },
  {
    slug: 'sillas-terraza-jardin-guia',
    title: 'Guía de sillas para terraza y jardín',
    excerpt:
      'Materiales resistentes al sol y la lluvia, mantenimiento y cómo elegir sillas de exterior para clima mediterráneo.',
    publishedAt: '2026-05-25',
    category: 'Sillas de exterior',
    readingMinutes: 4,
    relatedLinks: [
      { href: '/categorias/sillas-exterior', label: 'Sillas de exterior' },
      { href: '/categorias/jardin', label: 'Jardín y exterior' },
      { href: '/envio/sillas/malaga', label: 'Envío sillas Málaga' },
    ],
    content: `Las **sillas de exterior** deben soportar sol, humedad y cambios de temperatura sin deformarse ni desteñer.

## Materiales recomendados

**Aluminio o acero galvanizado:** ligeros, no oxidan si tienen tratamiento. Ideales en costa.

**Ratán sintético:** aspecto natural con mejor resistencia que el ratán natural.

**Plástico o polipropileno de calidad:** económicos y fáciles de limpiar; evita los más baratos que se agrietan al sol.

## Confort en terraza

Añade cojines outdoor desenfundables si pasas muchas horas sentado. En INMOALIA puedes combinar [sillas de exterior](/categorias/sillas-exterior) con [conjuntos de jardín](/categorias/conjuntos-exterior).

## Mantenimiento

- Guarda o cubre en invierno si no son 100 % outdoor.
- Encha las piezas metálicas una vez al año en zonas marítimas.
- Limpia con agua y jabón neutro; evita lejía en tejidos.

## Envío

Entregamos en 4–8 días laborables en toda España, incluidas zonas costeras como [Málaga](/envio/sillas/malaga) o [Valencia](/envio/sillas/valencia).`,
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug)
}
