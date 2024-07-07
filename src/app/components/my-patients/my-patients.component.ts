import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Patients, UserInterface } from '../../interfaces/user.interface';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../interfaces/appointment.interface';
import { AppointmentService } from '../../services/appointment.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { PatientHistoryComponent } from '../patient-history/patient-history.component';
import { PatientHistoryService } from '../../services/patient-history.service';
import { SectionTitleDirective } from '../../directives/section-title.directive';

@Component({
  selector: 'app-my-patients',
  standalone: true,
  imports: [
    CommonModule,
    NgxSpinnerModule,
    PatientHistoryComponent,
    SectionTitleDirective,
  ],
  templateUrl: './my-patients.component.html',
  styleUrl: './my-patients.component.scss',
})
export class MyPatientsComponent {
  patients: Patients[] = [];
  patientsWithAppointments: Patients[] = [];
  appointments: Appointment[] = [];
  patientIdSelected: string = '';

  specialistId: string | undefined;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private patientHistoryService: PatientHistoryService
  ) {}

  ngOnInit(): void {
    const currentUserEmail = this.authService.getCurrentUserEmail();
    if (currentUserEmail) {
      this.spinner.show();
      this.authService
        .getUserByEmail(currentUserEmail)
        .pipe(
          takeUntil(this.unsubscribe$),
          switchMap((response) => {
            if (response?.id) {
              this.specialistId = response.id;
              return this.authService.getUsers();
            } else {
              throw new Error('Specialist ID not found');
            }
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((users: UserInterface[]) => {
          this.patients = users.filter(
            (user) => user.role === 'PACIENTE'
          ) as Patients[];

          if (!this.patients || !this.specialistId) {
            this.spinner.hide();
            return;
          }

          this.processPatients();
          this.spinner.hide();
        });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private processPatients(): void {
    this.patients.forEach((patient) => {
      this.appointmentService
        .getAppointmentsBySpecialistAndPatient(
          this.specialistId as string,
          patient.id as string
        )
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res: Appointment[]) => {
          this.appointments = res;
          if (this.appointments.length) {
            this.appointments.forEach((item) => {
              if (
                patient.id === item.patient_id &&
                !this.patientsWithAppointments.includes(patient)
              ) {
                this.patientsWithAppointments.push(patient);
              }
            });
          }
        });
    });
  }

  private assignPatientHistoryToAppointments(
    appointmentToUpdate: Appointment
  ): void {
    if (!this.patientIdSelected || !appointmentToUpdate.id) return;

    this.spinner.show();
    this.patientHistoryService
      .getPatientHistoryByAppointment(
        this.patientIdSelected,
        appointmentToUpdate.id
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (history) => {
          appointmentToUpdate.patientHistory = history;
          this.spinner.hide();
        },
        (error) => {
          console.error('Error fetching patient history', error);
          this.spinner.hide();
        }
      );
  }

  togglePatientSelection(id: string | undefined): void {
    if (!id) return;
    this.patientIdSelected = id;
    this.appointments.forEach((item) => {
      this.assignPatientHistoryToAppointments(item);
    });
  }

  handleBack(): void {
    this.router.navigate(['/']);
  }
}
