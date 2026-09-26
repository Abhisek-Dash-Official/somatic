<div align="center">
  <img src="./web/public/android-chrome-512x512.png" alt="Somatic Logo" width="250" />

  <h1>SOMATIC</h1>
  <p><strong>Proudly Developed for the Smart India Hackathon</strong></p>

  <p>
    An AI-driven healthcare platform designed to reduce geographical, linguistic,
    and administrative barriers in medical care through multilingual patient
    intake, AI-assisted triage, physician review, emergency coordination,
    and digital healthcare workflows.
  </p>

  <br />

  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</div>

<br />

## Overview

SOMATIC is an AI-assisted healthcare platform designed to connect patients,
doctors, hospitals, ambulances, and emergency medical resources through a
single digital ecosystem.

The platform combines multilingual patient intake, AI-assisted triage,
human-in-the-loop medical review, emergency routing, ambulance coordination,
hospital admission workflows, and healthcare e-commerce.

The system is designed to reduce delays caused by language barriers,
manual documentation, physical queues, fragmented emergency coordination,
and limited access to healthcare professionals in remote regions.

## Problem Statement

In critical healthcare scenarios, delays between a medical emergency and
access to physician-verified care can significantly affect patient outcomes.

SOMATIC addresses three major challenges:

1. **The Pre-Hospital Knowledge Gap:** During acute emergencies such as
   high-voltage electrical shocks or venomous snake bites, patients and
   bystanders may not have immediate access to reliable first-aid guidance
   while traveling to a hospital. In rural and remote regions, the distance
   to medical facilities can further increase these delays.

2. **Administrative & Linguistic Barriers:** Traditional healthcare systems
   often rely on manual triage, admission paperwork, and communication between
   patients and doctors who may speak different regional languages. This
   administrative and linguistic overhead can consume valuable clinical time.

3. **Fragmented Emergency Logistics:** Emergency dispatch, ambulance
   coordination, patient telemetry, hospital preparation, medicines, and
   blood availability often operate independently. This can make it difficult
   for hospitals to prepare for incoming emergency patients in advance.

SOMATIC bridges these gaps through an AI-assisted, physician-approved
healthcare workflow.

The platform uses AI as an intelligent copilot to translate multilingual
patient inputs, organize medical information, draft preliminary instructions,
and assist with documentation. Through a Human-in-the-Loop architecture,
qualified medical professionals review and approve AI-generated drafts before
they are delivered to patients.

## Core Features & End-to-End Flow

### 1. Multilingual Patient Input & AI Translation

Patients can provide their symptoms through voice, text, or attached files
such as images and videos in their preferred language.

The AI processes the submitted information, translates it into English,
analyzes the available medical information, generates a preliminary draft,
suggests relevant medicines where applicable, and identifies the appropriate
hospital department.

If the system detects indicators of a potentially critical situation,
the consultation can be flagged as an SOS emergency for further review.

### 2. Smart Routing

Once a consultation is created, the system routes it to doctors associated
with the relevant department.

Because the consultation workflow is online, authorized doctors can review
cases remotely without being physically present at the patient's location.

This enables healthcare professionals from different hospitals and regions
to participate in the consultation workflow.

### 3. Zero-Queue Claim System

Available doctors can claim consultation cases directly from the dashboard.

If senior doctors are unavailable, authorized Assistant Doctors such as
pharmacists or casualty staff can participate in the defined workflow.

A dedicated Dispatcher can monitor emergency cases and intervene when
additional coordination is required.

### 4. Doctor Review Interface

After a medical professional claims a consultation, the doctor can review
the patient's submitted information and the AI-generated draft in English.

The interface provides the relevant patient information, AI-generated
summary, symptoms, emergency status, and other consultation details.

A built-in voice reader can also read the AI-generated information aloud,
allowing doctors to listen instead of reading the complete draft manually.

Patient contact information can be made available to authorized medical
professionals when direct communication is required.

### 5. Human-in-the-Loop Medical Approval

AI-generated information is treated as a draft rather than a final medical
decision.

A qualified medical professional reviews the generated information and
makes the necessary corrections before approving the final instructions.

This keeps the medical decision-making process under human supervision.

### 6. Final Delivery & Reverse Translation

After the doctor approves the final medical instructions, the system
translates the approved information into the patient's preferred language.

