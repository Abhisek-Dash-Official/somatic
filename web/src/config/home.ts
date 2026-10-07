import {
  Ambulance,
  BookOpen,
  FlaskConical,
  ShieldCheck,
  Siren,
  Stethoscope,
} from "lucide-react";

export const careServices = [
  {
    title: "Emergency & First Aid",
    description:
      "Structured first-aid information and emergency support for situations that may require immediate attention.",
    items: ["First Aid", "SOS", "Emergency Support"],
    icon: Siren,
  },
  {
    title: "Doctor Consultation",
    description:
      "Patient information can be organized and reviewed by qualified medical professionals.",
    items: ["Patient Intake", "Department Routing", "Doctor Review"],
    icon: Stethoscope,
  },
  {
    title: "Hospital & Ambulance",
    description:
      "Connect supported hospital and ambulance workflows when additional coordination is required.",
    items: ["Hospital Search", "Ambulance Coordination", "QR Admission"],
    icon: Ambulance,
  },
  {
    title: "Treatment Support",
    description:
      "Healthcare support beyond consultation through connected medicine, blood and insurance workflows.",
    items: ["Medicines", "Blood Availability", "Insurance"],
    icon: ShieldCheck,
  },
  {
    title: "Laboratory & Reports",
    description:
      "Continue from laboratory test booking and sample collection to results and medical reports.",
    items: ["Lab Tests", "Sample Collection", "Medical Reports"],
    icon: FlaskConical,
  },
  {
    title: "Health Information",
    description:
      "Access healthcare education, medicine information and conversational assistance through SOMA AI.",
    items: ["Health Articles", "Medicine Information", "SOMA AI"],
    icon: BookOpen,
  },
];

export const journey = [
  {
    number: "01",
    title: "A healthcare need begins",
    description:
      "Patients can share information through text, voice, supported languages, images, videos or medical documents.",
  },
  {
    number: "02",
    title: "Information is organized",
    description:
      "SOMATIC uses AI assistance to help extract symptoms, translate information, prepare summaries and identify relevant indicators.",
  },
  {
    number: "03",
    title: "A professional reviews",
    description:
      "Authorized medical professionals review, correct and approve AI-assisted information before final medical guidance is delivered.",
  },
  {
    number: "04",
    title: "Healthcare services connect",
    description:
      "Hospitals, ambulances, medicines, blood, insurance and laboratory services can support the patient's ongoing needs.",
  },
  {
    number: "05",
    title: "Care continues",
    description:
      "Patients can access supported prescriptions, reports, healthcare information and follow-up services through their digital journey.",
  },
];

export const connectedServices = [
  "Patients",
  "Doctors",
  "Hospitals",
  "Ambulances",
  "Laboratories",
  "Pharmacies",
  "Insurance",
  "Healthcare Services",
];
