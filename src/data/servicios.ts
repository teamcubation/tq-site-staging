// Datos de los 8 servicios/programas — texto TAL CUAL del render v2 (SERVICIOS).
// Fuente única para la página índice (/servicios) y el detalle (/servicios/[slug]).

export interface FichaItem { k: string; v: string; }
export interface Paso { n: string; t: string; }
export interface FaqItem { q: string; a: string; }
export interface OtroLink { k: string; p: string; }

export interface Servicio {
  key: string;
  nombre: string;
  slug: string;
  title: string;
  meta: string;
  necesita: string;
  publico: string;
  duracion: string;
  foco: string;
  resumen: string;
  h1: string;
  apoyo: string;
  bajada: string;
  img: string; // nombre de archivo en src/assets/ilustraciones
  ficha: FichaItem[];
  quienH2: string;
  quienP: string;
  alcanceH2: string;
  alcanceP: string;
  comoH2: string;
  pasos: Paso[];
  entregaH2: string;
  entregaP: string;
  segH3: string;
  segP: string;
  segLinkT: string;
  segLinkKey: string;
  faqs: FaqItem[];
  otros: OtroLink[];
}

export const servicios: Record<string, Servicio> = {
  discovery: {
    key: "discovery",
    nombre: "Discovery",
    slug: "/servicios/discovery",
    title: "Diagnóstico de oportunidades de IA | Teamcubation",
    meta: "Discovery releva los procesos de su empresa durante tres semanas y entrega un mapa priorizado de oportunidades de IA con el primer paso recomendado.",
    necesita: "Identificar por dónde empezar",
    publico: "Distintas áreas de la empresa",
    duracion: "Tres semanas",
    foco: "Mapa priorizado de oportunidades",
    resumen: "Releva sus procesos y entrega un mapa priorizado de oportunidades de IA con el primer paso recomendado.",
    h1: "Discovery: diagnóstico de oportunidades de IA en su empresa.",
    apoyo: "Antes de invertir, saber dónde.",
    bajada: "Discovery es el relevamiento de Teamcubation para identificar y priorizar oportunidades de IA antes de invertir. Durante tres semanas, analizamos los procesos y la preparación de los equipos. La entrega es un mapa de oportunidades con el primer paso recomendado y el programa que corresponde a cada necesidad.",
    img: "pedestal-diagnostico-senala-esfera.png",
    ficha: [
      { k: "Duración", v: "Tres semanas" },
      { k: "Alcance", v: "Relevamiento de procesos" },
      { k: "Entrega", v: "Mapa priorizado de oportunidades" },
    ],
    quienH2: "¿Para quién es Discovery?",
    quienP: "Empresas con varias áreas o procesos candidatos para trabajar con IA y que necesitan ordenar las oportunidades. También para equipos que quieren evaluar su punto de partida antes de elegir un programa.",
    alcanceH2: "¿Qué preguntas ayuda a responder?",
    alcanceP: "Dónde se van las horas, qué tareas pueden automatizarse, qué equipos tienen experiencia usando IA y cuáles necesitan una base. El diagnóstico pone esas preguntas en relación con los procesos de la empresa.",
    comoH2: "¿Cómo funciona Discovery?",
    pasos: [
      { n: "1. Conversar con los equipos.", t: "Relevamos las tareas y los procesos para comprender cómo se trabaja hoy." },
      { n: "2. Identificar oportunidades.", t: "Analizamos dónde puede aportar la IA y qué preparación necesita cada equipo." },
      { n: "3. Priorizar el primer paso.", t: "Entregamos un mapa de oportunidades con una recomendación de inicio y el programa correspondiente." },
    ],
    entregaH2: "Un mapa para decidir cómo empezar.",
    entregaP: "Discovery entrega un diagnóstico y una priorización. Permite elegir qué procesos abordar primero y qué tipo de acompañamiento necesita cada equipo. La automatización o el entrenamiento se trabajan en el programa que se defina después.",
    segH3: "",
    segP: "",
    segLinkT: "Conocer el método de Teamcubation",
    segLinkKey: "metodologia",
    faqs: [
      { q: "¿Discovery es obligatorio antes de contratar un programa?", a: "No siempre. Cuando el objetivo está claro, se puede evaluar directamente el programa adecuado. Discovery es útil cuando hay dudas o varias oportunidades para comparar." },
      { q: "¿Qué necesita aportar la empresa?", a: "Acceso a conversar con los equipos y visibilidad de los procesos que se van a relevar." },
      { q: "¿Cuánto dura Discovery?", a: "Tres semanas. El alcance del relevamiento se define a partir de las áreas y procesos que necesita analizar la empresa." },
      { q: "¿Discovery incluye construir una automatización?", a: "La entrega de Discovery es un mapa priorizado de oportunidades y una recomendación de primer paso. La construcción se aborda en el programa que corresponda." },
    ],
    otros: [
      { k: "starter", p: "Para equipos que necesitan empezar a usar IA." },
      { k: "booster", p: "Para avanzar hacia la automatización de procesos." },
      { k: "servicios", p: "Para comparar alternativas según su necesidad." },
    ],
  },
  starter: {
    key: "starter",
    nombre: "Starter AI",
    slug: "/servicios/starter-ai",
    title: "IA para equipos no técnicos: Starter AI | Teamcubation",
    meta: "Un mes de entrenamiento para equipos no técnicos. Aprendan a usar IA sobre sus tareas con las herramientas de su empresa y mentores expertos.",
    necesita: "Usar IA en las tareas diarias",
    publico: "Equipos no técnicos, hasta 16 personas",
    duracion: "Un mes",
    foco: "Aplicación de herramientas sobre tareas propias",
    resumen: "Equipos sin experiencia previa aprenden a usar IA sobre sus tareas y con las herramientas que ya tienen.",
    h1: "Starter AI: IA aplicada al trabajo de equipos no técnicos.",
    apoyo: "La IA que su equipo ya tiene, aplicada a las tareas de todos los días.",
    bajada: "Starter AI es el programa de Teamcubation para equipos sin experiencia previa en IA. Durante un mes, los participantes aprenden a usar las herramientas de su empresa para redactar, analizar información y preparar informes sobre sus propias tareas, con un mentor experto al lado.",
    img: "pedestal-colaboracion-cargan-esfera.png",
    ficha: [
      { k: "Duración", v: "Un mes" },
      { k: "Participantes", v: "Hasta 16 personas" },
      { k: "Perfil", v: "Equipos no técnicos" },
    ],
    quienH2: "¿Para quién es Starter AI?",
    quienP: "Equipos de recursos humanos, finanzas, operaciones, marketing, ventas o administración que necesitan empezar a usar IA en su trabajo. El programa parte de las tareas que cada persona conoce y realiza.",
    alcanceH2: "¿Sobre qué tareas se trabaja?",
    alcanceP: "Redactar y resumir documentos, analizar información, preparar reportes u organizar materiales de trabajo. Las tareas se eligen según las necesidades del equipo y las herramientas disponibles en la empresa.",
    comoH2: "¿Cómo funciona Starter AI?",
    pasos: [
      { n: "1. Reconocer las tareas.", t: "Identificamos junto al equipo dónde puede aplicar IA en su trabajo cotidiano." },
      { n: "2. Construir una base compartida.", t: "Charlas AI aporta el punto de partida del programa y acompaña a los líderes para conducir a sus equipos con estas nuevas capacidades." },
      { n: "3. Practicar con un guía.", t: "Cada persona trabaja sobre sus tareas con acompañamiento experto. El aprendizaje ocurre mientras utiliza las herramientas." },
      { n: "4. Revisar el avance.", t: "El recorrido se registra en Teamboarding para acompañar el progreso y seguir lo que el equipo incorpora." },
    ],
    entregaH2: "Un equipo con experiencia para usar IA.",
    entregaP: "El objetivo es que las personas incorporen IA a sus tareas y comprendan cómo aplicar las herramientas por su cuenta. Esa experiencia es la base para avanzar hacia la automatización de procesos completos.",
    segH3: "¿Cómo acompañamos el avance?",
    segP: "En Starter AI, Teamboarding registra el avance de las personas y acompaña el seguimiento del entrenamiento. Los responsables del programa reciben informes de progreso.",
    segLinkT: "Conocer Teamboarding",
    segLinkKey: "teamboarding",
    faqs: [
      { q: "¿Hace falta saber programar?", a: "No. Starter AI está diseñado para equipos no técnicos sin experiencia previa en IA." },
      { q: "¿Qué herramientas se utilizan?", a: "Microsoft Copilot, Google Gemini, Claude o ChatGPT, según las herramientas y el licenciamiento de su empresa. La selección se define a partir de las tareas del equipo." },
      { q: "¿Cuánto dura y cuántas personas participan?", a: "Starter AI dura un mes y está orientado a equipos de hasta 16 personas." },
      { q: "¿Cómo se relaciona con una capacitación previa?", a: "Una capacitación puede aportar una base útil. Starter AI lleva la práctica a las tareas de cada persona, con un guía que acompaña su aplicación." },
      { q: "¿Cuál puede ser el siguiente paso?", a: "Cuando el equipo ya utiliza IA y necesita automatizar procesos completos, Booster AI permite trabajar sobre ese objetivo. El recorrido se define según la necesidad de la empresa." },
    ],
    otros: [
      { k: "booster", p: "Para pasar del uso de herramientas a la automatización de procesos." },
      { k: "intensivo", p: "Para explorar un piloto acotado cuando el equipo esté listo." },
    ],
  },
  booster: {
    key: "booster",
    nombre: "Booster AI",
    slug: "/servicios/booster-ai",
    title: "Automatización con IA: Booster AI | Teamcubation",
    meta: "Sus equipos automatizan procesos reales con IA y agentes. Cinco semanas de entrenamiento y dos meses de seguimiento, con mentores de Teamcubation.",
    necesita: "Automatizar procesos del equipo",
    publico: "Equipos de negocio, hasta 8 personas",
    duracion: "Cinco semanas más dos meses de seguimiento",
    foco: "Automatización con IA y agentes",
    resumen: "Equipos de negocio automatizan procesos propios con IA y agentes, acompañados por mentores expertos.",
    h1: "Booster AI: automatización de procesos con IA y su propio equipo.",
    apoyo: "Sus procesos, automatizados por su propia gente.",
    bajada: "Booster AI es el programa de Teamcubation en el que equipos de negocio automatizan procesos reales de su día a día con IA y agentes. Cada participante trabaja sobre un proceso propio, acompañado por un mentor experto. Son cinco semanas de programa más dos meses de seguimiento.",
    img: "macro-empuje-disco-ambar.png",
    ficha: [
      { k: "Programa", v: "Cinco semanas" },
      { k: "Seguimiento", v: "Dos meses" },
      { k: "Participantes", v: "Hasta 8 personas" },
    ],
    quienH2: "¿Para quién es Booster AI?",
    quienP: "Equipos de negocio que ya usan IA y necesitan pasar a la automatización de sus propios procesos. Si todavía no tienen experiencia usando IA, Starter AI permite construir esa base.",
    alcanceH2: "¿Qué procesos se pueden trabajar?",
    alcanceP: "Consolidaciones de información, reportes periódicos, procesamiento de correos o tareas que mueven datos entre sistemas. La selección parte del proceso de cada participante, de las herramientas disponibles y de lo que conviene resolver primero.",
    comoH2: "¿Cómo funciona Booster AI?",
    pasos: [
      { n: "1. Preparar al equipo.", t: "Charlas AI introduce el programa y acompaña a los líderes para conducir equipos con nuevas capacidades." },
      { n: "2. Elegir el proceso.", t: "Cada persona identifica un proceso propio: qué tareas incluye, qué sistemas intervienen y qué resultado necesita mejorar." },
      { n: "3. Construir con un mentor.", t: "Los participantes trabajan en su automatización con herramientas como n8n, Power Automate o Copilot Studio. El mentor guía y la construcción queda en manos de la persona." },
      { n: "4. Consolidar lo construido.", t: "Las cinco semanas de programa se complementan con dos meses de seguimiento para acompañar la adopción de lo trabajado." },
    ],
    entregaH2: "Procesos automatizados y capacidad para seguir.",
    entregaP: "El programa trabaja para llevar automatizaciones a producción y entrenar al equipo para sostenerlas y evolucionarlas. El alcance se define sobre procesos concretos; las personas participan en la construcción y comprenden cómo funciona lo que hicieron.",
    segH3: "¿Cómo acompañamos el avance?",
    segP: "En Booster AI, Teamboarding registra el avance de cada participante y el impacto en los procesos trabajados. Los responsables reciben informes para seguir el recorrido.",
    segLinkT: "Conocer Teamboarding",
    segLinkKey: "teamboarding",
    faqs: [
      { q: "¿Cuánto dura Booster AI?", a: "Cinco semanas de programa más dos meses de seguimiento, para equipos de hasta 8 personas." },
      { q: "¿Hace falta experiencia previa?", a: "El programa está orientado a equipos que ya usan IA. Si necesitan una base de uso cotidiano, Starter AI es el paso previo a evaluar." },
      { q: "¿Qué es un agente de IA?", a: "Es un sistema que utiliza IA para decidir y ejecutar pasos orientados a una tarea, dentro de las herramientas y los permisos disponibles. Un flujo de reglas fijas también puede automatizar un proceso, sin ser necesariamente un agente." },
      { q: "¿Cómo se coordina con IT?", a: "El programa está dirigido a equipos de negocio. Los accesos, permisos e integraciones que requiera el proceso se coordinan según las políticas y la organización de cada empresa." },
      { q: "¿Existe un formato más corto?", a: "Sí. Booster AI Intensivo propone un piloto de una semana: seis personas trabajan en tres duplas sobre una primera automatización real por dupla." },
    ],
    otros: [
      { k: "starter", p: "Para construir una base de uso de IA en las tareas cotidianas." },
      { k: "intensivo", p: "Para explorar el formato piloto de una semana." },
      { k: "vibecode", p: "Para avanzar hacia micro-aplicaciones de negocio." },
    ],
  },
  intensivo: {
    key: "intensivo",
    nombre: "Booster AI Intensivo",
    slug: "/servicios/booster-ai-intensivo",
    title: "Piloto de IA en una semana | Booster AI Intensivo",
    meta: "Booster AI Intensivo reúne a seis personas en tres duplas para trabajar en una primera automatización real por dupla, con mentores de Teamcubation.",
    necesita: "Probar un piloto acotado",
    publico: "Seis personas en tres duplas",
    duracion: "Una semana",
    foco: "Primera automatización real por dupla",
    resumen: "Seis personas en tres duplas construyen una primera automatización real por dupla, en un piloto acotado.",
    h1: "Booster AI Intensivo: un piloto de automatización con IA en una semana.",
    apoyo: "Una primera automatización real por dupla, en una semana.",
    bajada: "Booster AI Intensivo es el formato piloto de Teamcubation: seis personas, organizadas en tres duplas, trabajan durante una semana sobre procesos propios. El objetivo es construir una primera automatización real por dupla, con mentores expertos y un alcance acotado.",
    img: "escena-hero-anillo-salto.png",
    ficha: [
      { k: "Duración", v: "Una semana" },
      { k: "Participantes", v: "6 personas en 3 duplas" },
      { k: "Formato", v: "Piloto acotado" },
    ],
    quienH2: "¿Para quién es Booster AI Intensivo?",
    quienP: "Equipos de negocio que quieren probar el método de Teamcubation con un proceso acotado antes de avanzar hacia un programa más largo. La experiencia del equipo y el proceso candidato se revisan al definir el piloto.",
    alcanceH2: "¿Qué se busca resolver en el piloto?",
    alcanceP: "Una tarea repetitiva y acotada que la dupla conoce: consolidar información, procesar correos con adjuntos o preparar un reporte periódico. El piloto se concentra en una primera automatización que permita conocer la forma de trabajo.",
    comoH2: "¿Cómo funciona Booster AI Intensivo?",
    pasos: [
      { n: "1. Elegir un alcance concreto.", t: "Se identifican las tareas y herramientas sobre las que trabajará cada dupla." },
      { n: "2. Construir en duplas.", t: "Los participantes desarrollan su primera automatización con acompañamiento de mentores expertos." },
      { n: "3. Compartir lo trabajado.", t: "Las duplas presentan lo construido y la experiencia adquirida durante el piloto." },
    ],
    entregaH2: "Una primera experiencia de automatización.",
    entregaP: "El objetivo del piloto es una primera automatización funcional por dupla y experiencia de construcción sobre un proceso propio. Ese recorrido ayuda a evaluar el siguiente paso. Un piloto funcional tiene un alcance diferente al programa completo de Booster AI.",
    segH3: "¿Cómo acompañamos el avance?",
    segP: "En Booster AI Intensivo, el avance de las duplas queda registrado en Teamboarding para acompañar el recorrido del piloto.",
    segLinkT: "Conocer Teamboarding",
    segLinkKey: "teamboarding",
    faqs: [
      { q: "¿Cuánto dura el Intensivo?", a: "La semana de entrenamiento dura una semana. La preparación y las condiciones del piloto se definen al acordar el alcance." },
      { q: "¿Cuántas personas participan?", a: "El formato es de seis personas, organizadas en tres duplas." },
      { q: "¿En qué se diferencia de Booster AI?", a: "El Intensivo trabaja sobre un primer piloto en duplas durante una semana. Booster AI dura cinco semanas más dos meses de seguimiento y está orientado a automatizar procesos con un recorrido más amplio." },
      { q: "¿Sirve si el equipo todavía no usa IA?", a: "La experiencia previa se revisa al definir el piloto. Para equipos sin base en el uso de IA, Starter AI es el programa de inicio a evaluar." },
      { q: "¿Qué herramientas se utilizan?", a: "Herramientas de automatización como n8n, Power Automate o Copilot Studio, según el ecosistema de la empresa y el proceso elegido." },
    ],
    otros: [
      { k: "booster", p: "Para un programa de cinco semanas más dos meses de seguimiento." },
      { k: "starter", p: "Para equipos que necesitan empezar a usar IA sobre sus tareas." },
    ],
  },
  vibecode: {
    key: "vibecode",
    nombre: "VibeCode Studio",
    slug: "/servicios/vibecode-studio",
    title: "Aplicaciones con IA: VibeCode Studio | Teamcubation",
    meta: "Dos meses para que equipos de negocio que ya usan IA construyan micro-aplicaciones sobre necesidades reales, con mentores expertos de Teamcubation.",
    necesita: "Crear aplicaciones internas",
    publico: "Equipos que ya adoptaron IA, hasta 8 personas",
    duracion: "Dos meses",
    foco: "Micro-aplicaciones de negocio",
    resumen: "Equipos que ya usan IA construyen micro-aplicaciones de negocio, sin programación tradicional.",
    h1: "VibeCode Studio: construya aplicaciones de negocio con IA.",
    apoyo: "De usar herramientas a construir las propias.",
    bajada: "VibeCode Studio es el programa de Teamcubation en el que perfiles de negocio que ya usan IA construyen micro-aplicaciones para su trabajo, sin programación tradicional. Durante dos meses, cada participante trabaja sobre una necesidad concreta con un mentor experto.",
    img: "macro-colaboracion-anillo-prisma.png",
    ficha: [
      { k: "Duración", v: "Dos meses" },
      { k: "Participantes", v: "Hasta 8 personas" },
      { k: "Punto de partida", v: "Experiencia previa usando IA" },
    ],
    quienH2: "¿Para quién es VibeCode Studio?",
    quienP: "Equipos de negocio y perfiles semitécnicos que ya usan IA en sus tareas y necesitan construir una aplicación interna. El punto de partida es un problema que conocen y que una herramienta propia puede ayudar a resolver.",
    alcanceH2: "¿Qué tipo de aplicaciones se construyen?",
    alcanceP: "Un formulario con lógica, un tablero de seguimiento o una herramienta interna que hoy se sostiene con una planilla compartida. Son micro-aplicaciones de negocio: herramientas de alcance acotado para necesidades concretas del equipo.",
    comoH2: "¿Cómo funciona VibeCode Studio?",
    pasos: [
      { n: "1. Definir la necesidad.", t: "Se elige el problema y se describe qué debe permitir hacer la aplicación." },
      { n: "2. Construir con IA.", t: "La persona utiliza herramientas de construcción asistida por IA para dar forma a la aplicación, acompañada por un mentor." },
      { n: "3. Evaluar y ajustar.", t: "El entrenamiento desarrolla criterio para revisar si la aplicación responde al problema y para seguir mejorándola." },
    ],
    entregaH2: "Una aplicación propia y experiencia para construir.",
    entregaP: "El programa trabaja sobre micro-aplicaciones funcionales y entrena a los participantes para sostenerlas y evolucionarlas. El criterio es saber qué problema atacar y cuándo la solución sirve; también orienta la revisión de lo que genera la IA.",
    segH3: "¿Cómo acompañamos el avance?",
    segP: "En VibeCode Studio, Teamboarding acompaña el seguimiento del avance de los participantes y del trabajo sobre sus aplicaciones.",
    segLinkT: "Conocer Teamboarding",
    segLinkKey: "teamboarding",
    faqs: [
      { q: "¿Qué significa vibe coding en este programa?", a: "Es construir aplicaciones describiendo a la IA lo que se necesita y guiando su desarrollo. En VibeCode Studio, la persona trabaja con un mentor sobre una necesidad de negocio y revisa si lo construido responde a ella." },
      { q: "¿Hace falta haber programado?", a: "El programa está pensado para perfiles de negocio o semitécnicos, sin programación tradicional. Sí requiere experiencia previa usando IA en el trabajo y un problema concreto para resolver." },
      { q: "¿Qué herramientas se utilizan?", a: "Herramientas de construcción asistida por IA o low-code como Power Apps, Lovable, Bolt o v0, según el ecosistema de la empresa. Las herramientas tienen enfoques distintos; la elección depende de la necesidad." },
      { q: "¿Cómo se relaciona con el equipo de desarrollo?", a: "VibeCode Studio se concentra en herramientas internas de alcance acotado. Los requisitos de acceso, integración y uso se coordinan con las áreas responsables según la organización de cada empresa." },
      { q: "¿En qué se diferencia de Booster AI?", a: "Booster AI se orienta a automatizar procesos del equipo. VibeCode Studio se concentra en construir micro-aplicaciones de negocio, como formularios o herramientas internas." },
    ],
    otros: [
      { k: "booster", p: "Para automatizar procesos antes de avanzar hacia aplicaciones." },
      { k: "builders", p: "Para perfiles técnicos que abordarán integraciones y automatizaciones complejas." },
    ],
  },
  builders: {
    key: "builders",
    nombre: "AI Builders",
    slug: "/servicios/ai-builders",
    title: "AI Builders: automatización con equipo propio | Teamcubation",
    meta: "Cuatro meses con dedicación completa para formar perfiles técnicos capaces de construir automatizaciones con IA e integraciones entre sistemas.",
    necesita: "Desarrollar capacidad técnica de automatización",
    publico: "Perfiles técnicos, hasta 3 personas",
    duracion: "Cuatro meses, dedicación completa",
    foco: "Automatizaciones complejas e integraciones",
    resumen: "Perfiles técnicos se forman para construir automatizaciones complejas e integraciones entre sistemas dentro de su empresa.",
    h1: "AI Builders: forme especialistas internos en automatización con IA.",
    apoyo: "La capacidad de automatizar, dentro de su empresa.",
    bajada: "AI Builders es el programa de Teamcubation que forma perfiles técnicos para diseñar y construir automatizaciones complejas con IA, agentes e integraciones entre sistemas. Dura cuatro meses con dedicación completa, para hasta tres participantes que aprenden sobre necesidades concretas de su empresa.",
    img: "escena-piramide-construccion-densa.png",
    ficha: [
      { k: "Duración", v: "Cuatro meses" },
      { k: "Participantes", v: "Hasta 3 personas" },
      { k: "Dedicación", v: "Completa" },
    ],
    quienH2: "¿Para quién es AI Builders?",
    quienP: "Empresas que quieren desarrollar especialistas internos en automatización con IA. El programa está orientado a perfiles de IT o desarrolladores en formación que puedan dedicar su tiempo completo al recorrido.",
    alcanceH2: "¿Qué significa automatización compleja?",
    alcanceP: "Procesos que conectan varios sistemas, incorporan lógica de negocio o combinan agentes, integraciones y flujos de trabajo. Los participantes aprenden construyendo sobre necesidades de la empresa, con acompañamiento experto.",
    comoH2: "¿Cómo funciona AI Builders?",
    pasos: [
      { n: "1. Elegir procesos de la empresa.", t: "Se identifican necesidades que requieren automatización e integración entre sistemas." },
      { n: "2. Construir con acompañamiento.", t: "Los participantes trabajan con mentores en herramientas como n8n, Copilot Studio y las interfaces de los modelos de IA." },
      { n: "3. Desarrollar capacidad propia.", t: "El recorrido busca que los participantes comprendan lo que construyen y puedan sostenerlo, ampliarlo y abordar nuevas necesidades." },
    ],
    entregaH2: "Especialistas que conocen sus procesos.",
    entregaP: "El programa trabaja para llevar automatizaciones complejas a producción y formar a las personas que pueden sostenerlas. La experiencia se construye dentro de los procesos de su empresa, con sus necesidades e integraciones.",
    segH3: "¿Cómo acompañamos el avance?",
    segP: "En AI Builders, Teamboarding permite seguir el avance de los participantes y el trabajo sobre las automatizaciones del programa, con informes para sus responsables.",
    segLinkT: "Conocer Teamboarding",
    segLinkKey: "teamboarding",
    faqs: [
      { q: "¿Qué perfil necesita el participante?", a: "Un perfil de IT o un desarrollador en formación, con base técnica y disponibilidad para dedicar cuatro meses completos al programa." },
      { q: "¿En qué se diferencia de Booster AI?", a: "Booster AI trabaja con equipos de negocio sobre procesos de su propio rol, durante cinco semanas más dos meses de seguimiento. AI Builders forma perfiles técnicos para automatizaciones complejas e integraciones, durante cuatro meses con dedicación completa." },
      { q: "¿Se trabaja sobre ejercicios o sobre procesos de la empresa?", a: "Sobre automatizaciones de la empresa, elegidas a partir de sus necesidades. Los participantes aprenden mientras construyen con mentores expertos." },
      { q: "¿Qué capacidad busca dejar AI Builders?", a: "Personas capaces de diseñar, construir y evolucionar automatizaciones con IA dentro de la empresa, con experiencia sobre sus propios procesos." },
    ],
    otros: [
      { k: "booster", p: "Para la automatización de procesos por equipos de negocio." },
      { k: "vibecode", p: "Para construir micro-aplicaciones de negocio." },
      { k: "dev", p: "Para incorporar IA al flujo de un equipo de desarrollo." },
    ],
  },
  dev: {
    key: "dev",
    nombre: "Booster AI Dev",
    slug: "/servicios/booster-ai-dev",
    title: "IA para desarrolladores | Booster AI Dev | Teamcubation",
    meta: "Un mes de entrenamiento sobre el sprint y el código real de su equipo para adoptar herramientas de desarrollo con IA y prácticas de revisión y calidad.",
    necesita: "Incorporar IA al desarrollo",
    publico: "Equipos de desarrollo, hasta 8 personas",
    duracion: "Un mes",
    foco: "Adopción sobre el sprint real",
    resumen: "Equipos de desarrollo incorporan herramientas y agentes de IA sobre su sprint y sus repositorios.",
    h1: "Booster AI Dev: IA para equipos de desarrollo de software.",
    apoyo: "Desarrollo asistido por IA, con criterio.",
    bajada: "Booster AI Dev es el programa de Teamcubation para incorporar herramientas y agentes de desarrollo con IA al trabajo del equipo. Durante un mes, hasta ocho desarrolladores entrenan sobre su sprint, sus repositorios y sus prácticas de revisión, acompañados por un mentor experto.",
    img: "escena-diagonal-agentes-operando.png",
    ficha: [
      { k: "Duración", v: "Un mes" },
      { k: "Participantes", v: "Hasta 8 desarrolladores" },
      { k: "Contexto", v: "Sprint y repositorios del equipo" },
    ],
    quienH2: "¿Para quién es Booster AI Dev?",
    quienP: "Equipos de desarrollo que quieren incorporar IA a su flujo de trabajo y sostener prácticas de revisión y calidad. El entrenamiento utiliza el contexto técnico y los procesos de la empresa.",
    alcanceH2: "¿Qué se entrena sobre el código?",
    alcanceP: "El uso de herramientas como Cursor, Claude Code o GitHub Copilot dentro del trabajo cotidiano: qué tareas delegar, cómo revisar lo que propone un agente y cómo integrar esa práctica en el flujo del equipo.",
    comoH2: "¿Cómo funciona Booster AI Dev?",
    pasos: [
      { n: "1. Partir del flujo actual.", t: "El equipo trabaja sobre sus repositorios, herramientas y dinámica de desarrollo." },
      { n: "2. Incorporar agentes al trabajo.", t: "Un mentor acompaña el uso de herramientas de desarrollo con IA sobre tareas del sprint." },
      { n: "3. Entrenar revisión y criterio.", t: "Los desarrolladores practican cómo evaluar los cambios propuestos y sostener los estándares del equipo." },
    ],
    entregaH2: "IA incorporada al flujo de desarrollo.",
    entregaP: "El objetivo es que el equipo utilice herramientas y agentes de IA con prácticas de trabajo definidas: qué delegar, cómo revisar y cómo mantener la calidad. El criterio es saber qué problema atacar y cuándo la solución sirve.",
    segH3: "¿Cómo acompañamos el avance?",
    segP: "En Booster AI Dev, Teamboarding acompaña el seguimiento del avance de los participantes y del entrenamiento sobre el trabajo de desarrollo.",
    segLinkT: "Conocer Teamboarding",
    segLinkKey: "teamboarding",
    faqs: [
      { q: "¿Se trabaja sobre nuestros repositorios?", a: "Sí. El entrenamiento utiliza el código y el flujo del equipo, con los cuidados de acceso y seguridad que defina la empresa." },
      { q: "¿Qué herramientas cubre el programa?", a: "Herramientas y agentes de desarrollo como Cursor, Claude Code y GitHub Copilot, según el ecosistema técnico y el licenciamiento de la empresa." },
      { q: "¿Qué significa desarrollar con criterio?", a: "Decidir qué conviene delegar a la IA, revisar los cambios propuestos y comprobar que el resultado responde a la necesidad y a los estándares del equipo." },
      { q: "¿Cuánto dura y cuántas personas participan?", a: "Booster AI Dev dura un mes y está orientado a equipos de hasta ocho desarrolladores." },
    ],
    otros: [
      { k: "builders", p: "Para formar perfiles técnicos en automatización e integraciones." },
      { k: "incubation", p: "Para construir software mientras se forman desarrolladores." },
    ],
  },
  incubation: {
    key: "incubation",
    nombre: "Incubation",
    slug: "/servicios/incubation",
    title: "Software y formación de desarrolladores | Incubation",
    meta: "Incubation combina desarrollo de software y formación de desarrolladores durante seis meses. El talento aprende sobre el producto de su empresa.",
    necesita: "Construir software y formar desarrolladores",
    publico: "Organización y equipo mixto de Teamcubation",
    duracion: "Seis meses",
    foco: "Software y formación sobre el proyecto",
    resumen: "Software construido mientras se forman los desarrolladores que después pueden integrarse a su equipo.",
    h1: "Incubation: desarrollo de software con formación de desarrolladores.",
    apoyo: "El software que necesita hoy, y el equipo que puede sostenerlo mañana.",
    bajada: "Incubation es el programa de Teamcubation en el que un equipo mixto construye software mientras forma desarrolladores sobre el proyecto de su empresa. El programa dura seis meses. Al finalizar, los desarrolladores pueden integrarse a su equipo conociendo el producto, el código y el negocio.",
    img: "torre-contrapicado-escalada.png",
    ficha: [
      { k: "Duración", v: "Seis meses" },
      { k: "Formato", v: "Equipo mixto de Teamcubation" },
      { k: "Foco", v: "Software y formación de desarrolladores" },
    ],
    quienH2: "¿Para quién es Incubation?",
    quienP: "Empresas que necesitan construir software y hacer crecer su equipo técnico. Incubation combina ambas necesidades en un proyecto donde los desarrolladores se forman sobre el producto que están construyendo.",
    alcanceH2: "¿Cómo se forma el talento dentro del proyecto?",
    alcanceP: "Desarrolladores experimentados de Teamcubation guían a las personas en formación mientras trabajan en el software de la empresa. La experiencia técnica se construye junto con el conocimiento del producto, el código y el negocio.",
    comoH2: "¿Cómo funciona Incubation?",
    pasos: [
      { n: "1. Trabajar sobre el producto.", t: "El equipo mixto construye el software que necesita la empresa durante el programa." },
      { n: "2. Formar dentro del desarrollo.", t: "Las personas en formación trabajan con liderazgo experimentado y prácticas de ingeniería." },
      { n: "3. Preparar la continuidad.", t: "Al finalizar, los desarrolladores pueden integrarse a la empresa con experiencia sobre el proyecto que ayudaron a construir." },
    ],
    entregaH2: "Software y personas que conocen cómo sostenerlo.",
    entregaP: "El programa combina software, documentación y prácticas de trabajo con desarrolladores formados sobre el propio producto. Su posible incorporación al equipo se define en el marco del programa.",
    segH3: "¿Cómo acompañamos el avance?",
    segP: "En Incubation, Teamboarding acompaña la medición del avance de los desarrolladores en formación durante el proyecto.",
    segLinkT: "Conocer Teamboarding",
    segLinkKey: "teamboarding",
    faqs: [
      { q: "¿Quién guía el desarrollo?", a: "Desarrolladores experimentados de Teamcubation acompañan al equipo en formación y las prácticas de ingeniería del proyecto." },
      { q: "¿Qué pasa al finalizar con los desarrolladores?", a: "Pueden integrarse al equipo de la empresa. Llegan con experiencia sobre el producto, el código y el negocio en los que trabajaron durante el programa." },
      { q: "¿Qué distingue el formato de Incubation?", a: "La construcción de software y la formación de desarrolladores ocurren dentro del mismo proyecto. El programa trabaja sobre el producto y sobre la capacidad de las personas que pueden sostenerlo." },
      { q: "¿Cuánto dura Incubation?", a: "Seis meses, con un equipo mixto que construye software y forma desarrolladores sobre el proyecto de la empresa." },
    ],
    otros: [
      { k: "dev", p: "Para incorporar IA al flujo de un equipo de desarrollo existente." },
      { k: "builders", p: "Para formar especialistas internos en automatización con IA." },
    ],
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
    titulo: "Que las personas de su compañía aprovechen la IA para trabajar con mayor eficiencia.",
    etiqueta: "Capa de superficie — equipos de negocio.",
    bajada: "Sus equipos conocen las tareas que necesitan mejorar. El entrenamiento parte de ese conocimiento y trabaja sobre sus herramientas y procesos.",
    keys: ["starter", "booster", "intensivo"],
  },
  {
    titulo: "Que las personas más avanzadas en el uso de la IA, puedan construir tecnología.",
    etiqueta: "Capa intermedia — construcción con IA.",
    bajada: "Los perfiles de negocio pueden crear herramientas internas. Los perfiles técnicos pueden profundizar en integraciones y procesos de mayor complejidad.",
    keys: ["vibecode", "builders"],
  },
  {
    titulo: "Incorporar talento y nuevas habilidades tecnológicas a su equipo de desarrollo.",
    etiqueta: "Núcleo IT — equipos de desarrollo.",
    bajada: "Entrenamos a los equipos de desarrollo para incorporar IA y formamos desarrolladores mientras construyen el software que la empresa necesita.",
    keys: ["dev", "incubation"],
  },
];
