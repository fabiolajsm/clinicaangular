export type Role = 'PACIENTE' | 'ESPECIALISTA' | 'ADMIN';
export interface UserInterface {
  id?: string | undefined;
  email: string;
  password?: string;
  dni: number;
  age: number;
  name: string;
  lastname: string;
  role: Role;
  profilePicture: string;
}

export interface Patients extends UserInterface {
  healthInsurance: string;
  secondProfilePicture: string;
}

export interface Specialists extends UserInterface {
  specialties: string[];
  profileEnabled: boolean;
}

export type LoginHistory = {
  email: string;
  date: Date;
};
