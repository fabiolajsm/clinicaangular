import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Patients, UserInterface } from '../../interfaces/user.interface';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../interfaces/appointment.interface';
import { AppointmentService } from '../../services/appointment.service';
import { Subscription } from 'rxjs';
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
  patientAppointments: Appointment[] = [];
  specialistId: string | undefined;
  private subscriptions: Subscription[] = [];

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
      const userByEmailSub = this.authService
        .getUserByEmail(currentUserEmail)
        .subscribe((res) => {
          if (res?.id) {
            this.specialistId = res.id;
            this.processPatients();
          }
        });
      const usersSub = this.authService.getUsers().subscribe((res) => {
        this.patients = res.filter(
          (item: UserInterface) => item.role === 'PACIENTE'
        );
        this.processPatients();
        this.spinner.hide();
      });

      this.subscriptions.push(userByEmailSub, usersSub);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private processPatients(): void {
    this.patients.forEach((patient) => {
      this.appointmentService
        .getAppointmentsBySpecialistAndPatient(
          this.specialistId as string,
          patient.id as string
        )
        .subscribe((res: Appointment[]) => {
          if (res.length > 0) {
            const existingPatient = this.patientsWithAppointments.find(
              (p) => p.id === patient.id
            );
            if (!existingPatient) {
              this.patientsWithAppointments.push(patient);
            }

            const newAppointments = res.filter((newAppointment) => {
              return !this.appointments.some(
                (existingAppointment) =>
                  existingAppointment.id === newAppointment.id
              );
            });

            this.appointments.push(...newAppointments);
          }
        });
    });
  }

  private assignPatientHistoryToAppointment(
    patientId: string | undefined,
    appointmentToUpdate: Appointment
  ): void {
    if (!patientId || !appointmentToUpdate.id) return;
    this.spinner.show();
    this.patientHistoryService
      .getPatientHistoryByAppointment(patientId, appointmentToUpdate.id)
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
    this.patientAppointments = this.appointments.filter(
      (appointment) => appointment.patient_id === id
    );
    this.patientAppointments.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.patientAppointments = this.patientAppointments.slice(0, 3);
    this.patientAppointments.forEach((appointment) => {
      this.assignPatientHistoryToAppointment(id, appointment);
    });
  }

  handleBack(): void {
    this.router.navigate(['/']);
  }
}
