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
  patient: string;
  status: Status;
}
