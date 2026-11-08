/**
 * Schema Forge — definiciones de Schema.org y generadores JSON-LD.
 *
 * Para agregar un nuevo schema:
 *  1. Creá un `SchemaDef` con sus `fields` y funciones `build`/`validate`.
 *  2. Agregalo al array `SCHEMAS`.
 *  3. Registrá su icono en `components/SchemaForge.tsx` → `ICONS`.
 */

export type FieldKind =
  | "text"
  | "textarea"
  | "url"
  | "email"
  | "number"
  | "select"
  | "list"
  | "pairs";

export interface PairField {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  group?: string;
  options?: { value: string; label: string }[];
  /** Solo para kind "pairs": definición de los dos campos de cada ítem */
  pairFields?: [PairField, PairField];
  /** Label del botón "agregar" para kind "pairs" */
  addLabel?: string;
}

export type PairItem = Record<string, string>;
export type Values = Record<string, unknown>;

export interface SchemaDef {
  id: string;
  name: string;
  tagline: string;
  fields: FieldDef[];
  build: (v: Values) => Record<string, unknown>;
  /** Devuelve paths (dot-notation) de campos requeridos vacíos dentro del JSON generado */
  validate: (json: Record<string, unknown>) => string[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const strList = (v: unknown) =>
  Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];

const num = (v: unknown) => {
  const n = Number(v);
  return v !== "" && v !== undefined && v !== null && !Number.isNaN(n) ? n : "";
};

const pairItems = (v: unknown): PairItem[] =>
  Array.isArray(v)
    ? (v as PairItem[]).filter((p) => typeof p === "object" && p !== null)
    : [];

const get = (o: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k];
    return undefined;
  }, o);

function missingPaths(json: Record<string, unknown>, paths: string[]): string[] {
  return paths.filter((p) => {
    const val = get(json, p);
    if (val === "" || val === undefined || val === null) return true;
    if (Array.isArray(val) && val.length === 0) return true;
    return false;
  });
}

const minutesToISO = (mins: unknown) => {
  const n = num(mins);
  return n === "" ? "" : `PT${n}M`;
};

/* ------------------------------------------------------------------ */
/* Organization                                                        */
/* ------------------------------------------------------------------ */

const organization: SchemaDef = {
  id: "organization",
  name: "Organization",
  tagline: "Datos de marca para Google Knowledge Graph",
  fields: [
    { key: "name", label: "Nombre de la organización", kind: "text", required: true, placeholder: "Acme Corp", group: "Identidad" },
    { key: "url", label: "URL del sitio web", kind: "url", required: true, placeholder: "https://acme.com", group: "Identidad" },
    { key: "logo", label: "URL del logo", kind: "url", placeholder: "https://acme.com/logo.png", group: "Identidad" },
    { key: "description", label: "Descripción", kind: "textarea", placeholder: "Qué hace tu empresa...", group: "Identidad" },
    { key: "email", label: "Email de contacto", kind: "email", placeholder: "hola@acme.com", group: "Contacto" },
    { key: "sameAs", label: "Perfiles sociales (uno por línea)", kind: "list", placeholder: "https://x.com/acme", group: "Contacto" },
  ],
  build: (v) => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: str(v.name),
    url: str(v.url),
    logo: str(v.logo),
    description: str(v.description),
    email: str(v.email),
    sameAs: strList(v.sameAs),
  }),
  validate: (j) => missingPaths(j, ["name", "url"]),
};

/* ------------------------------------------------------------------ */
/* Product                                                             */
/* ------------------------------------------------------------------ */

