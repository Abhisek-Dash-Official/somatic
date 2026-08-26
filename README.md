<div align="center">
  <img src="./web/public/android-chrome-192x192.png" alt="Somatic Logo" />
  
  # Somatic

  <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white" alt="FastAPI" />
</div>

<br/>

> **Intelligent Clinical Case-Taking Platform for Ayurvedic Practitioners**  
> Built for Ministry of Ayush (SIH260470)

A smart patient case-taking platform that helps Ayush healthcare professionals record, organize, and manage patient information efficiently. Somatic simplifies clinical documentation and makes Rog Pariksha (case-taking) faster and more structured using Artificial Intelligence.

## Key Features

- **Role-Based Access Control:** Dedicated, secure workflows for Patients, Doctors, and Administrators.
- **AI-Powered Case Drafting:** Automates the creation of clinical drafts (Dosha analysis, symptom mapping) using the Gemini API based on patient input.
- **Dynamic Department Routing:** Automatically routes patient cases to the appropriate hospital department (e.g., Panchakarma, Shalya Tantra).
- **Clinical Review System:** Allows doctors to review, edit, and approve AI-generated drafts before finalizing prescriptions.
- **Export & Documentation:** One-click generation of PDF prescriptions for patients using HTML-to-Canvas rendering.
- **System Analytics & Logs:** Admin dashboard to monitor AI token usage, system performance, and user feedback.

## Tech Stack

**Frontend Architecture (Next.js App Router)**

- Framework: Next.js 16
- UI & Styling: Tailwind CSS, Lucide React
- State Management: Zustand
- Form Handling & Validation: React Hook Form, Zod
- Authentication: NextAuth.js
- HTTP Client: Axios
- Utilities: jsPDF, HTML2Canvas, React Toastify

**Backend & Database**

- Database: MongoDB (with Mongoose ORM)
- AI Microservice: Python, FastAPI (Integrated separately)

## Screenshots & UI Previews

We maintain a comprehensive visual log of the application's interface and dashboards.
Please refer to our visual documentation here: **[View Application Screenshots](./docs/screenshots.md)**

## Architecture & Documentation

We maintain detailed documentation for our architecture, database schemas, and API endpoints:

- [Database Architecture & Mind Map](./docs/assets/db-mindmap.pdf)
- [Application Flowchart](./docs/assets/flowchart.pdf)
- [API Endpoints & Payloads](./docs/api-endpoints.md)

_(Note: Ensure the architecture visuals are present in the `docs` and `docs/assets` directories.)_

## Getting Started

This project uses a monorepo structure, separating the Next.js frontend from the Python/FastAPI microservice.

### Prerequisites

- Node.js (v20+)
- MongoDB Instance
- Python (3.10+)

### 1. Clone the Repository

```bash
git clone [https://github.com/Abhisek-Dash-Official/somatic.git](https://github.com/Abhisek-Dash-Official/somatic.git)
cd somatic
```

### 2. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```

_The frontend will run on http://localhost:3000_

### 3. Start the AI Backend (Python/FastAPI)

```bash
cd pyBackend
# Activate your virtual environment
# Install requirements
# Run the FastAPI server
uvicorn main:app --reload
```

_The API will run on http://localhost:8000_

---

**Developed for Smart India Hackathon**
