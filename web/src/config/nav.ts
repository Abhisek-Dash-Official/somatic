export const navLinks = {
  mainNav: [
    { title: "About", href: "/about" },
    { title: "First Aid", href: "/first-aid" },
    { title: "Shop", href: "/shop" },
    { title: "Cart", href: "/shop/cart" },
  ],

  moreNav: [
    { title: "Soma AI", href: "/chat" },
    { title: "Insurance", href: "/patient/insurance" },
    { title: "Lab Tests", href: "/labs" },
    { title: "Learn", href: "/learn" },
    { title: "Blog", href: "/blog" },
    { title: "Contact", href: "/contact" },
  ],
  portalNav: [
    {
      title: "Dashboard",
      description: "Access your role-based SOMATIC workspace",
      image: "/portal/dashboard.webp",
      hrefByRole: {
        admin: "/admin",
        dispatcher: "/dispatcher",
        doctor: "/doctor",
        assistant_doctor: "/doctor",
        patient: "/patient",
      },
      icon: "LayoutDashboard",
    },
    {
      title: "Insurance",
      description: "Manage your coverage, policies and claims",
      image: "/portal/insurance.jpeg",
      hrefByRole: {
        patient: "/patient/insurance",
        dispatcher: "/dispatcher/insurance",
        admin: "/admin/insurance",
      },
      icon: "ShieldCheck",
    },
    {
      title: "Lab Tests",
      description: "Book lab tests with convenient home sample collection",
      image: "/portal/labs.jpg",
      hrefByRole: {
        patient: "/patient/labs",
        dispatcher: "/dispatcher/labs",
        admin: "/admin/labs",
      },
      icon: "Microscope",
    },
    {
      title: "First Aid",
      description: "Find quick guidance for common emergency situations",
      image: "/portal/first-aid.jpg",
      href: "/first-aid",
      icon: "HeartPulse",
    },
    {
      title: "Shop",
      description: "Medicines, blood banks and healthcare essentials",
      image: "/portal/shop.jpeg",
      href: "/shop",
      icon: "ShoppingBag",
    },
    {
      title: "Learn",
      description:
        "Learn about medicines, health, diseases and everyday healthcare",
      image: "/portal/learn.jpeg",
      href: "/learn",
      icon: "BookOpen",
    },
  ],
  accountMenu: {
    authenticated: [
      {
        title: "Notifications",
        href: "/notifications",
        icon: "Bell",
        danger: false,
      },
      {
        title: "Dashboard",
        href: "dashboard",
        icon: "LayoutDashboard",
        danger: false,
      },
      { title: "Profile", href: "profile", icon: "User", danger: false },
      {
        title: "Sign Out",
        href: "/api/auth/signout",
        icon: "LogOut",
        danger: true,
      },
    ],
    guest: [
      { title: "Sign In", href: "/login", icon: "LogIn", danger: false },
      { title: "Register", href: "/register", icon: "UserPlus", danger: false },
    ],
  },
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
      { title: "Hospitals", href: "/admin/hospitals", icon: "Hospital" },
      { title: "Insurance", href: "/admin/insurance", icon: "ShieldCheck" },
      { title: "Labs", href: "/admin/labs", icon: "Microscope" },
      { title: "Settings", href: "/admin/settings", icon: "Settings" },
      { title: "System Logs", href: "/admin/logs", icon: "Logs" },
      { title: "Profile", href: "/admin/profile", icon: "UserShield" },
    ],
    dispatcher: [
      { title: "Dashboard", href: "/dispatcher", icon: "LayoutDashboard" },
      {
        title: "Consultations",
        href: "/dispatcher/consultations",
        icon: "Hourglass",
      },
      {
        title: "Ambulance Requests",
        href: "/dispatcher/ambulances",
        icon: "Ambulance",
      },
      {
        title: "Insurance",
        href: "/dispatcher/insurance",
        icon: "ShieldCheck",
      },
      { title: "Tickets", href: "/tickets", icon: "Ticket" },
      { title: "Profile", href: "/dispatcher/profile", icon: "User" },
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
      {
        title: "Lab Test",
        href: "/admin/labs",
        icon: "Microscope",
      },
      { title: "Tickets", href: "/tickets", icon: "Ticket" },
      { title: "Profile", href: "/patient/profile", icon: "User" },
    ],
  },
};
