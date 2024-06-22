export type Status =
  | 'CANCELADO'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'REALIZADO'
  | 'PENDIENTE';
export interface Appoiment {
  id: string;
  day: string;
  time: string;
  speciality: string;
  professional: string;
  professional_id: string;
  patient: string;
  patient_id: string;
  status: Status;
}
