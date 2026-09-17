// Contenido de Contacto por idioma. ES = original; EN traducido con criterio
// empresarial (pendiente de revisión humana). PT reutiliza ES.
interface AyudaItem { titulo: string; texto: string }
interface Faq { pregunta: string; respuesta: string }
interface SelectOption { value: string; label: string }

export interface ContactoContent {
  seoTitle: string;
  seoDesc: string;
  migaHome: string;
  migaActual: string;
  heroH1: string;
  heroP: string;
  form: {
    perfilLabel: string;
    perfilPlaceholder: string;
    perfilOpciones: SelectOption[];
    nombreLabel: string;
    emailLabel: string;
    telLabel: string;
    telPaisPlaceholder: string;
    telPaisAria: string;
    telAreaPlaceholder: string;
    telAreaAria: string;
    telNumeroPlaceholder: string;
    telNumeroAria: string;
    mensajeLabel: string;
    mensajePlaceholder: string;
    error: string;
    boton: string;
  };
  exito: { h2: string; p: string };
  ayudaH2: string;
  ayuda: AyudaItem[];
  faqH2: string;
  faqs: Faq[];
  linkFinal: string;
}

export const contactoContent: Record<"es" | "en", ContactoContent> = {
  es: {
    seoTitle: "Contacto | Teamcubation",
    seoDesc: "Conversemos sobre el próximo paso de su equipo: qué proceso necesita mejorar, qué quiere construir y qué programa se ajusta a su necesidad.",
    migaHome: "Inicio",
    migaActual: "Contacto",
    heroH1: "Conversemos sobre el próximo paso de su equipo.",
    heroP: "Cuéntenos qué proceso necesita mejorar, qué quiere construir y cómo trabaja hoy su equipo. En una conversación con Teamcubation podemos identificar qué programa se ajusta a su necesidad y qué información hace falta para definir el primer paso.",
    form: {
      perfilLabel: "¿Cómo se identifica?",
      perfilPlaceholder: "Seleccione una opción",
      perfilOpciones: [
        { value: "empresa", label: "Represento a una empresa" },
        { value: "rrhh", label: "Trabajo en RRHH o desarrollo de talento" },
        { value: "tech", label: "Lidero un equipo de tecnología" },
        { value: "persona", label: "Busco entrenarme individualmente" },
        { value: "otro", label: "Otro" },
      ],
      nombreLabel: "Nombre",
      emailLabel: "Email",
      telLabel: "Teléfono",
      telPaisPlaceholder: "País",
      telPaisAria: "Código de país",
      telAreaPlaceholder: "Área",
      telAreaAria: "Código de área",
      telNumeroPlaceholder: "Número",
      telNumeroAria: "Número",
      mensajeLabel: "Su mensaje",
      mensajePlaceholder: "Qué proceso necesita mejorar, qué quiere construir y cómo trabaja hoy su equipo.",
      error: "Complete cómo se identifica, su nombre, un email válido y el mensaje.",
      boton: "Enviar mensaje",
    },
    exito: {
      h2: "Recibimos su mensaje.",
      p: "Nos pondremos en contacto en menos de 48 horas hábiles para coordinar la conversación.",
    },
    ayudaH2: "¿Qué nos ayuda a entender su necesidad?",
    ayuda: [
      { titulo: "El equipo.", texto: "Quiénes participan y qué experiencia tienen usando IA o desarrollando software." },
      { titulo: "El punto de partida.", texto: "Qué herramientas utilizan hoy y qué resultado quieren alcanzar." },
    ],
    faqH2: "Antes de conversar.",
    faqs: [
      { pregunta: "¿Necesito haber elegido un programa?", respuesta: "No. Podemos conversar sobre el objetivo de su equipo y evaluar qué programa corresponde." },
      { pregunta: "¿Puedo contactar si mi empresa todavía no usa IA?", respuesta: "Sí. Podemos revisar el punto de partida y evaluar si conviene empezar con Starter AI o realizar un Discovery para priorizar oportunidades." },
    ],
    linkFinal: "Comparar los programas de Teamcubation",
  },

  en: {
    seoTitle: "Contact | Teamcubation",
    seoDesc: "Let's talk about your team's next step: which process you need to improve, what you want to build and which program fits your need.",
    migaHome: "Home",
    migaActual: "Contact",
    heroH1: "Let's talk about your team's next step.",
    heroP: "Tell us which process you need to improve, what you want to build and how your team works today. In a conversation with Teamcubation we can identify which program fits your need and what information is required to define the first step.",
    form: {
      perfilLabel: "How do you identify?",
      perfilPlaceholder: "Select an option",
      perfilOpciones: [
        { value: "empresa", label: "I represent a company" },
        { value: "rrhh", label: "I work in HR or talent development" },
        { value: "tech", label: "I lead a technology team" },
        { value: "persona", label: "I'm looking to train individually" },
        { value: "otro", label: "Other" },
      ],
      nombreLabel: "Name",
      emailLabel: "Email",
      telLabel: "Phone",
      telPaisPlaceholder: "Country",
      telPaisAria: "Country code",
      telAreaPlaceholder: "Area",
      telAreaAria: "Area code",
      telNumeroPlaceholder: "Number",
      telNumeroAria: "Number",
      mensajeLabel: "Your message",
      mensajePlaceholder: "Which process you need to improve, what you want to build and how your team works today.",
      error: "Please complete how you identify, your name, a valid email and the message.",
      boton: "Send message",
    },
    exito: {
      h2: "We received your message.",
      p: "We'll get in touch within 48 business hours to arrange the conversation.",
    },
    ayudaH2: "What helps us understand your need?",
    ayuda: [
      { titulo: "The team.", texto: "Who takes part and what experience they have using AI or developing software." },
      { titulo: "The starting point.", texto: "Which tools they use today and what result they want to reach." },
    ],
    faqH2: "Before we talk.",
    faqs: [
      { pregunta: "Do I need to have chosen a program?", respuesta: "No. We can talk about your team's goal and assess which program fits." },
      { pregunta: "Can I get in touch if my company doesn't use AI yet?", respuesta: "Yes. We can review the starting point and assess whether it's best to begin with Starter AI or run a Discovery to prioritize opportunities." },
    ],
    linkFinal: "Compare Teamcubation's programs",
  },
};
