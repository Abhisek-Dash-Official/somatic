export const navLinks = {
  mainNav: [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Services", href: "/services" },
    { title: "FAQ", href: "/faq" },
    { title: "Contact", href: "/contact" },
  ],
  footerNav: {
    company: [
      { title: "About Somatic", href: "/about" },
      { title: "Features", href: "/features" },
      { title: "Blog", href: "/blog" },
      { title: "Contact Us", href: "/contact" },
    ],
    support: [
      { title: "Help Center", href: "/contact" },
      { title: "Guidelines", href: "/guidelines" },
    ],
    legal: [
      { title: "Terms of Service", href: "/terms" },
      { title: "Privacy Policy", href: "/privacy" },
    ],
    social: [
      { title: "Twitter", href: "#", icon: "twitter" },
      {
        title: "GitHub",
        href: "https://github.com/Abhisek-Dash-Official/",
        icon: "github",
      },
      { title: "LinkedIn", href: "#", icon: "linkedin" },
      { title: "Instagram", href: "#", icon: "instagram" },
      { title: "YouTube", href: "#", icon: "youtube" },
    ],
  },
  sidebarNav: {
    admin: [
      { title: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
      { title: "Departments", href: "/admin/departments", icon: "Building2" },
      { title: "Users", href: "/admin/users", icon: "Users" },
      { title: "Tickets", href: "/admin/tickets", icon: "Ticket" },
      { title: "Settings", href: "/admin/settings", icon: "Settings" },
    ],
    doctor: [
      { title: "Dashboard", href: "/doctor", icon: "LayoutDashboard" },
      {
        title: "Consultations",
        href: "/doctor/consultations",
        icon: "Stethoscope",
      },
      { title: "Profile", href: "/doctor/profile", icon: "User" },
    ],
    patient: [
      { title: "Dashboard", href: "/patient", icon: "LayoutDashboard" },
      {
        title: "New Consultation",
        href: "/patient/consultations/new",
        icon: "PlusCircle",
      },
      {
        title: "My Consultations",
        href: "/patient/consultations",
        icon: "ClipboardList",
      },
      { title: "Profile", href: "/patient/profile", icon: "User" },
    ],
  },
};