const product: SchemaDef = {
  id: "product",
  name: "Product",
  tagline: "Rich snippets de producto en resultados de búsqueda",
  fields: [
    { key: "name", label: "Nombre del producto", kind: "text", required: true, placeholder: "Zapatillas Runner X1", group: "Producto" },
    { key: "description", label: "Descripción", kind: "textarea", placeholder: "Materiales, beneficios, talles...", group: "Producto" },
    { key: "image", label: "URL de imagen principal", kind: "url", placeholder: "https://acme.com/img/producto.jpg", group: "Producto" },
    { key: "brand", label: "Marca", kind: "text", placeholder: "Acme", group: "Producto" },
    { key: "sku", label: "SKU / Código", kind: "text", placeholder: "RUN-X1-42", group: "Producto" },
    { key: "offers.price", label: "Precio", kind: "number", required: true, placeholder: "129.99", group: "Oferta" },
    { key: "offers.priceCurrency", label: "Moneda (ISO 4217)", kind: "text", required: true, placeholder: "USD", group: "Oferta" },
    {
      key: "offers.availability",
      label: "Disponibilidad",
      kind: "select",
      options: [
        { value: "https://schema.org/InStock", label: "En stock" },
        { value: "https://schema.org/OutOfStock", label: "Sin stock" },
        { value: "https://schema.org/PreOrder", label: "Preventa" },
        { value: "https://schema.org/LimitedAvailability", label: "Stock limitado" },
      ],
      group: "Oferta",
    },
    { key: "offers.url", label: "URL de compra", kind: "url", placeholder: "https://acme.com/producto", group: "Oferta" },
    { key: "aggregateRating.ratingValue", label: "Valoración (ej: 4.8)", kind: "number", placeholder: "4.8", group: "Valoración" },
    { key: "aggregateRating.reviewCount", label: "Cantidad de reseñas", kind: "number", placeholder: "128", group: "Valoración" },
  ],
  build: (v) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: str(v.name),
    description: str(v.description),
    image: str(v.image),
    brand: str(v.brand) ? { "@type": "Brand", name: str(v.brand) } : "",
    sku: str(v.sku),
    offers: {
      "@type": "Offer",
      price: num(v["offers.price"]),
      priceCurrency: str(v["offers.priceCurrency"]),
      availability: str(v["offers.availability"]) || "https://schema.org/InStock",
      url: str(v["offers.url"]),
    },
    aggregateRating:
      num(v["aggregateRating.ratingValue"]) !== "" ||
      num(v["aggregateRating.reviewCount"]) !== ""
        ? {
            "@type": "AggregateRating",
            ratingValue: num(v["aggregateRating.ratingValue"]),
            reviewCount: num(v["aggregateRating.reviewCount"]),
            bestRating: 5,
            worstRating: 1,
          }
        : "",
  }),
  validate: (j) => missingPaths(j, ["name", "offers.price", "offers.priceCurrency"]),
};

/* ------------------------------------------------------------------ */
/* Recipe                                                              */
/* ------------------------------------------------------------------ */

const recipe: SchemaDef = {
  id: "recipe",
  name: "Recipe",
  tagline: "Tarjetas de receta con foto, tiempo y calorías en Google",
  fields: [
    { key: "name", label: "Nombre de la receta", kind: "text", required: true, placeholder: "Pastel de zanahoria", group: "Receta" },
    { key: "description", label: "Descripción", kind: "textarea", placeholder: "Una receta húmeda y especiada...", group: "Receta" },
    { key: "image", label: "URL de la foto", kind: "url", required: true, placeholder: "https://acme.com/recetas/pastel.jpg", group: "Receta" },
    { key: "author", label: "Autor", kind: "text", placeholder: "María Gómez", group: "Receta" },
    { key: "prepTime", label: "Preparación (min)", kind: "number", placeholder: "20", group: "Tiempos" },
    { key: "cookTime", label: "Cocción (min)", kind: "number", placeholder: "45", group: "Tiempos" },
    { key: "recipeYield", label: "Rinde (porciones)", kind: "text", placeholder: "12 porciones", group: "Tiempos" },
    { key: "recipeIngredient", label: "Ingredientes (uno por línea)", kind: "list", required: true, placeholder: "2 tazas de harina", group: "Ingredientes" },
    {
      key: "recipeInstructions",
      label: "Pasos (uno por línea)",
      kind: "list",
      required: true,
      placeholder: "Precalentar el horno a 180°C",
      group: "Preparación",
    },
  ],
  build: (v) => ({
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: str(v.name),
    description: str(v.description),
    image: str(v.image),
    author: str(v.author) ? { "@type": "Person", name: str(v.author) } : "",
    prepTime: minutesToISO(v.prepTime),
    cookTime: minutesToISO(v.cookTime),
    recipeYield: str(v.recipeYield),
    recipeIngredient: strList(v.recipeIngredient),
    recipeInstructions: strList(v.recipeInstructions),
  }),
  validate: (j) => missingPaths(j, ["name", "image", "recipeIngredient", "recipeInstructions"]),
};

