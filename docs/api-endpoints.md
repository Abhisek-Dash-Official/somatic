# API Endpoints Documentation

This document outlines the available REST API endpoints across the Somatic platform, detailing their expected payloads, query parameters, and access control requirements.

---

## 1. Admin API Routes

### Dashboard

- **`GET /api/admin/dashboard`**
  - **Description:** Retrieves aggregate metrics for the admin dashboard, including department stats, user counts, consultation statuses, AI metrics, and recent system logs.
  - **Access:** Admin only.

### Departments

- **`GET /api/admin/departments`**
  - **Description:** Fetches a paginated list of departments, populated with head doctor details.
  - **Query Params:** `page` (default: 1), `limit` (default: 10)
  - **Access:** Admin only.
- **`POST /api/admin/departments`**
  - **Description:** Creates a new department.
  - **Payload:**
    ```json
    {
      "name": "string (required)",
      "desc": "string (optional)",
      "head_doctor_id": "string (ObjectId, optional)",
      "is_active": "boolean (default: true)"
    }
    ```
  - **Access:** Admin only.
- **`PUT /api/admin/departments`**
  - **Description:** Updates an existing department.
  - **Payload:**
    ```json
    {
      "id": "string (ObjectId, required)",
      "name": "string (optional)",
      "desc": "string (optional)",
      "head_doctor_id": "string (ObjectId, optional)",
      "is_active": "boolean (optional)"
    }
    ```
  - **Access:** Admin only.

### Department Doctors

- **`GET /api/admin/departments/doctors`**
  - **Description:** Fetches doctors assigned to a specific department and a list of unassigned doctors.
  - **Query Params:** `departmentId`
  - **Access:** Admin only.
- **`PATCH /api/admin/departments/doctors`**
  - **Description:** Assigns or removes a doctor from a department.
  - **Payload:**
    ```json
    {
      "doctorId": "string (ObjectId, required)",
      "departmentId": "string (ObjectId, required if action is ASSIGN)",
      "action": "ASSIGN | REMOVE"
    }
    ```
  - **Access:** Admin only.

### Users

- **`GET /api/admin/users`**
  - **Description:** Fetches a paginated, filterable, and sortable list of users.
  - **Query Params:** `role`, `page`, `limit`, `search`, `status`, `sortBy`, `sortOrder`, `bloodGroup`, `departmentId`, `acceptingCases`.
  - **Access:** Admin only.
- **`POST /api/admin/users`**
  - **Description:** Creates a new user account manually.
  - **Payload:**
    ```json
    {
      "username": "string (required)",
      "email": "string (required)",
      "password": "string (required)",
      "role": "admin | doctor | patient (required)",
      "contact_no": "string (optional)",
      "address": "string (optional)",
      "avatar_id": "string (optional)",
      "doctor_info": {
        "reg_no": "string",
        "qualification": "string",
        "experience": "number"
      },
      "patient_info": {
        "blood_grp": "string"
      }
    }
    ```
  - **Access:** Admin only.
- **`PATCH /api/admin/users`**
  - **Description:** Updates a user's role, ban status, or soft-delete status. Prevents self-action.
  - **Payload:**
    ```json
    {
      "userId": "string (ObjectId, required)",
      "action": "ROLE | BAN | DELETE (required)",
      "value": "string (for role) | boolean (for ban/delete)"
    }
    ```
  - **Access:** Admin only.

### Admin Profile

- **`GET /api/admin/profile`**
  - **Description:** Fetches the admin's profile data and total actions logged.
  - **Access:** Admin only.
- **`PUT /api/admin/profile`**
  - **Description:** Updates the admin's profile information.
  - **Payload:**
    ```json
    {
      "username": "string (optional)",
      "password": "string (optional)",
      "contact_no": "string (optional)",
      "address": "string (optional)",
      "avatar_id": "string (optional)"
    }
    ```
  - **Access:** Admin only.

### System & Settings

- **`GET /api/admin/settings`**
  - **Description:** Retrieves global system settings.
  - **Access:** Admin only.
- **`PUT /api/admin/settings`**
  - **Description:** Updates global system settings.
  - **Payload:**
    ```json
    {
      "maintenance_mode": "boolean (optional)",
      "allow_new_signups": "boolean (optional)",
      "current_model": "string (optional)",
      "system_prompt": "string (optional)"
    }
    ```
  - **Access:** Admin only.
