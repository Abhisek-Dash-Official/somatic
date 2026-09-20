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

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password_hash: string;
  avatar_id?: string;
  contact_no?: string;
  address?: string;
  role: "admin" | "doctor" | "assistant_doctor" | "patient" | "dispatcher";
  doctor_info?: IDoctorInfo;
  patient_info?: IPatientInfo;
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
  status?: "not_needed" | "pending" | "dispatched" | "arrived";
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
  patient_id: string | any;
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
