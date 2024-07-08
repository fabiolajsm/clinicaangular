import { Component } from '@angular/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import {
  Patients,
  Specialists,
  UserInterface,
} from '../../interfaces/user.interface';
import { SpecialtiesService } from '../../services/specialties.service';
import { Router } from '@angular/router';
import { Schedules, Specialties } from '../../interfaces/specialties.interface';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PatientHistoryComponent } from '../patient-history/patient-history.component';
import { PatientHistoryService } from '../../services/patient-history.service';
import {
  Appointment,
  PatientHistory,
} from '../../interfaces/appointment.interface';
import { animate, style, transition, trigger } from '@angular/animations';
import { AppointmentService } from '../../services/appointment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    PatientHistoryComponent,
  ],
  templateUrl: './my-profile.component.html',
  animations: [
    trigger('slideInFromBottom', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('0.5s ease-out', style({ transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class MyProfileComponent {
  user: UserInterface | Patients | Specialists | undefined = undefined;
  email: string | null | undefined = null;
  schedules: Schedules | null = null;
  form: FormGroup;
  formDownloadHistory: FormGroup;
  appointments: Appointment[] | undefined;
  specialtiesOptions: Specialties[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private specialtiesService: SpecialtiesService,
    private spinner: NgxSpinnerService,
    private patientHistoryService: PatientHistoryService,
    private appointmentService: AppointmentService
  ) {
    this.form = new FormGroup({
      start: new FormControl('', [Validators.required]),
      end: new FormControl('', [Validators.required, this.endDateValidator]),
    });
    this.formDownloadHistory = new FormGroup({
      specialty: new FormControl('', [Validators.required]),
    });

    this.email = this.authService.getCurrentUserEmail();
    if (!this.email) return;
    this.spinner.show();
    const subGetUser = this.authService
      .getUserByEmail(this.email)
      .subscribe((currentUserData) => {
        this.user = currentUserData;
        if (this.user?.role === 'ESPECIALISTA') {
          this.specialtiesService
            .getSchedules()
            .subscribe((data: Schedules[]) => {
              this.schedules = data.filter(
                (item) => item.user_id === this.user?.id
              )[0];
            });
        }
        if (this.user?.role === 'PACIENTE' && this.user.id) {
          this.appointmentService.getAppointments().subscribe((response) => {
            this.appointments = response.filter(
              (item) =>
                item.status === 'REALIZADO' && item.patient_id === this.user?.id
            );

            if (this.appointments) {
              this.appointments.forEach((appointment) => {
                this.assignPatientHistoryToAppointments(appointment);
              });
            }
          });
        }
      });

    const getSpecialtiesSub = this.specialtiesService
      .getSpecialties()
      .subscribe((data: Specialties[]) => {
        this.specialtiesOptions = data;
        this.spinner.hide();
      });
    this.subscriptions.push(getSpecialtiesSub);
    this.subscriptions.push(subGetUser);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  ngOnChanges() {
    this.form.get('start')?.valueChanges.subscribe(() => {
      this.form.get('end')?.updateValueAndValidity();
    });
    this.form.get('end')?.valueChanges.subscribe(() => {
      this.form.get('start')?.updateValueAndValidity();
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

  endDateValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const start = control.parent?.get('start')?.value;
    const end = control.value;

    if (start && end) {
      const [startHours, startMinutes] = start.split(':').map(Number);
      const [endHours, endMinutes] = end.split(':').map(Number);

      const startTime = new Date(0, 0, 0, startHours, startMinutes);
      const endTime = new Date(0, 0, 0, endHours, endMinutes);

      if (endTime <= startTime) {
        return { endDateInvalid: true };
      }
    }

    return null;
  }

  handleSubmit() {
    const start = this.form.get('start')?.value;
    const end = this.form.get('end')?.value;
    if (this.form.valid && start && end && this.user?.id) {
      this.spinner.show();
      this.specialtiesService.insertOrUpdateSchedule(
        this.user?.id,
        start,
        end,
        this.schedules?.id ?? null
      );
      this.form.reset();
      this.spinner.hide();
    }
  }

  getHeader(): string {
    switch (this.user?.role) {
      case 'PACIENTE':
        return `Obra social`;
      case 'ESPECIALISTA':
        return `Especialidades`;
      default:
        return '';
    }
  }
  getData(): string {
    switch (this.user?.role) {
      case 'PACIENTE':
        return `${(this.user as Patients).healthInsurance}`;
      case 'ESPECIALISTA':
        return `${(this.user as Specialists).specialties.join(', ')}`;
      default:
        return '';
    }
  }
  getSecondProfilePicture(): string {
    return (this.user as Patients).secondProfilePicture;
  }

  handleBack() {
    this.router.navigate(['/']);
  }

  handleDownloadHistory() {
    if (this.formDownloadHistory.valid) {
      const specialty = this.formDownloadHistory.get('specialty')?.value;
      const appointmentsBySpecialty = this.appointments?.filter(
        (item) => item.specialty === specialty
      );
      if (!this.user?.name || !this.user?.lastname || !appointmentsBySpecialty)
        return;
      this.patientHistoryService.downloadPatientHistory(
        this.user?.name,
        this.user?.lastname,
        specialty,
        appointmentsBySpecialty
      );
    }
  }
}
