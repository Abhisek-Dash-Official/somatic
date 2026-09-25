import mongoose, { Document } from "mongoose";

export interface IMedicine {
  name: string;
  brand: string;
  manufacturer: string;
  category: string;
  description: string;
  pricing: {
    mrp: number;
    sale_price: number;
    currency: string;
  };
  stock: number;
  sku: string;
  composition: string[];
  dosage_form: string;
  packaging: string;
  requires_prescription: boolean;
  indications: string[];
  side_effects: string[];
  precautions: string;
  how_to_use: string;
  images: string[];
  tags: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IDoctorInfo {
  reg_no?: string;
  qualification?: string;
  experience?: number;
  department_id?: string | any;
  is_accepting_cases?: boolean;
}

export interface IPatientInfo {
  blood_grp?: string;
  known_allergies?: string[];
  chronic_diseases?: string[];
}

export interface IUserInsurance {
  type?: "somatic" | "external";
  provider_name?: string;
  policy_number?: string;
  policy_holder_name?: string;
}

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password_hash: string;
  avatar_id?: string;
  contact_no?: string;
  date_of_birth?: Date;
  weight_kg?: number;
  address?: string;
  role: "admin" | "doctor" | "assistant_doctor" | "patient" | "dispatcher";
  doctor_info?: IDoctorInfo;
  patient_info?: IPatientInfo;
  insurance?: IUserInsurance;
  is_delete: boolean;
  is_ban: boolean;
  created_at?: Date | string;
}

export interface IAiModelConfig {
  current_model: string;
  daily_token_threshold_alert?: number;
  system_prompt?: string;
}

export interface ISystemSetting {
  _id?: string;
  maintenance_mode: boolean;
  allow_new_signups: boolean;
  ai_model_config: IAiModelConfig;
  updated_by?: string | any;
  updated_at?: Date | string;
}

export interface ISystemLog {
  _id?: string;
  timestamp?: Date | string;
  actor_id?: string | any;
  actor_role?:
    | "admin"
    | "doctor"
    | "assistant_doctor"
    | "patient"
    | "dispatcher";
  action_type?: string;
  target_id?: string | any;
  details?: any;
  created_at?: Date | string;
}

export interface IFeedback {
  _id?: string;
  reported_by_user_id: string | any;
  ticket_type?: string;
  message?: string;
  status: "Open" | "Resolved";
  created_at?: Date | string;
}

export interface IDepartment {
  _id?: string;
  name: string;
  desc?: string;
  head_doctor_id?: string | any;
  is_active: boolean;
  created_at?: Date | string;
}

export interface IPatientInputAttachment {
  file_url?: string;
  file_type?: string;
}

export interface IPatientInput {
  age?: number;
  weight_kg?: number;
  symptoms_raw_text?: string;
  attachments?: IPatientInputAttachment[];
  preferred_prescription_language?: string;
}

export interface IAiDraft {
  translated_symptoms?: string;
  is_emergency?: boolean;
  chief_complaints?: string[];
  suggested_medicines?: string[];
  ayurvedic_hints?: string;
  translated_ayurvedic_hints?: string;
  ai_summary_and_advice?: string;
  translated_ai_summary_and_advice?: string;
}

export interface IDoctorFinalPrescription {
  medicines?: string[];
  instructions?: string;
  translated_instructions?: string;
  next_follow_up?: Date | string | null;
}

export interface IAmbulanceDispatch {
  required?: boolean;

  status?:
    | "not_needed"
    | "pending"
    | "contacting_patient"
    | "hospital_selected"
    | "dispatched"
    | "arrived"
    | "cancelled";

  patient_location?: {
    type: "Point";
    coordinates: [number, number];
    address: string;
  };

  receiving_hospital?: {
    hospital_id: mongoose.Types.ObjectId;
    name: string;
    address: string;
  };

  hospital_confirmation?: {
    confirmed: boolean;
    confirmed_at?: Date;
  };

  ambulance_service?: {
    name?: string;
    contact_no?: string;
    vehicle_no?: string;
  };

  dispatcher_id?: mongoose.Types.ObjectId;

  requested_at?: Date;
  dispatched_at?: Date;
  arrived_at?: Date;
  cancelled_at?: Date;
  cancellation_reason?: string;
}

