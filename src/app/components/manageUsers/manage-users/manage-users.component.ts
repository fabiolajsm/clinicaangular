import { Component } from '@angular/core';
import { UsersTableComponent } from '../users-table/users-table.component';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { UserInterface } from '../../../interfaces/user.interface';
import { RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../interfaces/appointment.interface';

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
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    this.spinner.show();
    this.appointmentService.getAppointments().subscribe((response) => {
      this.appointments = response.filter(
        (item) => item.status === 'REALIZADO'
      );
    });
    this.spinner.hide();
  }

  handleItemSelected(user: any) {
    this.userSelected = user;
  }
}
