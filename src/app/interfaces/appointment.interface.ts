export type Status =
  | 'CANCELADO'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'REALIZADO'
  | 'PENDIENTE';

export type AppointmentActions =
  | Status
  | 'VER_REVIEW_PROFESIONAL'
  | 'COMPLETAR_CUESTIONARIO'
  | 'CALIFICAR'
  | 'VER_REVIEW_PACIENTE'
  | 'VER_MI_COMENTARIO_DIAGNOSTICO'
  | 'VER_CUESTIONARIO'
  | 'VER_REVIEW_PROFESIONAL_PACIENTE';
export interface Appointment {
  id?: string | undefined;
  day: string;
  date: string; // format: "yyyy-MM-dd"
  start_time: string;
  end_time: string;
  specialty: string;
  professional_id: string;
  professional_name: string;
  patient_id: string;
  patient_name: string;
  status: Status;
  patientHistory?: PatientHistory;
}

export interface Appointment_Extra_Info {
  comment: string | undefined;
  diagnosis: string | undefined;
  points: number | undefined; // del 1 al 10
  quality: number | undefined;
  facilitiesAndConditions: number | undefined;
  waitTime: number | undefined;
  securityAndPrivacy: number | undefined;
}
export interface PatientHistory {
  id_patient: string;
  id_appointment: string;
  height: number;
  weight: number;
  temperature: number;
  pressure: number;
  extraData: { [key: string]: string } | undefined;
}
