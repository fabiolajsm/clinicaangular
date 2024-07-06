import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Patients, UserInterface } from '../../interfaces/user.interface';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../interfaces/appointment.interface';
import { AppointmentService } from '../../services/appointment.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { PatientHistoryComponent } from '../patient-history/patient-history.component';
import { PatientHistoryService } from '../../services/patient-history.service';

@Component({
  selector: 'app-my-patients',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule, PatientHistoryComponent],
  templateUrl: './my-patients.component.html',
  styleUrl: './my-patients.component.scss',
})
export class MyPatientsComponent {
  patients: Patients[] = [];
  patientsWithAppointments: Patients[] = [];
  appointments: Appointment[] = [];
  patientIdSelected: string = '';

  specialistId: string | undefined;
  private unsubscribe$: Subject<void> = new Subject<void>();
  private authSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private patientHistoryService: PatientHistoryService
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    const currentUserEmail = this.authService.getCurrentUserEmail();
    if (currentUserEmail) {
      this.authSubscription = this.authService
        .getUserByEmail(currentUserEmail)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((response) => {
          if (response?.id) {
            this.specialistId = response.id;
            if (!this.specialistId) return;
            this.getPatients(); // get patients by professional
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private getPatients(): void {
    this.authService
      .getUsers()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: UserInterface[]) => {
        this.patients = response.filter(
          (item) => item.role === 'PACIENTE'
        ) as Patients[];
        this.patients.forEach((patient) => {
          this.appointmentService
            .getAppointmentsBySpecialistAndPatient(
              this.specialistId as string,
              patient.id as string
            )
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((appointments: Appointment[]) => {
              if (!appointments.length) return;
              this.patientsWithAppointments.push(patient);
              this.appointments = appointments;
            });
        });
        this.spinner.hide();
      });
  }

  private assignPatientHistoryToAppointments(
    appointmentToUpdate: Appointment
  ): void {
    if (!this.patientIdSelected.length || !appointmentToUpdate.id) return;
    this.patientHistoryService
      .getPatientHistoryByAppointment(
        this.patientIdSelected,
        appointmentToUpdate.id
      )
      .subscribe((history) => {
        appointmentToUpdate.patientHistory = history;
      });
  }

  togglePatientSelection(id: string | undefined) {
    if (!id) return;
    this.patientIdSelected = id;
    this.appointments.forEach((item) =>
      this.assignPatientHistoryToAppointments(item)
    );
  }
  handleBack(): void {
    this.router.navigate(['/']);
  }
}
