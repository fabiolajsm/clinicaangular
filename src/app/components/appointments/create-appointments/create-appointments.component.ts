import { Component, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Patients,
  Role,
  Specialists,
  UserInterface,
} from '../../../interfaces/user.interface';
import { SpecialtiesService } from '../../../services/specialties.service';
import { AuthService } from '../../../services/auth.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import {
  ScheduleTime,
  Schedules,
  Specialties,
} from '../../../interfaces/specialties.interface';
import { Appointment } from '../../../interfaces/appointment.interface';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { StringToDatePipe } from '../../../pipes/string-to-date.pipe';
import { FormatDatePipe } from '../../../pipes/format-date.pipe';
import { NotFoundImageDirective } from '../../../directives/not-found-image.directive';
import { Subscription } from 'rxjs';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-appointments',
  standalone: true,
  providers: [StringToDatePipe, FormatDatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    MatButtonModule,
    MatStepperModule,
    NotFoundImageDirective,
    SweetAlert2Module,
  ],
  templateUrl: './create-appointments.component.html',
  styleUrl: './create-appointments.component.scss',
})
export class CreateAppointmentsComponent {
  form = this._formBuilder.group({
    patientId: ['', Validators.required],
    professional: ['', Validators.required],
    specialty: ['', Validators.required],
    day: ['', Validators.required],
    date: ['', Validators.required],
    start_time: ['', Validators.required],
    end_time: ['', Validators.required],
  });
  professionals: Specialists[] = [];
  specialtiesOptions: Specialties[] = [];
  schedules: Schedules[] | null = null;

  professionalSelected: Specialists | undefined = undefined;
  professionalSchedule: Schedules | undefined = undefined;
  professionalAppointmentAvailable: ScheduleTime | undefined = undefined;

