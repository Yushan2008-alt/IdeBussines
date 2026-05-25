export type Language = "id" | "en";

export interface Translations {
  common: {
    loading: string;
    save: string;
    cancel: string;
    close: string;
    send: string;
    back: string;
    next: string;
    skip: string;
    crisis: {
      hotline: string;
      inCrisis: string;
      needHelp: string;
      callNow: string;
    };
  };
  nav: {
    home: string;
    journal: string;
    mood: string;
    community: string;
    profile: string;
  };
  auth: {
    login: string;
    register: string;
    logout: string;
    email: string;
    password: string;
    forgotPassword: string;
    noAccount: string;
    hasAccount: string;
    rememberMe: string;
  };
  dashboard: {
    title: string;
    greeting: {
      morning: string;
      afternoon: string;
      evening: string;
      night: string;
    };
    emergency: string;
  };
  ai: {
    curhat: string;
    teduhBot: string;
    typeMessage: string;
    summary: string;
  };
  language: {
    switchTo: string;
  };
}
