import { Component, EventEmitter, Output } from '@angular/core';
import { Appointment } from '../../../interfaces/appointment.interface';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { UserInterface } from '../../../interfaces/user.interface';
import { getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-appointment-table',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSpinnerModule],
  templateUrl: './appointment-table.component.html',
})
export class AppointmentTableComponent {
  appointments: Appointment[] = [];
  currentUserRole: string = '';
  users: UserInterface[] = [];

  @Output() public itemSelected: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private appointmentService: AppointmentService,

    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.currentUserRole = this.authService.getRole();
    this.authService.getUsers().subscribe((response) => {
      this.users = response;
    });
    const currentUserEmail = getAuth().currentUser?.email;
    const role = this.authService.getRole();
    this.appointmentService.getAppointments().subscribe((response) => {
      this.appointments = response
        // .filter((item) => { TODO
        //   if (!currentUserEmail || role === 'ADMIN') return true;
        //   return (
        //     item.professional === currentUserEmail ||
        //     item.patient == currentUserEmail
        //   );
        // })
        .sort((a, b) => {
          if ((a as Appointment).status < (b as Appointment).status) {
            return -1;
          }
          if ((a as Appointment).status > (b as Appointment).status) {
            return 1;
          }
          return 0;
        });
      this.spinner.hide();
    });
  }

  handleClick(id: string | undefined) {
    if (!id) return;
    const itemSelected: Appointment = this.appointments.filter(
      (item) => item.id === id
    )[0];
    this.itemSelected.emit(itemSelected);
  }
  handleBack() {
    this.router.navigate(['/']);
  }
}
