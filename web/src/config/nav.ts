export const navLinks = {
  mainNav: [
    { title: "About", href: "/about" },
    { title: "First Aid", href: "/first-aid" },
    { title: "Shop", href: "/shop" },
    { title: "Cart", href: "/shop/cart" },
    { title: "Contact", href: "/contact" },
  ],
  footerNav: {
    company: [
      { title: "About Somatic", href: "/about" },
      { title: "Services", href: "/services" },
      { title: "Features", href: "/features" },
      { title: "Blog", href: "/blog" },
      { title: "Contact Us", href: "/contact" },
    ],
    support: [
      { title: "Help Center", href: "/contact" },
      { title: "Guidelines", href: "/guidelines" },
      { title: "FAQ", href: "/faq" },
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
      {
        title: "LinkedIn",
        href: "https://www.linkedin.com/in/abhisek-dash-49904a371/",
        icon: "linkedin",
      },
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
      { title: "Medicines", href: "/admin/medicines", icon: "Pill" },
      { title: "Blood Banks", href: "/admin/bloodbanks", icon: "Droplets" },
      { title: "Settings", href: "/admin/settings", icon: "Settings" },
      { title: "System Logs", href: "/admin/logs", icon: "Logs" },
      { title: "Profile", href: "/admin/profile", icon: "UserShield" },
    ],
    doctor: [
      { title: "Dashboard", href: "/doctor", icon: "LayoutDashboard" },
      {
        title: "Consultations",
        href: "/doctor/consultations",
        icon: "Stethoscope",
      },
      { title: "Tickets", href: "/tickets", icon: "Ticket" },
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
      { title: "Tickets", href: "/tickets", icon: "Ticket" },
      { title: "Profile", href: "/patient/profile", icon: "User" },
    ],
  },
};
