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
      crisisNow: string;
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
    freeRegister: string;
    logout: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    forgotPassword: string;
    noAccount: string;
    hasAccount: string;
    rememberMe: string;
    consent: string;
    terms: string;
    privacy: string;
    invalidEmail: string;
    invalidPassword: string;
    passwordMismatch: string;
    nameRequired: string;
    invalidCredentials: string;
    emailNotConfirmed: string;
    alreadyRegistered: string;
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
    geminiContext: string;
    enterSend: string;
    clearChat: string;
  };
  language: {
    switchTo: string;
  };
  landing: {
    navbar: {
      features: string;
      howItWorks: string;
      community: string;
      about: string;
      login: string;
      freeRegister: string;
      emergency: string;
      hotline: string;
      menuToggle: string;
      loginShort: string;
    };
    hero: {
      words: string[];
      moodLabels: string[];
      breathingLabels: string[];
      badge: string;
      tagline: string;
      description: string;
      cta: string;
      seeHow: string;
      trusted: string;
      greeting: string;
      journalToday: string;
      journalEntry: string;
      breathing: string;
      chatAI: string;
      community: string;
      anonymous: string;
      affirmation: string;
      affirmationText: string;
      activeCommunity: string;
      communityMembers: string;
      moodThisWeek: string;
      teduhBot: string;
      teduhBotResponse: string;
      scrollDown: string;
      howFeel: string;
    };
    stats: {
      title: string;
      heading: string;
      description: string;
      source: string;
      stat1Label: string;
      stat1Sub: string;
      stat2Label: string;
      stat2Sub: string;
      stat3Label: string;
      stat3Sub: string;
    };
    features: {
      title: string;
      heading: string;
      description: string;
      note: string;
      cta: string;
      items: {
        moodJournal: [string, string, string];
        teduhBot: [string, string, string];
        crisisSOS: [string, string, string];
        komunitas: [string, string, string];
        breathing: [string, string, string];
        safetyPlan: [string, string, string];
        konsultasi: [string, string, string];
        afirmasi: [string, string, string];
        resource: [string, string, string];
      };
    };
    howItWorks: {
      title: string;
      heading: string;
      description: string;
      steps: {
        step1Title: string;
        step1Desc: string;
        step1Chips: string[];
        step2Title: string;
        step2Desc: string;
        step2Chips: string[];
        step3Title: string;
        step3Desc: string;
        step3Chips: string[];
      };
    };
    crisisBanner: {
      heading: string;
      description: string;
      callNow: string;
      chatWA: string;
      viewAll: string;
      note: string;
      hotlines: {
        itl: [string, string, string, string, string];
        pulih: [string, string, string, string, string];
        sejiwa: [string, string, string, string, string];
        wa: [string, string, string, string, string];
      };
    };
    testimonials: {
      title: string;
      heading: string;
      description: string;
      swipe: string;
      prev: string;
      next: string;
      privacy: string;
      items: {
        quote1: [string, string, string, string];
        quote2: [string, string, string, string];
        quote3: [string, string, string, string];
        quote4: [string, string, string, string];
      };
    };
    cta: {
      title: string;
      heading: string;
      description: string;
      cta: string;
      badges: string[];
    };
    footer: {
      brandDesc: string;
      product: string;
      productLinks: string[];
      support: string;
      supportLinks: string[];
      about: string;
      aboutLinks: string[];
      emergency: string;
      emergencySub: string;
      emergencyNote: string;
      copyright: string;
      legal: string[];
      disclaimer: string;
    };
  };
  forgotPassword: {
    heading: string;
    sub: string;
    leftTitle: string;
    leftHeading: string;
    leftDesc: string;
    emailLabel: string;
    emailPlaceholder: string;
    send: string;
    sending: string;
    success: string;
    resend: string;
    backToLogin: string;
    validationError: string;
  };
  resetPassword: {
    heading: string;
    sub: string;
    leftTitle: string;
    leftHeading: string;
    leftDesc: string;
    passwordLabel: string;
    confirmLabel: string;
    passwordPlaceholder: string;
    confirmPlaceholder: string;
    weak: string;
    fair: string;
    strong: string;
    save: string;
    saving: string;
    success: string;
    backToLogin: string;
    validationMin: string;
    validationMatch: string;
  };
  bantuan: {
    heading: string;
    sub: string;
    callEmergency: string;
    callSub: string;
    hotlineSection: string;
    showMore: string;
    showLess: string;
    whileWaiting: string;
    breathing: string;
    breathingIdle: string;
    startBreath: string;
    stopBreath: string;
    safetyPlan: string;
    safetyPlanDesc: string;
    openPlan: string;
    affirmation: string;
    footer: string;
    back: string;
  };
  breathing: {
    back: string;
    badge: string;
    title: string;
    description: string;
    start: string;
    stop: string;
    idle: string;
    idleHint: string;
    phases: {
      inhale: [string, string];
      hold: [string, string];
      exhale: [string, string];
      rest: [string, string];
    };
    timer: string;
    timerIdle: string;
  };
  onboarding: {
    welcome: {
      heading: string;
      desc: string;
      bullets: string[];
      cta: string;
    };
    nickname: {
      heading: string;
      desc: string;
      label: string;
      placeholder: string;
      consent: string;
    };
    triggers: {
      heading: string;
      desc: string;
      options: string[];
      validation: string;
    };
    goals: {
      heading: string;
      desc: string;
      options: string[];
      validation: string;
    };
    safety: {
      heading: string;
      desc: string;
      question: string;
      ever: string;
      never: string;
      infoBox: string;
    };
    wizard: {
      ageError: string;
      genericError: string;
      back: string;
      next: string;
      submit: string;
      submitting: string;
      finish: string;
    };
  };
}