/* ------------------------------------------------------------------ */
/* LocalBusiness                                                       */
/* ------------------------------------------------------------------ */

const localBusiness: SchemaDef = {
  id: "localbusiness",
  name: "LocalBusiness",
  tagline: "Presencia en Google Maps y resultados locales",
  fields: [
    { key: "name", label: "Nombre del negocio", kind: "text", required: true, placeholder: "Café Central", group: "Negocio" },
    { key: "description", label: "Descripción", kind: "textarea", placeholder: "Cafetería de especialidad...", group: "Negocio" },
    { key: "url", label: "URL del sitio", kind: "url", placeholder: "https://cafecentral.com", group: "Negocio" },
    { key: "telephone", label: "Teléfono", kind: "text", required: true, placeholder: "+54 11 5555-1234", group: "Contacto" },
    { key: "priceRange", label: "Rango de precios", kind: "text", placeholder: "$$", group: "Contacto" },
    { key: "address.street", label: "Calle y número", kind: "text", required: true, placeholder: "Av. Corrientes 1234", group: "Dirección" },
    { key: "address.addressLocality", label: "Ciudad", kind: "text", required: true, placeholder: "Buenos Aires", group: "Dirección" },
    { key: "address.addressRegion", label: "Provincia / Estado", kind: "text", placeholder: "CABA", group: "Dirección" },
    { key: "address.postalCode", label: "Código postal", kind: "text", placeholder: "C1043", group: "Dirección" },
    { key: "address.addressCountry", label: "País (ISO)", kind: "text", placeholder: "AR", group: "Dirección" },
    { key: "geo.latitude", label: "Latitud", kind: "number", placeholder: "-34.6037", group: "Geolocalización" },
    { key: "geo.longitude", label: "Longitud", kind: "number", placeholder: "-58.3816", group: "Geolocalización" },
    { key: "openingHours", label: "Horarios (ej: Mo-Fr 09:00-18:00)", kind: "text", placeholder: "Mo-Fr 08:00-20:00, Sa 09:00-14:00", group: "Horarios" },
  ],
  build: (v) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: str(v.name),
    description: str(v.description),
    url: str(v.url),
    telephone: str(v.telephone),
    priceRange: str(v.priceRange),
    address: {
      "@type": "PostalAddress",
      streetAddress: str(v["address.street"]),
      addressLocality: str(v["address.addressLocality"]),
      addressRegion: str(v["address.addressRegion"]),
      postalCode: str(v["address.postalCode"]),
      addressCountry: str(v["address.addressCountry"]),
    },
    geo:
      num(v["geo.latitude"]) !== "" || num(v["geo.longitude"]) !== ""
        ? {
            "@type": "GeoCoordinates",
            latitude: num(v["geo.latitude"]),
            longitude: num(v["geo.longitude"]),
          }
        : "",
    openingHours: str(v.openingHours),
  }),
  validate: (j) =>
    missingPaths(j, ["name", "telephone", "address.streetAddress", "address.addressLocality"]),
};

/* ------------------------------------------------------------------ */
/* FAQPage                                                             */
/* ------------------------------------------------------------------ */

const faqPage: SchemaDef = {
  id: "faqpage",
  name: "FAQPage",
  tagline: "Preguntas frecuentes expandibles en Google",
  fields: [
    {
      key: "faqs",
      label: "Preguntas y respuestas",
      kind: "pairs",
      required: true,
      group: "FAQ",
      addLabel: "Agregar pregunta",
      pairFields: [
        { key: "question", label: "Pregunta", placeholder: "¿Pregunta frecuente?" },
        { key: "answer", label: "Respuesta", placeholder: "Respuesta detallada...", multiline: true },
      ],
    },
  ],
  build: (v) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairItems(v.faqs).map((f) => ({
      "@type": "Question",
      name: str(f.question),
      acceptedAnswer: { "@type": "Answer", text: str(f.answer) },
    })),
  }),
  validate: (j) => {
    const entity = get(j, "mainEntity");
    const missing: string[] = [];
    if (!Array.isArray(entity) || entity.length === 0) {
      missing.push("mainEntity");
      return missing;
    }
    entity.forEach((item, i) => {
      if (!get(item, "name")) missing.push(`mainEntity.${i}.name`);
      if (!get(item, "acceptedAnswer.text")) missing.push(`mainEntity.${i}.acceptedAnswer.text`);
    });
    return missing;
  },
};

