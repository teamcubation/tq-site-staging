// Datos de servicios — campos del índice (v2). Los detalles por programa se
// sumarán al construir las páginas de detalle. Texto TAL CUAL del render v2.

export interface ServicioIndice {
  key: string;
  nombre: string;
  slug: string;
  necesita: string;
  publico: string;
  duracion: string;
  foco: string;
  resumen: string;
}

export const servicios: Record<string, ServicioIndice> = {
  discovery: {
    key: "discovery",
    nombre: "Discovery",
    slug: "/servicios/discovery",
    necesita: "Identificar por dónde empezar",
    publico: "Distintas áreas de la empresa",
    duracion: "Tres semanas",
    foco: "Mapa priorizado de oportunidades",
    resumen:
      "Releva sus procesos y entrega un mapa priorizado de oportunidades de IA con el primer paso recomendado.",
  },
  starter: {
    key: "starter",
    nombre: "Starter AI",
    slug: "/servicios/starter-ai",
    necesita: "Usar IA en las tareas diarias",
    publico: "Equipos no técnicos, hasta 16 personas",
    duracion: "Un mes",
    foco: "Aplicación de herramientas sobre tareas propias",
    resumen:
      "Equipos sin experiencia previa aprenden a usar IA sobre sus tareas y con las herramientas que ya tienen.",
  },
  booster: {
    key: "booster",
    nombre: "Booster AI",
    slug: "/servicios/booster-ai",
    necesita: "Automatizar procesos del equipo",
    publico: "Equipos de negocio, hasta 8 personas",
    duracion: "Cinco semanas más dos meses de seguimiento",
    foco: "Automatización con IA y agentes",
    resumen:
      "Equipos de negocio automatizan procesos propios con IA y agentes, acompañados por mentores expertos.",
  },
  intensivo: {
    key: "intensivo",
    nombre: "Booster AI Intensivo",
    slug: "/servicios/booster-ai-intensivo",
    necesita: "Probar un piloto acotado",
    publico: "Seis personas en tres duplas",
    duracion: "Una semana",
    foco: "Primera automatización real por dupla",
    resumen:
      "Seis personas en tres duplas construyen una primera automatización real por dupla, en un piloto acotado.",
  },
  vibecode: {
    key: "vibecode",
    nombre: "VibeCode Studio",
    slug: "/servicios/vibecode-studio",
    necesita: "Crear aplicaciones internas",
    publico: "Equipos que ya adoptaron IA, hasta 8 personas",
    duracion: "Dos meses",
    foco: "Micro-aplicaciones de negocio",
    resumen:
      "Equipos que ya usan IA construyen micro-aplicaciones de negocio, sin programación tradicional.",
  },
  builders: {
    key: "builders",
    nombre: "AI Builders",
    slug: "/servicios/ai-builders",
    necesita: "Desarrollar capacidad técnica de automatización",
    publico: "Perfiles técnicos, hasta 3 personas",
    duracion: "Cuatro meses, dedicación completa",
    foco: "Automatizaciones complejas e integraciones",
    resumen:
      "Perfiles técnicos se forman para construir automatizaciones complejas e integraciones entre sistemas dentro de su empresa.",
  },
  dev: {
    key: "dev",
    nombre: "Booster AI Dev",
    slug: "/servicios/booster-ai-dev",
    necesita: "Incorporar IA al desarrollo",
    publico: "Equipos de desarrollo, hasta 8 personas",
    duracion: "Un mes",
    foco: "Adopción sobre el sprint real",
    resumen:
      "Equipos de desarrollo incorporan herramientas y agentes de IA sobre su sprint y sus repositorios.",
  },
  incubation: {
    key: "incubation",
    nombre: "Incubation",
    slug: "/servicios/incubation",
    necesita: "Construir software y formar desarrolladores",
    publico: "Organización y equipo mixto de Teamcubation",
    duracion: "Seis meses",
    foco: "Software y formación sobre el proyecto",
    resumen:
      "Software construido mientras se forman los desarrolladores que después pueden integrarse a su equipo.",
  },
};

export const ORDEN = [
  "discovery",
  "starter",
  "booster",
  "intensivo",
  "vibecode",
  "builders",
  "dev",
  "incubation",
];

export const CAPAS = [
  {
    titulo:
      "Que las personas de su compañía aprovechen la IA para trabajar con mayor eficiencia.",
    etiqueta: "Capa de superficie — equipos de negocio.",
    bajada:
      "Sus equipos conocen las tareas que necesitan mejorar. El entrenamiento parte de ese conocimiento y trabaja sobre sus herramientas y procesos.",
    keys: ["starter", "booster", "intensivo"],
  },
  {
    titulo:
      "Que las personas más avanzadas en el uso de la IA, puedan construir tecnología.",
    etiqueta: "Capa intermedia — construcción con IA.",
    bajada:
      "Los perfiles de negocio pueden crear herramientas internas. Los perfiles técnicos pueden profundizar en integraciones y procesos de mayor complejidad.",
    keys: ["vibecode", "builders"],
  },
  {
    titulo:
      "Incorporar talento y nuevas habilidades tecnológicas a su equipo de desarrollo.",
    etiqueta: "Núcleo IT — equipos de desarrollo.",
    bajada:
      "Entrenamos a los equipos de desarrollo para incorporar IA y formamos desarrolladores mientras construyen el software que la empresa necesita.",
    keys: ["dev", "incubation"],
  },
];