- **`GET /api/admin/logs`**
  - **Description:** Retrieves paginated system audit logs.
  - **Query Params:** `page` (default: 1), `limit` (default: 15)
  - **Access:** Admin only.

### Tickets (Feedback)

- **`GET /api/admin/tickets`**
  - **Description:** Retrieves all user feedback/support tickets.
  - **Access:** Admin only.
- **`PATCH /api/admin/tickets`**
  - **Description:** Updates the status of a specific ticket.
  - **Payload:**
    ```json
    {
      "ticketId": "string (ObjectId, required)",
      "status": "Open | Resolved (required)"
    }
    ```
  - **Access:** Admin only.

---

## 2. Doctor API Routes

### Dashboard

- **`GET /api/doctor/dashboard`**
  - **Description:** Retrieves metrics, active case data, and availability status for the doctor's dashboard.
  - **Access:** Doctor only.

### Consultations

- **`GET /api/doctor/consultations`**
  - **Description:** Fetches paginated pending cases in the doctor's department or cases claimed by the doctor.
  - **Query Params:** `page` (default: 1), `limit` (default: 10)
  - **Access:** Doctor only.
- **`GET /api/doctor/consultations/[id]`**
  - **Description:** Retrieves full details of a specific consultation.
  - **Access:** Doctor only (restricted to own department or claimed cases).
- **`PATCH /api/doctor/consultations/[id]`**
  - **Description:** Perform workflow actions on a consultation.
  - **Payload:**
    ```json
    {
      "action": "claim | release | complete",
      "ai_draft": "object (required if action is complete)",
      "doctor_final_prescription": "object (required if action is complete)"
    }
    ```
  - **Access:** Doctor only.
- **`GET /api/doctor/consultations/export`**
  - **Description:** Exports the doctor's consultation history and associated system audit logs.
  - **Access:** Doctor only.

---

## 3. Patient API Routes

### Dashboard

- **`GET /api/patient/dashboard`**
  - **Description:** Retrieves recent consultations, recent feedback, overall stats, and next follow-up date for the patient dashboard.
  - **Access:** Patient only.

### Consultations

- **`POST /api/patient/consultations`**
  - **Description:** Submits new symptoms, communicates with the AI backend for analysis, and creates a pending consultation.
  - **Payload:**
    ```json
    {
      "age": "number (required)",
      "weight_kg": "number (required)",
      "symptoms_raw_text": "string (required)",
      "preferred_prescription_language": "string (optional)",
      "attachments": ["array of strings (optional)"]
    }
    ```
  - **Access:** Patient only.

---

## 4. Shared User Profile & Utilities

### Profile

- **`GET /api/users/me`**
  - **Description:** Fetches basic session and user information for the currently authenticated user.
  - **Access:** Authenticated users.
- **`PATCH /api/users/profile`**
  - **Description:** Updates the user's personal profile data, role-specific information, and password.
  - **Payload:**
    ```json
    {
      "username": "string (optional)",
      "contact_no": "string (optional)",
      "address": "string (optional)",
      "avatar_id": "string (optional)",
      "doctor_info": "object (optional, for doctors)",
      "patient_info": "object (optional, for patients)",
      "currentPassword": "string (required if changing password)",
      "newPassword": "string (optional)"
    }
    ```
  - **Access:** Authenticated users.

### Feedback

- **`GET /api/users/feedback`**
  - **Description:** Retrieves all feedback tickets submitted by the authenticated user.
  - **Access:** Authenticated users.
- **`POST /api/users/feedback`**
  - **Description:** Submits a new feedback or support ticket.
  - **Payload:**
    ```json
    {
      "ticket_type": "string (optional, default: 'General Support')",
      "message": "string (required)"
    }
    ```
  - **Access:** Authenticated users.

---

## 5. Authentication

- **`POST /api/auth/signup`**
  - **Description:** Registers a new patient user on the platform.
  - **Payload:**
    ```json
    {
      "username": "string (required)",
      "email": "string (required)",
      "password": "string (required)",
      "contact_no": "string (required)",
      "address": "string (optional)",
      "patient_info": "object (optional)"
    }
    ```
  - **Access:** Public (subject to system settings allowing new signups).
- **`ALL /api/auth/[...nextauth]`**
  - **Description:** NextAuth.js authentication handlers (Login, Logout, Session management).
  - **Access:** Public.