Patients can view the final instructions directly inside the application
or use the voice reader to listen to them.

The system can also maintain the consultation information as part of the
patient's Electronic Health Record (EHR).

### 7. Automated Hospital Admission

When a patient reaches a supported hospital, their saved QR code can be
scanned to retrieve the required patient information.

This reduces repetitive data entry and can help pre-fill relevant admission
and insurance information.

### 8. Ambulance Sync & Telemetry

When an ambulance is required, the doctor can trigger the ambulance workflow.

The Dispatcher coordinates the transport process while the system maintains
communication between the patient, ambulance, and hospital.

During transit, available patient vitals and emergency information can be
shared with the receiving hospital so that the medical team can prepare
before the patient's arrival.

### 9. Universal Medical E-Commerce

SOMATIC also includes a healthcare e-commerce module.

Patients and hospitals can use the platform to request prescribed medicines,
emergency medical supplies, rare anti-venoms, and blood units.

The platform supports a Cash-on-Delivery (COD) based dispatch workflow for
supported orders.

## Impact & Target Audience

### Patients

- **Immediate Pre-Hospital Guidance:** Receive doctor-approved first-aid
  instructions for supported emergency situations while traveling to a
  healthcare facility.

- **Remote Consultations:** Access healthcare professionals remotely without
  requiring physical travel for every consultation.

- **Multilingual Communication:** Submit symptoms using regional languages,
  voice, text, or supported media attachments and receive approved medical
  instructions in the preferred language.

- **Digital Health Records:** Maintain consultation information and approved
  medical instructions within the platform.

### Medical Professionals

- **AI-Assisted Workflow:** Reduce repetitive documentation and preliminary
  information processing through AI-assisted drafts.

- **Unified Language Interface:** Review patient information in English while
  the system handles supported language translation.

- **Remote Case Management:** Claim and manage consultation cases remotely
  through the doctor dashboard.

- **Human-in-the-Loop Review:** Maintain direct professional control over
  final medical instructions and decisions.

### Hospitals & Emergency Rooms

- **Faster Admissions:** Reduce repetitive admission and insurance data entry
  through QR-based patient information retrieval.

- **Emergency Readiness:** Receive available patient and ambulance information
  before the patient reaches the hospital.

- **Live Telemetry:** Support real-time sharing of available patient vitals
  during ambulance transit.

- **Integrated Supply Logistics:** Manage requests for medicines, emergency
  supplies, anti-venoms, and blood units through the integrated platform.

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Next.js API Routes
- Python
- FastAPI

### Database

- MongoDB
- Mongoose

### AI & Processing

- AI-assisted medical information processing
- Retrieval-Augmented Generation (RAG)
- Multilingual translation
- Voice processing
- Human-in-the-Loop medical review

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Abhisek-Dash-Official/somatic.git
cd somatic
```

### 2. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:3000
```

### 3. Start the AI Backend

Open a separate terminal and navigate to the Python backend:

```bash
cd pyBackend
```

Create and activate your virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Activate it on macOS/Linux:

```bash
source venv/bin/activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

## Environment Variables

SOMATIC uses environment variables for database connections, authentication,
API communication, AI services, and other application configuration.

The project contains separate environment configuration files for the
Next.js application and the Python/FastAPI backend.

Never commit actual `.env` files or expose API keys, database credentials,
authentication secrets, or internal service secrets in the repository.

### Web Application

Create a `.env` file inside the `web/` directory:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000

UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

PYTHON_BACKEND_URL=http://localhost:8000
INTERNAL_API_SECRET=your_internal_api_secret
```

### Python / FastAPI Backend

Create a `.env` file inside the `pyBackend/` directory:

```env
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
INTERNAL_API_SECRET=your_internal_api_secret
```

### Environment Variable Reference

