export const siteConfig = {
  name: "Somatic",
  shortName: "Somatic",
  description:
    "A smart patient case-taking platform that helps Ayush healthcare professionals record, organize, and manage patient information efficiently. Simplify clinical documentation and make Rog Pariksha faster and more structured.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  authors: [
    {
      name: "Abhisek Dash",
      url: "https://github.com/Abhisek-Dash-Official/",
    },
  ],
  keywords: [
    "AI Healthcare",
    "Medical Consultation",
    "Digital Healthcare",
    "HealthTech SaaS",
    "Telemedicine AI",
    "Electronic Health Records",
    "EHR System",
    "Ministry of Ayush",
    "SIH260470",
    "Smart India Hackathon 2026",
    "Ayush Case Taking",
    "Ayurveda AI",
    "Rog Pariksha",
    "Dosha Analysis",
    "Vata Pitta Kapha",
    "Nadi Pariksha AI",
    "Panchakarma Tech",
    "Ayurvedic Diagnosis",
    "Doctor Dashboard",
    "Patient Care System",
    "Symptom Analysis",
    "AI Prescription Generator",
    "Clinical Workflow",
    "Medical NLP",
  ],
};

export type SiteConfig = typeof siteConfig;