  weekDays = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];
  availableDays: { date: Date; availableTimes: ScheduleTime[] }[] = [];
  datesTaken: Appointment[] = [];
  selectedDay: { date: Date; availableTimes: ScheduleTime[] } | undefined =
    undefined;
  selectTime: ScheduleTime | undefined = undefined;

  appointmentRequested: Appointment | undefined = undefined;
  patientName: string | undefined = undefined;
  role: Role | undefined = undefined;
  patients: Patients[] | undefined = undefined;
  private subscriptions: Subscription[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private authService: AuthService,
    private specialtiesService: SpecialtiesService,
    private appointmentService: AppointmentService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private stringToDatePipe: StringToDatePipe,
    private formatDatePipe: FormatDatePipe
  ) {}

  ngOnInit() {
    this.spinner.show();
    this.role = this.authService.getRole() as Role;

    const getSpecialtiesSub = this.specialtiesService
      .getSpecialties()
      .subscribe((data: Specialties[]) => {
        this.specialtiesOptions = data;
      });
    this.subscriptions.push(getSpecialtiesSub);

    const getSchedulesSub = this.specialtiesService
      .getSchedules()
      .subscribe((data: Schedules[]) => {
        this.schedules = data;
        this.loadProfessionals();
      });
    this.subscriptions.push(getSchedulesSub);

    if (this.role === 'ADMIN') {
      const getUsersSub = this.authService
        .getUsers()
        .subscribe((response: UserInterface[]) => {
          this.patients = response.filter(
            (item) => item.role === 'PACIENTE'
          ) as Patients[];
        });
      this.subscriptions.push(getUsersSub);
    } else {
      const email = this.authService.getCurrentUserEmail();
      if (email) {
        const getUserByEmailSub = this.authService
          .getUserByEmail(email)
          .subscribe((response) => {
            if (response?.id) {
              this.form.get('patientId')?.setValue(response?.id);
            }
            this.patientName = `${response?.name} ${response?.lastname}`;
          });
        this.subscriptions.push(getUserByEmailSub);
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  loadProfessionals() {
    if (!this.schedules) return;

    const professionals = this.authService
      .getUsers()
      .subscribe((response: UserInterface[]) => {
        this.professionals = response.filter((item) => {
          if (
            item.role === 'ESPECIALISTA' &&
            (item as Specialists).profileEnabled
          ) {
            return this.schedules?.some(
              (schedule) => schedule.user_id === item.id
            );
          }
          return false;
        }) as Specialists[];
        this.spinner.hide();
      });
    this.subscriptions.push(professionals);
  }

  resetProfesional() {
    this.form.get('professional')?.setValue(null);
    this.form.get('specialty')?.setValue(null);
    this.availableDays = [];
    this.datesTaken = [];
    this.selectedDay = undefined;
    this.selectTime = undefined;
    this.professionalSelected = undefined;
    this.professionalSchedule = undefined;
    this.professionalAppointmentAvailable = undefined;
  }

  handleSelectProfessional(email: string) {
    this.resetProfesional();

    if (!email) return;
    const itemSelected = this.professionals.find(
      (item) => item.email === email
    );
    const currentSchedule = this.schedules?.find(
      (item) => item.user_id === itemSelected?.id
    );
    if (!itemSelected?.id || !currentSchedule) return;
    this.form.get('professional')?.setValue(itemSelected?.id);
    this.professionalSelected = itemSelected;
    this.professionalSchedule = currentSchedule;

    if (this.professionalSelected.id) {
      const appSub = this.appointmentService
        .getAppointmentsBySpecialist(this.professionalSelected?.id)
        .subscribe((response) => {
          this.datesTaken = response;
          this.loadDays();
        });
      this.subscriptions.push(appSub);
    }
  }

  handleSelectSpecialty(specialty: string) {
    this.form.get('specialty')?.setValue(null);
    if (!specialty) return;
    this.form.get('specialty')?.setValue(specialty);
  }

  getSpecialtyImg(specialtyName: string): string | undefined {
    if (!this.specialtiesOptions) return undefined;
    const matchedSpecialty = this.specialtiesOptions.find(
      (opt) => opt.name === specialtyName
    );
    return matchedSpecialty?.img;
  }

  loadDays() {
    this.spinner.show();
    const today = new Date();
    let count = 0;
    while (this.availableDays.length < 15) {
      const date = new Date(today.getTime() + count * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const availableTimes = this.generateAppointmentTimes(date);
        if (availableTimes.length > 0) {
          this.availableDays.push({ date, availableTimes });
        }
      }
      count++;
    }
    this.spinner.hide();
  }

  generateAppointmentTimes(date: Date): ScheduleTime[] {
    this.spinner.show();
    if (!this.professionalSchedule) return [];
    const start = this.stringToDatePipe.transform(
      this.professionalSchedule.start_time
    );
    const end = this.stringToDatePipe.transform(
      this.professionalSchedule.end_time
    );

    const interval = 30; // Intervalo en minutos
    const appointmentTimes: ScheduleTime[] = [];
    let current = new Date(start);

    while (current < end) {
      const startTime = current.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const endTime = new Date(
        current.getTime() + interval * 60000
      ).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

      // Verificar si este intervalo está disponible
      if (!this.isTimeSlotTaken(date, startTime, endTime)) {
        appointmentTimes.push({ startTime, endTime });
      }

      current = new Date(current.getTime() + interval * 60000);
    }

    this.spinner.hide();
    return appointmentTimes;
  }

  isTimeSlotTaken(date: Date, startTime: string, endTime: string): boolean {
    const taken = this.datesTaken.some(
      (appt) =>
        appt.date === this.formatDatePipe.transform(date) &&
        appt.start_time === startTime &&
        appt.end_time === endTime &&
        (appt.status === 'PENDIENTE' || appt.status === 'ACEPTADO')
    );
    return taken;
  }

  selectDay(day: { date: Date; availableTimes: ScheduleTime[] }) {
    if (this.selectedDay !== day || !this.selectedDay) {
      this.selectTime = undefined;
      this.form.get('start_time')?.setValue(null);
      this.form.get('end_time')?.setValue(null);
      this.selectedDay = day;
      const formattedDate = this.formatDatePipe.transform(day.date);
      this.form.get('day')?.setValue(this.getWeekDay(day.date));
      this.form.get('date')?.setValue(formattedDate);
    }
  }

  getWeekDay(date: Date | undefined): string {
    if (!date) return '';
    const dayIndex = date.getDay();
    return this.weekDays[dayIndex];
  }

  handleSelectTime(start: string, end: string) {
    this.selectTime = { startTime: start, endTime: end };
    this.form.get('start_time')?.setValue(start);
    this.form.get('end_time')?.setValue(end);
  }

  handleSelectPatient(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    if (!value) return;
    const patient = this.patients?.find((item) => item.id === value);
    if (patient) {
      this.patientName = `${patient.name} ${patient.lastname}`;
    }
  }

  handleResetFlags() {
    // Clean other states
    this.professionalSelected = undefined;
    this.professionalSchedule = undefined;
    this.professionalAppointmentAvailable = undefined;
    this.availableDays = [];
    this.datesTaken = [];
    this.selectedDay = undefined;
    this.selectTime = undefined;
    this.appointmentRequested = undefined;
  }

  handleBack() {
    this.router.navigate([this.role === 'ADMIN' ? '/appointment' : '/']);
    this.handleResetFlags();
    this.form.reset();
  }

  handleSubmit() {
    if (!this.form.valid) return;
    const patient = this.form.get('patientId')?.value;
    if (patient && this.patientName) {
      const requestData: Appointment = {
        day: this.form.get('day')?.value ?? '',
        start_time: this.form.get('start_time')?.value ?? '',
        end_time: this.form.get('end_time')?.value ?? '',
        specialty: this.form.get('specialty')?.value ?? '',
        professional_id: this.form.get('professional')?.value ?? '',
        professional_name:
          `${this.professionalSelected?.name} ${this.professionalSelected?.lastname}` ??
          '',
        patient_id: patient,
        patient_name: this.patientName,
        status: 'PENDIENTE',
        date: this.form.get('date')?.value ?? '',
      };
      this.appointmentRequested = requestData;

      Swal.fire({
        title: 'Confirmar turno',
        html: `
          <p><strong>Especialista:</strong> ${requestData.professional_name}</p>
          <p><strong>Especialidad:</strong> ${requestData.specialty}</p>
          <p><strong>Fecha:</strong> ${requestData.day}, ${requestData.date}</p>
          <p><strong>Horario:</strong> ${requestData.start_time} - ${
          requestData.end_time
        } hs</p>
          ${
            this.role === 'ADMIN'
              ? `<p><strong>Paciente:</strong> ${requestData.patient_name}</p>`
              : ''
          }
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            await this.handleCreateRequestAppointment();
          } catch (error) {
            Swal.showValidationMessage(`Error: ${error}`);
          }
        },
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          this.appointmentRequested = undefined;
        }
      });
    }
  }
  async handleCreateRequestAppointment() {
    if (!this.appointmentRequested) return false;

    try {
      const success = await this.appointmentService.createAppointment(
        this.appointmentRequested
      );
      if (success) {
        Swal.fire({
          title: '¡Turno creado!',
          icon: 'success',
          showConfirmButton: false,
          timer: 7000,
        });
        this.router.navigate(['appointment']);
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo crear el turno.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
      return success;
    } catch (error) {
      console.error('Error al crear el turno:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo crear el turno.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return false;
    }
  }
}
