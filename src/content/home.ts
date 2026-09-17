// Contenido del Home por idioma. ES = original (render v2); EN traducido con
// criterio empresarial (pendiente de revisión humana). PT: pendiente.
import type { HeroContent } from "../components/home/HeroHome.astro";
import type { CapasContent } from "../components/home/CapasApiladas.astro";

interface Enlace { label: string; href: string }

export interface HomeContent {
  hero: HeroContent;
  capacidad: {
    h2: string;
    listaIntro: string;
    bullets: [string, string];
    p: string;
    chips: [string, string, string];
    link: Enlace;
  };
  dosfotos: {
    criterioH2Html: string;
    criterioP: string;
    criterioLink: Enlace;
    capacidadH2: string;
    panelP: string;
  };
  capas: CapasContent;
  airank: {
    eyebrow: string;
    h2: string;
    intro: string;
    cardTitulo: string;
    cardDesc: string;
    bullets: [string, string, string];
    accion: string;
  };
  evidencia: {
    h2: string;
    p: string;
    stats: { num: string; lbl: string }[];
    link: Enlace;
  };
  alts: {
    capacidadImg: string;
    criterioFoto: string;
    resultadoFoto: string;
    airankImg: string;
  };
}

export const homeContent: Record<"es" | "en", HomeContent> = {
  es: {
    hero: {
      eyebrow: "La inversión en IA necesita adopción.",
      tituloHtml:
        '¿Su compañía está aprovechando todo <span class="resaltado">el potencial de la IA?</span>',
      subhead: "Entrenamos a sus equipos para adoptar IA con impacto real en el negocio.",
      bajadaHtml:
        "A diferencia de un curso sus colaboradores aprenden, guiados por nuestros mentores expertos, trabajando en procesos y proyectos reales de su día a día.<br />Porque la experiencia no se enseña: <b>se entrena</b>.",
    },
    capacidad: {
      h2: "Desarrollamos la capacidad de tu empresa para usar y construir la tecnología que necesita.",
      listaIntro: "En Teamcubation entrenamos a los equipos sobre sus propios procesos y proyectos:",
      bullets: [
        "Acompañamos a las personas no técnicas que necesitan incorporar IA a su trabajo.",
        "También entrenamos a nuevos desarrolladores mientras construyen el software que la empresa necesita.",
      ],
      p: "La experiencia que se construye haciendo queda en las personas y les permite encarar el siguiente desafío con más autonomía.",
      chips: ["Procesos reales", "Experiencia", "Capacidad"],
      link: { label: "Conocer nuestra metodología", href: "/metodologia" },
    },
    dosfotos: {
      criterioH2Html: 'El <span class="resaltado">criterio</span> se forma haciendo.',
      criterioP:
        "Tener acceso a una herramienta es el comienzo. Aprender a pensar de forma sistemica, elegir qué problema resolver, entender cómo funciona una solución y evaluar como implementarla requiere ejecución sobre el trabajo real.",
      criterioLink: { label: "Conoce nuestra metodología", href: "/metodologia" },
      capacidadH2: "La capacidad queda en las personas.",
      panelP:
        "Nuestro objetivo es que cada equipo pueda sostener lo que construye y resolver el siguiente problema con más autonomía.",
    },
    capas: {
      grande: "¿Qué podemos lograr juntos?",
      headH2: "Un punto de partida para cada equipo.",
      intro:
        "Desde aplicar IA en las tareas cotidianas hasta construir software y formar desarrolladores. Cada equipo empieza según lo que necesita resolver y la experiencia que ya tiene.",
      capas: [
        {
          titulo:
            "Que las personas en su compañía utilicen todo el potencial de la AI para trabajar con mayor eficiencia.",
          prefijo: "Capa de superficie — equipos de negocio.",
          desc: "Sus equipos conocen las tareas que necesitan mejorar. El entrenamiento parte de ese conocimiento y trabaja sobre sus herramientas y procesos con foco en la adopción.",
          imgAlt: "Colaboradores verdes y un mentor naranja moviendo una esfera lima sobre un bloque de concreto",
          programas: [
            { nombre: "Starter AI", href: "/servicios/starter-ai", desc: "Equipos sin experiencia previa aprenden a usar IA sobre sus tareas y con las herramientas que ya tienen.", dato: "Un mes." },
            { nombre: "Booster AI", href: "/servicios/booster-ai", desc: "Equipos de negocio automatizan procesos propios con IA y agentes, acompañados por mentores expertos.", dato: "Cinco semanas." },
            { nombre: "Booster AI Intensivo", href: "/servicios/booster-ai-intensivo", desc: "Seis personas en tres duplas construyen una primera automatización real por dupla, en un piloto acotado.", dato: "Una semana." },
          ],
        },
        {
          titulo: "Que las personas más avanzadas en el uso de la IA, puedan construir tecnología.",
          prefijo: "Capa intermedia — construcción con IA.",
          desc: "Los perfiles de negocio pueden crear herramientas internas. Los perfiles técnicos pueden profundizar en integraciones y procesos de mayor complejidad.",
          imgAlt: "Equipos verdes y naranjas construyendo estructuras de concreto con anillos ámbar y piezas lima",
          programas: [
            { nombre: "VibeCode Studio", href: "/servicios/vibecode-studio", desc: "Equipos que ya usan IA construyen micro-aplicaciones de negocio, sin programación tradicional.", dato: "Dos meses." },
            { nombre: "AI Builders", href: "/servicios/ai-builders", desc: "Perfiles técnicos se forman para construir automatizaciones complejas e integraciones entre sistemas dentro de su empresa.", dato: "Cuatro meses, dedicación completa." },
          ],
        },
        {
          titulo: "Incoporar talento y habilidades tech a su equipo.",
          prefijo: "Núcleo IT — equipos de desarrollo.",
          desc: "Entrenamos a los equipos de desarrollo para incorporar IA y formamos desarrolladores mientras construyen el software que la empresa necesita.",
          imgAlt: "Torre densa de concreto en contrapicado que equipos verdes y naranjas escalan con piezas lima y ámbar",
          programas: [
            { nombre: "Booster AI Dev", href: "/servicios/booster-ai-dev", desc: "Equipos de desarrollo incorporan herramientas y agentes de IA sobre su sprint y sus repositorios.", dato: "Un mes." },
            { nombre: "Incubation", href: "/servicios/incubation", desc: "Software construido mientras se forman los desarrolladores que después pueden integrarse a su equipo.", dato: "Seis meses." },
          ],
        },
      ],
    },
    airank: {
      eyebrow: "Diagnóstico · sin costo",
      h2: "¿Cómo usan la IA las persona de su organización?",
      intro: "Antes de elegir un programa conviene saber de dónde parte cada persona.",
      cardTitulo: "AI Rank",
      cardDesc: "Diagnóstico gratuito de adopción de IA. Mide el nivel real de cada persona por rol y por dimensión.",
      bullets: [
        "La distancia entre el nivel actual y el que necesita su empresa",
        "Qué programa corresponde según la brecha",
        "Sin costo y sin compromiso.",
      ],
      accion: "Hacer el diagnóstico",
    },
    evidencia: {
      h2: "Experiencia construida con empresas de distintos sectores.",
      p: "Trabajamos con más de 90 empresas líderes en Argentina, Brasil, Uruguay, Colombia y España. Entre nuestros clientes están empresas como Mercado Libre, Coca-Cola y Visa.",
      stats: [
        { num: "+90", lbl: "Más de 90 empresas líderes." },
        { num: "5", lbl: "5 países: Argentina, Brasil, Uruguay, Colombia y España." },
        { num: "35%", lbl: "Hasta 35% de mejora de eficiencia en los procesos intervenidos." },
      ],
      link: { label: "Conocer nuestra trayectoria", href: "/casos" },
    },
    alts: {
      capacidadImg: "Torre de concreto blanco en contrapicado que equipos verdes y naranjas escalan con piezas ámbar y lima",
      criterioFoto: "Una mentora señala la pantalla de una laptop junto a un colaborador que toma notas",
      resultadoFoto: "Equipo mirando un resultado en pantalla",
      airankImg: "Escalones de concreto que equipos verdes suben con piezas de vidrio lima y resina ámbar, mientras un mentor naranja señala desde arriba",
    },
  },

  en: {
    hero: {
      eyebrow: "Your AI investment needs adoption.",
      tituloHtml:
        'Is your company harnessing all <span class="resaltado">the potential of AI?</span>',
      subhead: "We train your teams to adopt AI with real business impact.",
      bajadaHtml:
        "Unlike a course, your people learn by working on the real processes and projects of their day-to-day, guided by our expert mentors.<br />Because experience isn't taught: <b>it's trained</b>.",
    },
    capacidad: {
      h2: "We build your company's capability to use and build the technology it needs.",
      listaIntro: "At Teamcubation we train teams on their own processes and projects:",
      bullets: [
        "We support non-technical people who need to bring AI into their work.",
        "We also train new developers while they build the software the company needs.",
      ],
      p: "The experience built by doing stays with the people and lets them tackle the next challenge with more autonomy.",
      chips: ["Real processes", "Experience", "Capability"],
      link: { label: "Explore our methodology", href: "/en/methodology" },
    },
    dosfotos: {
      criterioH2Html: 'Good <span class="resaltado">judgment</span> is formed by doing.',
      criterioP:
        "Having access to a tool is just the beginning. Learning to think systematically, choosing which problem to solve, understanding how a solution works and evaluating how to implement it takes execution on real work.",
      criterioLink: { label: "Explore our methodology", href: "/en/methodology" },
      capacidadH2: "The capability stays with your people.",
      panelP:
        "Our goal is for every team to sustain what it builds and solve the next problem with more autonomy.",
    },
    capas: {
      grande: "What can we achieve together?",
      headH2: "A starting point for every team.",
      intro:
        "From applying AI to everyday tasks to building software and training developers. Each team starts based on what it needs to solve and the experience it already has.",
      capas: [
        {
          titulo: "Have the people in your company use AI's full potential to work more efficiently.",
          prefijo: "Surface layer — business teams.",
          desc: "Your teams know the tasks they need to improve. Training starts from that knowledge and works on their tools and processes with a focus on adoption.",
          imgAlt: "Green collaborators and an orange mentor moving a lime sphere over a concrete block",
          programas: [
            { nombre: "Starter AI", href: "/en/services/starter-ai", desc: "Teams with no prior experience learn to use AI on their tasks with the tools they already have.", dato: "One month." },
            { nombre: "Booster AI", href: "/en/services/booster-ai", desc: "Business teams automate their own processes with AI and agents, guided by expert mentors.", dato: "Five weeks." },
            { nombre: "Booster AI Intensive", href: "/en/services/booster-ai-intensivo", desc: "Six people in three pairs build a first real automation per pair, in a focused pilot.", dato: "One week." },
          ],
        },
        {
          titulo: "Have your most advanced AI users build technology.",
          prefijo: "Middle layer — building with AI.",
          desc: "Business profiles can create internal tools. Technical profiles can go deeper into integrations and more complex processes.",
          imgAlt: "Green and orange teams building concrete structures with amber rings and lime pieces",
          programas: [
            { nombre: "VibeCode Studio", href: "/en/services/vibecode-studio", desc: "Teams already using AI build business micro-apps, with no traditional programming.", dato: "Two months." },
            { nombre: "AI Builders", href: "/en/services/ai-builders", desc: "Technical profiles train to build complex automations and integrations between systems within your company.", dato: "Four months, full-time." },
          ],
        },
        {
          titulo: "Add tech talent and skills to your team.",
          prefijo: "IT core — development teams.",
          desc: "We train development teams to adopt AI and we train developers while they build the software the company needs.",
          imgAlt: "A dense concrete tower seen from below that green and orange teams climb with lime and amber pieces",
          programas: [
            { nombre: "Booster AI Dev", href: "/en/services/booster-ai-dev", desc: "Development teams adopt AI tools and agents on their sprint and repositories.", dato: "One month." },
            { nombre: "Incubation", href: "/en/services/incubation", desc: "Software built while training developers who can then join your team.", dato: "Six months." },
          ],
        },
      ],
    },
    airank: {
      eyebrow: "Assessment · free",
      h2: "How do the people in your organization use AI?",
      intro: "Before choosing a program, it helps to know where each person starts.",
      cardTitulo: "AI Rank",
      cardDesc: "Free AI adoption assessment. It measures each person's real level by role and by dimension.",
      bullets: [
        "The gap between the current level and the one your company needs",
        "Which program fits based on the gap",
        "Free and with no commitment.",
      ],
      accion: "Take the assessment",
    },
    evidencia: {
      h2: "Experience built with companies across industries.",
      p: "We've worked with more than 90 leading companies in Argentina, Brazil, Uruguay, Colombia and Spain. Our clients include companies like Mercado Libre, Coca-Cola and Visa.",
      stats: [
        { num: "+90", lbl: "More than 90 leading companies." },
        { num: "5", lbl: "5 countries: Argentina, Brazil, Uruguay, Colombia and Spain." },
        { num: "35%", lbl: "Up to 35% efficiency improvement in the processes we worked on." },
      ],
      link: { label: "Explore our track record", href: "/en/clients" },
    },
    alts: {
      capacidadImg: "A white concrete tower seen from below that green and orange teams climb with amber and lime pieces",
      criterioFoto: "A mentor points at a laptop screen next to a collaborator taking notes",
      resultadoFoto: "A team looking at a result on screen",
      airankImg: "Concrete steps that green teams climb with lime glass and amber resin pieces, while an orange mentor points from above",
    },
  },
};
