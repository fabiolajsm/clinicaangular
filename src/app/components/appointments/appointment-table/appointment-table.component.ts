import { Component, EventEmitter, Output } from '@angular/core';
import { Appointment } from '../../../interfaces/appointment.interface';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { UserInterface } from '../../../interfaces/user.interface';
import { getAuth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointment-table',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSpinnerModule, FormsModule],
  templateUrl: './appointment-table.component.html',
  styleUrl: './appointment-table.component.scss',
})
export class AppointmentTableComponent {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  currentUserRole: string = '';
  users: UserInterface[] = [];

  selectedFilterOption: string = ''; // value type (day, time, specialty, etc.)
  filterValue: string = ''; // value to serach
  auxItemSelected: Appointment | undefined;

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
    const currentUserEmail = getAuth().currentUser?.email;

    this.authService.getUsers().subscribe((response) => {
      this.users = response;
      const currentUser = this.users.find(
        (item) => item.email === currentUserEmail
      );
      this.appointmentService.getAppointments().subscribe((response) => {
        this.appointments = response
          .filter((item) => {
            if (!currentUserEmail || currentUser?.role === 'ADMIN') return true;
            return (
              item.patient_id === currentUser?.id ||
              item.professional_id == currentUser?.id
            );
          })
          .sort((a, b) => {
            if ((a as Appointment).status < (b as Appointment).status) {
              return -1;
            }
            if ((a as Appointment).status > (b as Appointment).status) {
              return 1;
            }
            return 0;
          });

        // at first we show all the appointments without filters
        this.filteredAppointments = [...this.appointments];
        this.spinner.hide();
      });
    });
  }

  applyFilter() {
    if (!this.selectedFilterOption || !this.filterValue) {
      this.filteredAppointments = [...this.appointments];
      return;
    }

    this.filterValue = this.filterValue.trim();
    switch (this.selectedFilterOption) {
      case 'day':
        this.filteredAppointments = this.appointments.filter((item) =>
          item.day.toLowerCase().includes(this.filterValue.toLowerCase())
        );
        break;
      case 'time':
        this.filteredAppointments = this.appointments.filter((item) =>
          item.start_time.toLowerCase().includes(this.filterValue.toLowerCase())
        );
        break;
      case 'specialty':
        this.filteredAppointments = this.appointments.filter((item) =>
          item.specialty.toLowerCase().includes(this.filterValue.toLowerCase())
        );
        break;
      case 'patient':
        this.filteredAppointments = this.appointments.filter((item) =>
          item.patient_name
            .toLowerCase()
            .includes(this.filterValue.toLowerCase())
        );
        break;
      case 'professional':
        this.filteredAppointments = this.appointments.filter((item) =>
          item.professional_name
            .toLowerCase()
            .includes(this.filterValue.toLowerCase())
        );
        break;
      case 'status':
        this.filteredAppointments = this.appointments.filter((item) =>
          item.status.toLowerCase().includes(this.filterValue.toLowerCase())
        );
        break;
      default:
        this.filteredAppointments = [...this.appointments];
        break;
    }
    if (
      this.auxItemSelected &&
      !this.filteredAppointments.includes(this.auxItemSelected)
    ) {
      this.auxItemSelected = undefined;
      this.itemSelected.emit(undefined);
    }
  }

  cleanFilters() {
    this.filteredAppointments = [...this.appointments];
    this.selectedFilterOption = '';
    this.filterValue = '';
  }

  handleClick(id: string | undefined) {
    if (!id) return;
    const itemSelected: Appointment | undefined = this.appointments.find(
      (item) => item.id === id
    );
    if (itemSelected) {
      this.auxItemSelected = itemSelected;
      this.itemSelected.emit(itemSelected);
    }
  }

  handleBack() {
    this.router.navigate(['/']);
  }
}