/* ------------------------------------------------------------------ */
/* Article                                                             */
/* ------------------------------------------------------------------ */

const article: SchemaDef = {
  id: "article",
  name: "Article",
  tagline: "Artículos de blog y noticias con autor y fecha en Google",
  fields: [
    { key: "headline", label: "Titular", kind: "text", required: true, placeholder: "Cómo mejorar tu SEO en 2026", group: "Artículo" },
    { key: "description", label: "Bajada / descripción", kind: "textarea", placeholder: "Resumen del artículo...", group: "Artículo" },
    { key: "image", label: "URL de imagen principal", kind: "url", required: true, placeholder: "https://acme.com/img/articulo.jpg", group: "Artículo" },
    { key: "url", label: "URL canónica", kind: "url", placeholder: "https://acme.com/blog/mi-articulo", group: "Publicación" },
    { key: "datePublished", label: "Fecha de publicación", kind: "text", required: true, placeholder: "2026-11-07", group: "Publicación" },
    { key: "dateModified", label: "Última modificación", kind: "text", placeholder: "2026-11-07", group: "Publicación" },
    { key: "author.name", label: "Nombre del autor", kind: "text", required: true, placeholder: "Laura Pérez", group: "Autor" },
    { key: "author.url", label: "URL del autor", kind: "url", placeholder: "https://acme.com/autores/laura", group: "Autor" },
    { key: "publisher.name", label: "Nombre del medio", kind: "text", required: true, placeholder: "Acme Blog", group: "Editorial" },
    { key: "publisher.logo", label: "URL del logo del medio", kind: "url", placeholder: "https://acme.com/logo.png", group: "Editorial" },
  ],
  build: (v) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: str(v.headline),
    description: str(v.description),
    image: str(v.image),
    datePublished: str(v.datePublished),
    dateModified: str(v.dateModified),
    author: {
      "@type": "Person",
      name: str(v["author.name"]),
      url: str(v["author.url"]),
    },
    publisher: {
      "@type": "Organization",
      name: str(v["publisher.name"]),
      logo: str(v["publisher.logo"])
        ? { "@type": "ImageObject", url: str(v["publisher.logo"]) }
        : "",
    },
    mainEntityOfPage: str(v.url) ? { "@type": "WebPage", "@id": str(v.url) } : "",
  }),
  validate: (j) =>
    missingPaths(j, ["headline", "image", "datePublished", "author.name", "publisher.name"]),
};

/* ------------------------------------------------------------------ */
/* Event                                                               */
/* ------------------------------------------------------------------ */