| Variable                   | Location           | Purpose                                        |
| -------------------------- | ------------------ | ---------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`      | `web`, `pyBackend` | Base URL of the web application                |
| `NEXTAUTH_SECRET`          | `web`              | Secret used by NextAuth for authentication     |
| `NEXTAUTH_URL`             | `web`              | URL used by NextAuth                           |
| `MONGODB_URI`              | `web`              | MongoDB database connection string             |
| `UPSTASH_REDIS_REST_URL`   | `web`              | Upstash Redis REST endpoint                    |
| `UPSTASH_REDIS_REST_TOKEN` | `web`              | Authentication token for Upstash Redis         |
| `PYTHON_BACKEND_URL`       | `web`              | URL of the Python/FastAPI backend              |
| `INTERNAL_API_SECRET`      | `web`, `pyBackend` | Secret used for internal backend communication |
| `GROQ_API_KEY`             | `pyBackend`        | API key for Groq-based AI functionality        |

## Screenshots & UI Previews

We maintain a comprehensive visual log of the application's interfaces,
dashboards, and major workflows.

[View Application Screenshots](./docs/screenshots.md)

## Architecture & Documentation

Detailed documentation for the system architecture, database design,
application workflows, and API endpoints is available below:

- [Database Architecture & Mind Map](./docs/assets/db-mindmap.pdf)
- [Application Flowchart](./docs/assets/flowchart.pdf)
- [API Endpoints & Payloads](./docs/api-endpoints.md)

Make sure the required documentation files are present in the `docs` and
`docs/assets` directories.

## Project Structure

```text
somatic/
├── docs/
│   ├── assets/
│   │   ├── db-mindmap.pdf
│   │   ├── flowchart.pdf
│   │   └── er-diagram.pdf
│   ├── screenshots/
│   │   └── ...
│   ├── api-endpoints.md
│   ├── database-architecture.md
│   └── screenshots.md
│
├── pyBackend/
│   ├── chroma_db/
│   ├── kb/
│   ├── .env
│   ├── main.py
│   ├── prompts.py
│   ├── rag.py
│   └── requirements.txt
│
├── web/
│   ├── public/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── (dashboards)/
│   │   │   │   ├── admin/
│   │   │   │   │   ├── (shop)/
│   │   │   │   │   │   ├── bloodbanks/
│   │   │   │   │   │   ├── medicines/
│   │   │   │   │   ├── departments/
│   │   │   │   │   ├── hospitals/
│   │   │   │   │   ├── logs/
│   │   │   │   │   ├── profile/
│   │   │   │   │   ├── settings/
│   │   │   │   │   ├── tickets/
│   │   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx
│   │   │   │   │
│   │   │   │   ├── dispatcher/
│   │   │   │   │   ├── ambulance-requests/
│   │   │   │   │   ├── consultations/
│   │   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx
│   │   │   │   │
│   │   │   │   ├── doctor/
│   │   │   │   │   ├── consultations/
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx
│   │   │   │   │
│   │   │   │   ├── patient/
│   │   │   │   │   ├── consultations/
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx
│   │   │   │   │
│   │   │   │   ├── tickets/
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── (main)/
│   │   │   │   ├── about/
│   │   │   │   ├── blogs/
│   │   │   │   ├── contact/
│   │   │   │   ├── faq/
│   │   │   │   ├── features/
│   │   │   │   ├── first-aid/
│   │   │   │   ├── guidelines/
│   │   │   │   ├── privacy/
│   │   │   │   ├── services/
│   │   │   │   ├── terms/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── api/
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── shop/
│   │   │   │   ├── bloodbanks/
│   │   │   │   ├── cart/
│   │   │   │   ├── medicines/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── too-many-requests/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── error.tsx
│   │   │   ├── favicon.ico
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── not-found.tsx
│   │   │
│   │   ├── components/
│   │   ├── config/
│   │   ├── lib/
│   │   ├── models/
│   │   ├── store/
│   │   ├── types/
│   │   └── proxy.ts
│   │
│   ├── .env
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

## Key Design Principles

### Human-in-the-Loop AI

AI assists medical professionals by processing information and preparing
drafts, while qualified medical professionals remain responsible for
reviewing and approving final medical instructions.

### Multilingual Accessibility

The platform is designed to reduce language barriers by allowing patients
to communicate in supported regional languages while providing doctors with
a standardized English interface.

### Emergency-First Routing

Emergency cases can be identified and prioritized through the consultation
workflow so that critical cases can receive appropriate attention quickly.

### Unified Healthcare Ecosystem

SOMATIC brings patient consultations, doctors, hospitals, emergency
coordination, ambulance workflows, healthcare records, and medical
e-commerce into a connected platform.

## License

This project is licensed under the MIT License.

---

<div align="center">
  <strong>Developed for the Smart India Hackathon</strong>
</div>
