import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  Patients,
  Role,
  Specialists,
  UserInterface,
} from '../../../interfaces/user.interface';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../../services/auth.service';
import { RouterModule } from '@angular/router';
import { PatientHistoryComponent } from '../../patient-history/patient-history.component';
import { Appointment } from '../../../interfaces/appointment.interface';
import { PatientHistoryService } from '../../../services/patient-history.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgxSpinnerModule,
    PatientHistoryComponent,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent {
  @Input() userSelected: UserInterface | Patients | Specialists | undefined;
  @Input() appointments: Appointment[] | undefined;
  patientAppointments: Appointment[] | undefined;

  constructor(
    private authService: AuthService,
    private patientHistoryService: PatientHistoryService,
    private spinner: NgxSpinnerService
  ) {}

  handleEnableSpecialist(userId: string | undefined) {
    if (!userId) return;
    this.spinner.show();
    this.authService.changeProfileEnable(
      userId,
      !(this.userSelected as Specialists).profileEnabled
    );
    this.authService.getUsers().subscribe((response) => {
      const updatedUser = response.find(
        (user: any) => user.email === this.userSelected?.email
      );
      if (updatedUser) {
        this.userSelected = updatedUser;
      }
    });
    this.spinner.hide();
  }

  ngOnChanges() {
    if (
      this.userSelected &&
      this.userSelected.role === 'PACIENTE' &&
      this.userSelected.id &&
      this.appointments
    ) {
      this.patientAppointments = this.appointments.filter(
        (item) => item.patient_id === this.userSelected?.id
      );
      if (this.patientAppointments) {
        this.patientAppointments.forEach((appointment) => {
          this.assignPatientHistoryToAppointments(appointment);
        });
      }
    }
  }

  private assignPatientHistoryToAppointments(
    appointmentToUpdate: Appointment
  ): void {
    if (!appointmentToUpdate.patient_id || !appointmentToUpdate.id) return;
    this.patientHistoryService
      .getPatientHistoryByAppointment(
        appointmentToUpdate.patient_id,
        appointmentToUpdate.id
      )
      .subscribe((history) => {
        appointmentToUpdate.patientHistory = history;
      });
  }

  getData(role: Role): string {
    switch (role) {
      case 'PACIENTE':
        return `Obra social: ${
          (this.userSelected as Patients).healthInsurance
        }`;
      case 'ESPECIALISTA':
        return `Especialidades: ${(
          this.userSelected as Specialists
        ).specialties.join(', ')}`;
      default:
        return '';
    }
  }
  getButtonMessage(): string {
    const profileEnabled = (this.userSelected as Specialists).profileEnabled;
    return profileEnabled ? 'Deshabilitar' : 'Habilitar';
  }
}