const event: SchemaDef = {
  id: "event",
  name: "Event",
  tagline: "Conciertos, webinars y eventos con fecha, lugar y entradas",
  fields: [
    { key: "name", label: "Nombre del evento", kind: "text", required: true, placeholder: "Festival de Música 2026", group: "Evento" },
    { key: "description", label: "Descripción", kind: "textarea", placeholder: "Dos días de música en vivo...", group: "Evento" },
    { key: "image", label: "URL de imagen / afiche", kind: "url", placeholder: "https://acme.com/evento.jpg", group: "Evento" },
    { key: "url", label: "URL del evento", kind: "url", placeholder: "https://acme.com/eventos/festival", group: "Evento" },
    { key: "startDate", label: "Inicio (ISO 8601)", kind: "text", required: true, placeholder: "2026-12-12T19:00:00-03:00", group: "Fecha y lugar" },
    { key: "endDate", label: "Fin (ISO 8601)", kind: "text", placeholder: "2026-12-14T23:00:00-03:00", group: "Fecha y lugar" },
    { key: "locationName", label: "Nombre del lugar", kind: "text", required: true, placeholder: "Estadio Monumental", group: "Fecha y lugar" },
    { key: "locationAddress", label: "Dirección del lugar", kind: "text", placeholder: "Av. Rivadavia 7500, CABA", group: "Fecha y lugar" },
    { key: "eventStatus", label: "Estado del evento", kind: "select", options: [
      { value: "https://schema.org/EventScheduled", label: "Programado" },
      { value: "https://schema.org/EventCancelled", label: "Cancelado" },
      { value: "https://schema.org/EventPostponed", label: "Pospuesto" },
      { value: "https://schema.org/EventRescheduled", label: "Reprogramado" },
      { value: "https://schema.org/EventMovedOnline", label: "Movido online" },
    ], group: "Fecha y lugar" },
    { key: "eventAttendanceMode", label: "Modalidad", kind: "select", options: [
      { value: "https://schema.org/OfflineEventAttendanceMode", label: "Presencial" },
      { value: "https://schema.org/OnlineEventAttendanceMode", label: "Online" },
      { value: "https://schema.org/MixedEventAttendanceMode", label: "Híbrido" },
    ], group: "Fecha y lugar" },
    { key: "offers.price", label: "Precio de entrada", kind: "number", placeholder: "45000", group: "Entradas" },
    { key: "offers.priceCurrency", label: "Moneda (ISO 4217)", kind: "text", placeholder: "ARS", group: "Entradas" },
    { key: "offers.url", label: "URL de compra", kind: "url", placeholder: "https://acme.com/entradas", group: "Entradas" },
    { key: "offers.availability", label: "Disponibilidad", kind: "select", options: [
      { value: "https://schema.org/InStock", label: "Entradas disponibles" },
      { value: "https://schema.org/SoldOut", label: "Agotado" },
      { value: "https://schema.org/LimitedAvailability", label: "Pocas entradas" },
    ], group: "Entradas" },
    { key: "organizer.name", label: "Organizador", kind: "text", placeholder: "Acme Producciones", group: "Organización" },
    { key: "organizer.url", label: "URL del organizador", kind: "url", placeholder: "https://acme.com", group: "Organización" },
  ],
  build: (v) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: str(v.name),
    description: str(v.description),
    image: str(v.image),
    url: str(v.url),
    startDate: str(v.startDate),
    endDate: str(v.endDate),
    eventStatus: str(v.eventStatus) || "https://schema.org/EventScheduled",
    eventAttendanceMode:
      str(v.eventAttendanceMode) || "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: str(v.locationName),
      address: str(v.locationAddress)
        ? { "@type": "PostalAddress", streetAddress: str(v.locationAddress) }
        : "",
    },
    offers:
      num(v["offers.price"]) !== "" || str(v["offers.url"])
        ? {
            "@type": "Offer",
            price: num(v["offers.price"]),
            priceCurrency: str(v["offers.priceCurrency"]),
            url: str(v["offers.url"]),
            availability: str(v["offers.availability"]) || "https://schema.org/InStock",
          }
        : "",
    organizer: str(v["organizer.name"])
      ? { "@type": "Organization", name: str(v["organizer.name"]), url: str(v["organizer.url"]) }
      : "",
  }),
  validate: (j) => missingPaths(j, ["name", "startDate", "location.name"]),
};

/* ------------------------------------------------------------------ */
/* HowTo                                                               */
/* ------------------------------------------------------------------ */

const howTo: SchemaDef = {
  id: "howto",
  name: "HowTo",
  tagline: "Tutoriales paso a paso con rich results en Google",
  fields: [
    { key: "name", label: "Título del tutorial", kind: "text", required: true, placeholder: "Cómo instalar una bomba de calor", group: "Tutorial" },
    { key: "description", label: "Descripción", kind: "textarea", placeholder: "Guía completa paso a paso...", group: "Tutorial" },
    { key: "image", label: "URL de imagen", kind: "url", placeholder: "https://acme.com/img/tutorial.jpg", group: "Tutorial" },
    { key: "totalTime", label: "Tiempo total (min)", kind: "number", placeholder: "120", group: "Tutorial" },
    { key: "supply", label: "Materiales necesarios (uno por línea)", kind: "list", placeholder: "Taladro, brocas de 6mm", group: "Materiales" },
    {
      key: "steps",
      label: "Pasos del tutorial",
      kind: "pairs",
      required: true,
      group: "Pasos",
      addLabel: "Agregar paso",
      pairFields: [
        { key: "name", label: "Nombre del paso", placeholder: "Paso 1" },
        { key: "text", label: "Instrucciones", placeholder: "Descripción detallada del paso...", multiline: true },
      ],
    },
  ],
  build: (v) => ({
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: str(v.name),
    description: str(v.description),
    image: str(v.image),
    totalTime: minutesToISO(v.totalTime),
    supply: strList(v.supply),
    step: pairItems(v.steps)
      .filter((s) => str(s.name) || str(s.text))
      .map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: str(s.name),
        text: str(s.text),
      })),
  }),
  validate: (j) => {
    const steps = get(j, "step");
    const missing = missingPaths(j, ["name"]);
    if (!Array.isArray(steps) || steps.length === 0) missing.push("step");
    return missing;
  },
};

