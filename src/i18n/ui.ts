// Strings de interfaz compartidos, por idioma. (ES = original; EN/PT traducidos
// con criterio empresarial — pendientes de revisión humana antes de publicar.)
import type { Locale } from "./config";

export const email = "hola@teamcubation.com";

export const ui: Record<Locale, {
  cta: string;
  skip: string;
  navAria: string;
  footerAria: string;
  footerConoce: string;
  footerProgramas: string;
  footerClaim: string;
  footerDesc: string;
  footerCopy: string;
  cierreTexto: string;
  langNombre: string;
}> = {
  es: {
    cta: "Agendar una conversación",
    skip: "Ir al contenido",
    navAria: "Navegación principal",
    footerAria: "Pie de página",
    footerConoce: "Conozca Teamcubation",
    footerProgramas: "Programas",
    footerClaim: "La capacidad queda en las personas.",
    footerDesc: "Teamcubation entrena equipos para adoptar IA sobre sus procesos y construir capacidades que crecen dentro de la empresa.",
    footerCopy: "Teamcubation. La experiencia no se enseña: se entrena.",
    cierreTexto: "Conversemos sobre cómo potenciar su compañía con AI.",
    langNombre: "Español",
  },
  en: {
    cta: "Schedule a conversation",
    skip: "Skip to content",
    navAria: "Main navigation",
    footerAria: "Footer",
    footerConoce: "Get to know Teamcubation",
    footerProgramas: "Programs",
    footerClaim: "The capability stays with your people.",
    footerDesc: "Teamcubation trains teams to adopt AI on their own processes and build capabilities that grow inside the company.",
    footerCopy: "Teamcubation. Experience isn't taught: it's trained.",
    cierreTexto: "Let's talk about how to power your company with AI.",
    langNombre: "English",
  },
  pt: {
    cta: "Agende uma conversa",
    skip: "Ir para o conteúdo",
    navAria: "Navegação principal",
    footerAria: "Rodapé",
    footerConoce: "Conheça a Teamcubation",
    footerProgramas: "Programas",
    footerClaim: "A capacidade fica nas pessoas.",
    footerDesc: "A Teamcubation treina equipes para adotar IA nos seus processos e construir capacidades que crescem dentro da empresa.",
    footerCopy: "Teamcubation. A experiência não se ensina: se treina.",
    cierreTexto: "Vamos conversar sobre como potencializar sua empresa com AI.",
    langNombre: "Português",
  },
};
