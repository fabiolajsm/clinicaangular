import { Component } from '@angular/core';
import { UsersTableComponent } from '../users-table/users-table.component';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { UserInterface } from '../../../interfaces/user.interface';
import { RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../interfaces/appointment.interface';
import { PatientHistoryService } from '../../../services/patient-history.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    UsersTableComponent,
    UserDetailComponent,
    RouterLink,
    NgxSpinnerModule,
  ],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss',
})
export class ManageUsersComponent {
  userSelected: UserInterface | undefined = undefined;
  appointments: Appointment[] | undefined;

  constructor(
    private spinner: NgxSpinnerService,
    private appointmentService: AppointmentService,
    private patientHistoryService: PatientHistoryService
  ) {}

  ngOnInit() {
    this.spinner.show();
    this.appointmentService.getAppointments().subscribe((response) => {
      this.appointments = response;
      if (this.appointments) {
        this.appointments.forEach((item) => {
          this.assignPatientHistoryToAppointments(item);
        });
      }

      this.spinner.hide();
    });
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

  handleItemSelected(user: any) {
    this.userSelected = user;
  }
}