export interface IConsultation {
  _id?: string;
  patient_id: string | any;
  assigned_department_id?: string | any;
  claimed_by_doctor_id?: string | any;
  status?: "pending_review" | "in_review" | "completed";
  patient_input?: IPatientInput;
  ai_draft?: IAiDraft;
  doctor_final_prescription?: IDoctorFinalPrescription;
  ambulance_dispatch?: IAmbulanceDispatch;
  resolved_at?: Date | string;
  created_at?: Date | string;
}

export interface IBloodInventory {
  blood_group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  stock_units: number; // 1 unit = ~450ml
  price_per_unit: number;
  last_updated: Date | string;
}

export interface IBloodBank {
  _id?: string;
  name: string;
  hospital_affiliation?: string;
  images?: string[];
  license_no: string;
  contact_no: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  inventory: IBloodInventory[];
  is_delivery_available: boolean;
  is_active: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface IOrderItem {
  item_type: "Medicine" | "BloodBank";
  item_id: string | any; // Reference to Medicine or BloodBank ID
  blood_group?: string; // Only required if item_type is "BloodBank"
  quantity: number;
  unit_price: number;
}

export interface IOrder {
  _id?: string;
  user_id: string | any;
  items: IOrderItem[];
  total_amount: number;
  payment_method: "COD" | "ONLINE";
  payment_status: "pending" | "paid" | "failed";
  order_status:
    | "placed"
    | "confirmed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  shipping_address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  placed_at?: Date | string;
  updated_at?: Date | string;
}

export interface ICartItem {
  item_type: "medicine" | "blood";
  item_id: string | any;
  blood_group?: string;
  quantity: number;
}

export interface ICart {
  _id?: string;
  user_id: string | any;
  items: ICartItem[];
  total_amount: number;
  updated_at?: Date | string;
}

export interface IHospital extends Document {
  name: string;
  qr_identifier: string;
  paperwork_endpoint: string;

  auth_config?: {
    type?: "none" | "api_key" | "bearer" | "basic";
    api_key?: string;
    api_key_header?: string;
    token?: string;
    username?: string;
    password?: string;
  };

  contact: {
    phone: string;
    emergency_phone?: string;
    email?: string;
  };

  address: string;

  location: {
    type: "Point";
    coordinates: [number, number];
  };

  has_ambulance: boolean;

  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IInsurancePolicy extends Document {
  _id: any;

  user_id: mongoose.Types.ObjectId;
  plan_id: mongoose.Types.ObjectId;

  policy_number: string;

  insured_members?: {
    name: string;
    relationship: string;
    date_of_birth?: Date;
  }[];

  start_date: Date;
  expiry_date: Date;

  status: "pending" | "active" | "expired" | "cancelled";

  documents?: {
    type: "policy" | "id_proof" | "medical" | "other";
    file_url: string;
    uploaded_at: Date;
  }[];

  created_at: Date;
  updated_at: Date;
}

export interface IInsuranceClaim extends Document {
  _id: any;

  user_id: mongoose.Types.ObjectId;
  policy_id: mongoose.Types.ObjectId;

  hospital_id?: mongoose.Types.ObjectId;

  claim_number?: string;

  claim_type: "cashless" | "reimbursement";

  incident_type?: "accident" | "illness" | "emergency" | "other";

  incident_date?: Date;
  treatment_date?: Date;
  admission_date?: Date;
  discharge_date?: Date;

  estimated_amount?: number;
  claimed_amount?: number;
  approved_amount?: number;

  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "documents_required"
    | "approved"
    | "partially_approved"
    | "rejected"
    | "settled";

  rejection_reason?: string;

  documents?: {
    type:
      | "claim_form"
      | "hospital_bill"
      | "discharge_summary"
      | "prescription"
      | "lab_report"
      | "medical_record"
      | "id_proof"
      | "other";
    file_url: string;
    uploaded_at: Date;
  }[];

  created_at: Date;
  updated_at: Date;
}

export interface IInsurancePlan extends Document {
  _id: any;

  name: string;
  description?: string;

  coverage_amount: number;
  premium_amount: number;

  premium_frequency: "monthly" | "quarterly" | "half_yearly" | "yearly";

  features?: string[];

  is_active: boolean;

  created_at: Date;
  updated_at: Date;
}
