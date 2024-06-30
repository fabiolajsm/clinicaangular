export type Status =
  | 'CANCELADO'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'REALIZADO'
  | 'PENDIENTE';
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
}
