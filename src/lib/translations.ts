export type Locale = "en" | "tn";

/**
 * Public-facing copy in English and Setswana.
 * Setswana strings should be checked by a native speaker before launch.
 */
export const translations = {
  en: {
    "nav.home": "Home",
    "nav.calls": "Open calls",
    "nav.how": "How it works",
    "nav.track": "Track my idea",
    "nav.eligibility": "Am I eligible?",
    "nav.about": "About",
    "nav.signin": "Sign in",
    "nav.dashboard": "Dashboard",
    "nav.language": "Setswana",

    "hero.kicker": "CEDA Innovation Portal · Youth innovation challenge 2026",
    "hero.title": "Turn your idea into a funded Botswana business",
    "hero.subtitle":
      "Batswana aged 18 to 35 submit ideas to CEDA in one place, get scored fairly by independent experts, see exactly where their application is, and get feedback they can act on.",
    "hero.cta.apply": "See open calls",
    "hero.cta.eligible": "Check eligibility",
    "hero.cta.track": "Track with a reference",
    "hero.cta.register": "Create an account",

    "how.title": "From idea to award, in the open",
    "how.subtitle": "Every application moves through the same five stages. You can see which one yours is in, at any time.",
    "stage.submission": "Submission",
    "stage.submission.desc": "Answer a short form, upload your pitch deck and CIPA certificate, then sign and submit. You get a tamper-proof receipt.",
    "stage.review": "Review",
    "stage.review.desc": "CEDA screens for eligibility. Independent evaluators declare conflicts, then score your idea against published criteria.",
    "stage.feedback": "Feedback",
    "stage.feedback.desc": "If something is missing, CEDA asks for changes. You reply in the portal and resubmit, with no lost emails.",
    "stage.approval": "Approval",
    "stage.approval.desc": "An adjudication panel sees the ranked shortlist, compares every scorecard and decides.",
    "stage.award": "Award",
    "stage.award.desc": "Winners are notified at once with the award amount. Everyone gets anonymous evaluator feedback.",

    "track.title": "Track my idea",
    "track.subtitle": "Enter the reference on your receipt, for example CEDA-26-K7Q2.",
    "track.button": "Track",
    "track.notfound": "No application has that reference.",
  },
  tn: {
    "nav.home": "Gae",
    "nav.calls": "Dikopo tse di buleng",
    "nav.how": "Go dira jang",
    "nav.track": "Latela kakanyo ya me",
    "nav.eligibility": "A ke a tshwanelega?",
    "nav.about": "Ka ga rona",
    "nav.signin": "Tsena",
    "nav.dashboard": "Tsamaiso",
    "nav.language": "English",

    "hero.kicker": "CEDA Innovation Portal · Kgaisano ya botlhami jwa basha 2026",
    "hero.title": "Fetola kakanyo ya gago go nna kgwebo ya Botswana e e thusiwang ka madi",
    "hero.subtitle":
      "Batswana ba dingwaga di le 18 go ya go 35 ba romela dikakanyo kwa CEDA mo lefelong le le lengwe, ba tlhatlhobiwa ka tekatekano ke baitseanape, ba bona kopo ya bone e le kae, mme ba amogela dikakgelo.",
    "hero.cta.apply": "Bona dikopo tse di buleng",
    "hero.cta.eligible": "Tlhola fa o tshwanelega",
    "hero.cta.track": "Latela ka nomoro",
    "hero.cta.register": "Ikwadise",

    "how.title": "Go tswa mo kakanyong go ya kwa tshimologong",
    "how.subtitle": "Kopo nngwe le nngwe e feta mo dikgatong tse tlhano. O ka bona gore ya gago e kae nako nngwe le nngwe.",
    "stage.submission": "Go romela",
    "stage.submission.desc": "Tlatsa foromo, tsenya pitch deck le setlankana sa CIPA, o bo o romela. O amogela rasiti e e sa fetoleng.",
    "stage.review": "Tlhatlhobo",
    "stage.review.desc": "CEDA e tlhola fa o tshwanelega. Batlhatlhobi ba ba ikemetseng ba naya kakanyo ya gago maduo.",
    "stage.feedback": "Dikakgelo",
    "stage.feedback.desc": "Fa sengwe se tlhaela, CEDA e kopa diphetogo. O araba mo portal mme o romela gape.",
    "stage.approval": "Tumelelo",
    "stage.approval.desc": "Lekgotla le bona lenaane le le tlhophilweng, le bapisa maduo mme le tsaya tshwetso.",
    "stage.award": "Sekgele",
    "stage.award.desc": "Bafenyi ba itsisiwe ka bonako. Mongwe le mongwe o amogela dikakgelo tsa batlhatlhobi.",

    "track.title": "Latela kakanyo ya me",
    "track.subtitle": "Tsenya nomoro e e mo rasiting ya gago, sekai CEDA-26-K7Q2.",
    "track.button": "Latela",
    "track.notfound": "Ga go na kopo e e nang le nomoro eo.",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