/* ------------------------------------------------------------------ */
/* BreadcrumbList                                                      */
/* ------------------------------------------------------------------ */

const breadcrumbList: SchemaDef = {
  id: "breadcrumb",
  name: "BreadcrumbList",
  tagline: "Migas de pan en resultados de búsqueda",
  fields: [
    {
      key: "items",
      label: "Niveles de navegación",
      kind: "pairs",
      required: true,
      group: "Migas",
      addLabel: "Agregar nivel",
      pairFields: [
        { key: "name", label: "Nombre", placeholder: "Inicio" },
        { key: "item", label: "URL", placeholder: "https://acme.com" },
      ],
    },
  ],
  build: (v) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: pairItems(v.items)
      .filter((it) => str(it.name))
      .map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: str(it.name),
        item: str(it.item),
      })),
  }),
  validate: (j) => missingPaths(j, ["itemListElement"]),
};

/* ------------------------------------------------------------------ */
/* VideoObject                                                         */
/* ------------------------------------------------------------------ */

const videoObject: SchemaDef = {
  id: "video",
  name: "VideoObject",
  tagline: "Videos con thumbnail, duración y fecha en Google Video",
  fields: [
    { key: "name", label: "Título del video", kind: "text", required: true, placeholder: "Review: iPhone 17 Pro", group: "Video" },
    { key: "description", label: "Descripción", kind: "textarea", placeholder: "Análisis completo del nuevo flagship...", group: "Video" },
    { key: "thumbnailUrl", label: "URL del thumbnail", kind: "url", required: true, placeholder: "https://acme.com/thumb.jpg", group: "Video" },
    { key: "uploadDate", label: "Fecha de subida", kind: "text", required: true, placeholder: "2026-11-01", group: "Publicación" },
    { key: "duration", label: "Duración (ISO 8601)", kind: "text", placeholder: "PT12M30S", group: "Publicación" },
    { key: "contentUrl", label: "URL del archivo de video", kind: "url", placeholder: "https://acme.com/video.mp4", group: "Reproducción" },
    { key: "embedUrl", label: "URL embebible", kind: "url", placeholder: "https://youtube.com/embed/abc123", group: "Reproducción" },
    { key: "publisher.name", label: "Canal / Publicador", kind: "text", required: true, placeholder: "Acme Tech", group: "Canal" },
    { key: "publisher.logo", label: "URL del logo del canal", kind: "url", placeholder: "https://acme.com/logo.png", group: "Canal" },
  ],
  build: (v) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: str(v.name),
    description: str(v.description),
    thumbnailUrl: str(v.thumbnailUrl),
    uploadDate: str(v.uploadDate),
    duration: str(v.duration),
    contentUrl: str(v.contentUrl),
    embedUrl: str(v.embedUrl),
    publisher: {
      "@type": "Organization",
      name: str(v["publisher.name"]),
      logo: str(v["publisher.logo"])
        ? { "@type": "ImageObject", url: str(v["publisher.logo"]) }
        : "",
    },
  }),
  validate: (j) =>
    missingPaths(j, ["name", "thumbnailUrl", "uploadDate", "publisher.name"]),
};

/* ------------------------------------------------------------------ */

export const SCHEMAS: SchemaDef[] = [
  organization,
  product,
  recipe,
  localBusiness,
  faqPage,
  article,
  event,
  howTo,
  breadcrumbList,
  videoObject,
];

export const getSchema = (id: string) => SCHEMAS.find((s) => s.id === id) ?? SCHEMAS[0];

export const scriptTag = (json: Record<string, unknown>) =>
  `<script type="application/ld+json">\n${JSON.stringify(json, null, 2)}\n</script>`;
