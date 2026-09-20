export interface ShopCategory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image: string;
  badge: string;
  themeColor: "teal" | "red" | "blue" | "purple";
  features: string[];
}

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: "medicines",
    title: "Pharmacy & Medicines",
    subtitle: "Genuine Healthcare Essentials",
    description:
      "Order prescribed and over-the-counter medicines directly with fast doorstep delivery.",
    href: "/medicines",
    image: "/shop/medicines.jpg",
    badge: "Available 24/7",
    themeColor: "teal",
    features: ["100% Genuine Products", "Prescription Upload", "Home Delivery"],
  },
  {
    id: "bloodbanks",
    title: "Blood Bank Units",
    subtitle: "Emergency & Regular Supply",
    description:
      "Find available blood groups and units from verified blood banks in real-time.",
    href: "/bloodbanks",
    image: "/shop/bloodbanks.jpeg",
    badge: "Urgent Support",
    themeColor: "red",
    features: [
      "Real-time Inventory",
      "Verified Donors & Banks",
      "Emergency Requests",
    ],
  },
];
