import { Component, EventEmitter, Output } from '@angular/core';
import { Appointment } from '../../../interfaces/appointment.interface';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { UserInterface } from '../../../interfaces/user.interface';
import { FormsModule } from '@angular/forms';
import { PatientHistoryService } from '../../../services/patient-history.service';
import { FormatPatientHistoryDataPipe } from '../../../pipes/format-patient-history-data.pipe';

import { animate, style, transition, trigger } from '@angular/animations';
import { SectionTitleDirective } from '../../../directives/section-title.directive';
import { HighlightStatusDirective } from '../../../directives/highlight-status.directive';
@Component({
  selector: 'app-appointment-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgxSpinnerModule,
    FormsModule,
    FormatPatientHistoryDataPipe,
    SectionTitleDirective,
    HighlightStatusDirective,
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
    const currentUserEmail = this.authService.getCurrentUserEmail();

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
      this.filteredAppointments = [...this.appointments];
    } else {
      const filter = this.filterValue.trim().toLowerCase();
      this.filteredAppointments = this.appointments.filter((appointment) => {
        let concatenatedValues = `
          ${appointment.date} 
          ${appointment.day} 
          ${appointment.start_time} 
          ${appointment.end_time} 
          ${appointment.specialty} 
          ${appointment.professional_name} 
          ${appointment.patient_name} 
          ${appointment.status} 
          ${
            appointment.patientHistory?.height
              ? appointment.patientHistory.height.toString()
              : ''
          } 
          ${
            appointment.patientHistory?.weight
              ? appointment.patientHistory.weight.toString()
              : ''
          } 
          ${
            appointment.patientHistory?.temperature
              ? appointment.patientHistory.temperature.toString()
              : ''
          } 
          ${
            appointment.patientHistory?.pressure
              ? appointment.patientHistory.pressure.toString()
              : ''
          }
        `.toLowerCase();

        if (appointment.patientHistory?.extraData) {
          const extraDataKeys = Object.keys(
            appointment.patientHistory.extraData
          );
          extraDataKeys.forEach((key) => {
            const value = appointment.patientHistory?.extraData?.[key];
            if (value) {
              concatenatedValues += `${key}: ${value}`.toLowerCase();
            }
          });
        }

        return concatenatedValues.includes(filter);
      });

      if (
        this.auxItemSelected?.id &&
        !this.filteredAppointments.some(
          (item) => item.id === this.auxItemSelected?.id
        )
      ) {
        this.auxItemSelected = undefined;
        this.itemSelected.emit(undefined);
      }
    }
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
