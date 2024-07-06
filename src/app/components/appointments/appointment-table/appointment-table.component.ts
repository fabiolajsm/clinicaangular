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
import { PatientHistoryService } from '../../../services/patient-history.service';
import { FormatPatientHistoryDataPipe } from '../../../pipes/format-patient-history-data.pipe';

import { animate, style, transition, trigger } from '@angular/animations';
@Component({
  selector: 'app-appointment-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgxSpinnerModule,
    FormsModule,
    FormatPatientHistoryDataPipe,
  ],
  templateUrl: './appointment-table.component.html',
  styleUrl: './appointment-table.component.scss',
  animations: [
    trigger('slideInFromBottom', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('0.5s ease-out', style({ transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class AppointmentTableComponent {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  currentUserRole: string = '';
  users: UserInterface[] = [];

  filterValue: string = ''; // value to serach
  auxItemSelected: Appointment | undefined;

  @Output() public itemSelected: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private patientHistoryService: PatientHistoryService,
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
        this.appointments.forEach((element) => {
          if (element.status === 'REALIZADO' && element.id) {
            this.patientHistoryService
              .getPatientHistoryByAppointment(element.patient_id, element.id)
              .subscribe((res) => {
                element.patientHistory = res;
              });
          }
        });
        this.filteredAppointments = [...this.appointments];
        this.spinner.hide();
      });
    });
  }

  cleanFilters() {
    this.filteredAppointments = [...this.appointments];
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

  // filters
  applyFilter() {
    if (!this.filterValue.trim()) {
      this.filteredAppointments = this.appointments;
    } else {
      const filter = this.filterValue.trim().toLowerCase();
      this.filteredAppointments = this.appointments.filter((appointment) => {
        return (
          appointment.date.toLowerCase().includes(filter) ||
          appointment.day.toLowerCase().includes(filter) ||
          appointment.start_time.toLowerCase().includes(filter) ||
          appointment.end_time.toLowerCase().includes(filter) ||
          appointment.specialty.toLowerCase().includes(filter) ||
          (this.currentUserRole !== 'ADMIN' &&
            appointment.patientHistory?.height.toString().includes(filter)) ||
          (this.currentUserRole !== 'ADMIN' &&
            appointment.patientHistory?.weight.toString().includes(filter)) ||
          (this.currentUserRole !== 'ADMIN' &&
            appointment.patientHistory?.temperature
              .toString()
              .includes(filter)) ||
          (this.currentUserRole !== 'ADMIN' &&
            appointment.patientHistory?.pressure.toString().includes(filter)) ||
          ((this.currentUserRole === 'PACIENTE' ||
            this.currentUserRole === 'ADMIN') &&
            appointment.professional_name.toLowerCase().includes(filter)) ||
          ((this.currentUserRole === 'ESPECIALISTA' ||
            this.currentUserRole === 'ADMIN') &&
            appointment.patient_name.toLowerCase().includes(filter)) ||
          appointment.status.toLowerCase().includes(filter)
        );
      });
      if (
        this.auxItemSelected?.id &&
        !this.filteredAppointments.some(
          (item) => item?.id === this.auxItemSelected?.id
        )
      ) {
        this.auxItemSelected = undefined;
        this.itemSelected.emit(undefined);
      }
    }
  }
}
