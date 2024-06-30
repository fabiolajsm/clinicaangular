export type Status =
  | 'CANCELADO'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'REALIZADO'
  | 'PENDIENTE';
export interface Appointment {
  id?: string | undefined;
  day: string;
  start_time: string;
  end_time: string;
  specialty: string;
  professional: string;
  patient: string;
  professional_id: string;
  status: Status;
  date: string; // format: "yyyy-MM-dd"
}
