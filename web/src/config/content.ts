export const pageContent = {
  about: {
    title: "About Somatic",
    subtitle:
      "Pioneering the Future of Ayush Healthcare with Artificial Intelligence",
    mission:
      "Our mission is to bridge the ancient wisdom of Ayurveda with the cutting-edge capabilities of Artificial Intelligence. We aim to empower Ayush practitioners by eliminating administrative friction, standardizing clinical documentation, and enhancing diagnostic accuracy through smart, structured Rog Pariksha workflows.",
    vision:
      "To become the unified digital backbone for the global Ayush ecosystem, ensuring that traditional medicine is data-driven, globally accessible, and seamlessly integrated with modern healthcare standards.",
    story:
      "Somatic was born out of a critical need observed in Ayush clinics: the immense time spent on manual case-taking and the lack of structured digital health records. Developed as a flagship solution for the Smart India Hackathon (SIH260470) under the Ministry of Ayush, Somatic leverages Advanced NLP and Machine Learning to translate complex Ayurvedic diagnoses like Vata, Pitta, and Kapha imbalances into standardized Electronic Health Records (EHR).",
    team: [
      {
        name: "Abhisek Dash",
        role: "Chief Technology Officer (CTO) & AI Lead",
        bio: "Full-stack architect engineering Somatic's system design, UI/UX, and core codebase. Specializes in backend logic and integrating the advanced LLMs powering the platform.",
        image: "/members/abhisek-dash.png",
        linkedin: "https://www.linkedin.com/in/abhisek-dash-49904a371/",
        github: "https://github.com/Abhisek-Dash-Official/",
      },
      {
        name: "Srishty Singh",
        role: "Head of Medical Data & Product Research",
        bio: "Leads medical data collection and product research for the platform. Ensures accuracy in drug databases. Works closely with the AI and clinical teams to refine medical data before doctor review.",
        image: "/members/srishty-singh.png",
        linkedin: "#",
        github: "#",
      },
      {
        name: "Baibhav",
        role: "Lead Beta Tester & QA Specialist",
        bio: "Validates system functionality from the perspective of both patients and medical professionals. Evaluates the usability of the AI draft interface to optimize the clinical review process and enhance platform safety.",
        image: "/members/baibhav.png",
        linkedin: "#",
        github: "#",
      },
    ],
  },
  contact: {
    email: "botlab.7acc@gmail.com",
    responseTime:
      "Our standard SLA for support tickets is 24-48 hours. Urgent clinical workflow issues are prioritized.",
    description:
      "Facing an issue or have a suggestion? Create a support ticket and our team will get back to you.",
  },
  faq: [
    {
      question: "What exactly is Somatic?",
      answer:
        "Somatic is a Smart Patient Case-Taking Platform specifically designed for Ayush healthcare professionals. It digitizes the entire clinical workflow, from symptom logging and Dosha analysis (Vata, Pitta, Kapha) to automated prescription generation using Artificial Intelligence.",
    },
    {
      question: "How does the AI Dosha Analysis work?",
      answer:
        "Our system utilizes Medical Natural Language Processing (NLP) to parse patient symptoms and clinical observations. It maps these inputs against standard Ayurvedic diagnostic parameters to provide doctors with a real-time, data-backed Tridosha balance assessment.",
    },
    {
      question: "Is patient data secure and compliant?",
      answer:
        "Security is our top priority. Somatic employs end-to-end encryption for all Electronic Health Records (EHR). We follow strict Role-Based Access Control (RBAC), ensuring that only authorized medical personnel can access sensitive patient data, aligning with NDHM and global healthcare data standards.",
    },
    {
      question: "Can patients access their own consultation records?",
      answer:
        "Yes. Somatic features a dedicated Patient Portal where individuals can view their past consultations, download prescriptions, and manage their demographic and medical profile securely.",
    },
    {
      question: "Does Somatic support Nadi Pariksha insights?",
      answer:
        "While Nadi Pariksha is a physical examination, Somatic provides dedicated modules for doctors to input their Nadi Pariksha findings. The AI then correlates these findings with the patient's reported symptoms to generate a comprehensive clinical picture.",
    },
    {
      question: "Is this platform only for Ayurvedic doctors?",
      answer:
        "While optimized for the Ministry of Ayush standards (Ayurveda, Yoga & Naturopathy, Unani, Siddha, and Homeopathy), the core EHR, symptom tracking, and telemedicine features are highly adaptable for conventional allopathic practitioners as well.",
    },
    {
      question: "How does the automated prescription generator work?",
      answer:
        "Once the doctor completes the case-taking module, the platform compiles the diagnosis, prescribed herbs/medicines, and lifestyle recommendations into a standardized, legally compliant PDF prescription that can be shared instantly.",
    },
  ],
  blog: [
    {
      id: 1,
      title: "The Future of Nadi Pariksha in the Digital Age",
      date: "Aug 20, 2026",
      excerpt:
        "Explore how AI and Machine Learning are assisting modern Ayurvedic doctors in traditional diagnostics, making subjective assessments more quantifiable and trackable.",
    },
    {
      id: 2,
      title: "Streamlining Ayush OPDs with Smart Case-Taking",
      date: "Aug 15, 2026",
      excerpt:
        "Manual paperwork is slowing down our clinics. Discover how Somatic reduces documentation time by 70%, allowing doctors to focus on what matters most: the patient.",
    },
    {
      id: 3,
      title: "Understanding Tridosha via Natural Language Processing",
      date: "Aug 10, 2026",
      excerpt:
        "A deep technical dive into our proprietary symptom-mapping NLP engine built specifically for the Smart India Hackathon 2026.",
    },
  ],
  features: [
    {
      title: "Smart Symptom Mapping",
      description:
        "Advanced Medical NLP extracts relevant clinical data from natural language, structuring unstructured patient narratives.",
      icon: "Cpu",
    },
    {
      title: "Real-time Dosha Calculator",
      description:
        "Automated computational models for Vata-Pitta-Kapha scoring based on centuries-old Ayurvedic algorithms combined with modern data science.",
      icon: "Activity",
    },
    {
      title: "One-Click Prescriptions",
      description:
        "Generate standardized, clean, and professional digital prescriptions instantly after the consultation.",
      icon: "FileText",
    },
    {
      title: "Role-Based Access Control",
      description:
        "Separate, highly secure portals for Admins, Doctors, and Patients ensuring complete data isolation and privacy.",
      icon: "ShieldCheck",
    },
    {
      title: "Comprehensive EHR",
      description:
        "Maintain a lifelong digital trail of patient health, chronic conditions, and past treatments accessible in milliseconds.",
      icon: "Database",
    },
    {
      title: "Clinical Workflow Analytics",
      description:
        "Dashboards for administrators to track hospital efficiency, consultation volumes, and patient demographics.",
      icon: "Zap",
    },
  ],
  services: [
    {
      title: "AI-Assisted Case Taking",
      description:
        "Transform your daily OPD. Our intelligent forms adapt to patient responses, guiding the doctor through a thorough and structured intake process without the paper clutter.",
      icon: "Stethoscope",
    },
    {
      title: "Secure Health Records Management",
      description:
        "Your patient's data is their most valuable asset. We provide bank-grade encryption to store, retrieve, and update medical histories safely.",
      icon: "Database",
    },
    {
      title: "Ayush Integration Consulting",
      description:
        "We help traditional healthcare institutions transition into the digital era, training staff to leverage AI without losing the essence of holistic medicine.",
      icon: "Zap",
    },
  ],
  legal: {
    terms: [
      {
        heading: "1. Acceptance of Terms",
        text: "By accessing and using the Somatic platform, you agree to be bound by these Terms of Service. This platform is provided as a tool for registered medical practitioners and patients.",
      },
      {
        heading: "2. Medical & Clinical Disclaimer",
        text: "Somatic is an AI-assistive software platform. It is NOT a replacement for professional medical training, diagnosis, or clinical judgment. Doctors remain solely responsible for the medical advice and prescriptions they issue.",
      },
      {
        heading: "3. User Responsibilities & Credentials",
        text: "You are responsible for maintaining the confidentiality of your login credentials. Any activity occurring under your account is your responsibility. Doctors must ensure they hold valid medical licenses to practice.",
      },
      {
        heading: "4. System Uptime and Maintenance",
        text: "While we strive for 99.9% uptime, Somatic is a digital service that may occasionally require maintenance. We are not liable for any delays in clinical operations due to system downtime.",
      },
    ],
    privacy: [
      {
        heading: "1. Data Collection & Purpose",
        text: "We collect demographic data, medical history, and clinical notes strictly for the purpose of facilitating medical consultations. We do not collect data outside the scope of patient care.",
      },
      {
        heading: "2. Data Security & Storage",
        text: "All Electronic Health Records (EHR) are encrypted at rest (AES-256) and in transit (TLS 1.3). Our databases are securely hosted and strictly monitored for unauthorized access.",
      },
      {
        heading: "3. Non-Disclosure & Third Parties",
        text: "We absolutely do not sell, rent, or share patient health data with third-party advertisers or data brokers. Data sharing only occurs when explicitly authorized by the patient for lab tests or referrals.",
      },
      {
        heading: "4. Patient Rights",
        text: "Patients retain full ownership of their health data. You have the right to request access, correction, exportation, or complete deletion of your records from our servers at any time.",
      },
    ],
    guidelines: [
      {
        heading: "Professional Conduct",
        text: "Healthcare professionals are expected to maintain the highest standards of medical ethics while utilizing the collaborative and telemedicine features of this platform.",
      },
      {
        heading: "Data Handling Protocol",
        text: "Never export patient data to unsecured personal devices. Always access EHRs through the secure Somatic portal. Protect patient anonymity when discussing cases in the community forums.",
      },
    ],
  },
};
