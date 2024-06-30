import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Specialists, UserInterface } from '../../../interfaces/user.interface';
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
import { getAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    MatButtonModule,
    MatStepperModule,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {
  form = this._formBuilder.group({
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
  hasToShowAppointments: boolean = false;

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
  hasConfirm: boolean | undefined = undefined;

  constructor(
    private _formBuilder: FormBuilder,
    private authService: AuthService,
    private specialtiesService: SpecialtiesService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.spinner.show();
    // Get specialties
    this.specialtiesService
      .getSpecialties()
      .subscribe((data: Specialties[]) => {
        this.specialtiesOptions = data;
      });
    // Get schedules
    this.specialtiesService.getSchedules().subscribe((data: Schedules[]) => {
      this.schedules = data;
      // Filter professionals by loaded schedules
      this.authService.getUsers().subscribe((response: UserInterface[]) => {
        this.professionals = response.filter((item) => {
          if (
            item.role === 'ESPECIALISTA' &&
            (item as Specialists).profileEnabled
          ) {
            // Check if the user has at least one schedule loaded
            return this.schedules?.some(
              (schedule) => schedule.user_id === item.id
            );
          }
          return false;
        }) as Specialists[];

        this.spinner.hide();
      });
    });
  }

  ngOnChanges() {
    console.log(this.hasConfirm, 'hasConfirm');
  }

  handleSelectProfessional(email: string) {
    this.form.get('professional')?.setValue(null);
    if (!email) return;
    const itemSelected = this.professionals.find(
      (item) => item.email === email
    );
    const currentSchedule = this.schedules?.find(
      (item) => item.user_id === itemSelected?.id
    );
    if (itemSelected?.id && currentSchedule) {
      this.form.get('professional')?.setValue(itemSelected?.id);
      this.professionalSelected = itemSelected;
      this.professionalSchedule = currentSchedule;
      this.loadDays();
    }
  }

  handleSelectSpecialty(specialty: string) {
    this.form.get('specialty')?.setValue(null);
    if (!specialty) return;
    this.form.get('specialty')?.setValue(specialty);
    this.hasToShowAppointments = true;
  }

  getSpecialtyImg(specialtyName: string): string | undefined {
    if (!this.specialtiesOptions) return undefined;
    const matchedSpecialty = this.specialtiesOptions.find(
      (opt) => opt.name === specialtyName
    );
    return matchedSpecialty
      ? matchedSpecialty.img
      : 'https://firebasestorage.googleapis.com/v0/b/clinicaangular-edc0f.appspot.com/o/generica.jpeg?alt=media&token=35dc22a6-b5c1-4cb0-b576-5ed2934fbb74';
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
    const start = this.convertStringTimeToDate(
      this.professionalSchedule.start_time
    );
    const end = this.convertStringTimeToDate(
      this.professionalSchedule.end_time
    );
    const interval = 30; // Intervalo en minutos
    const appointmentTimes: ScheduleTime[] = [];
    let current = new Date(start);

    while (current <= end) {
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
        appt.date === this.formatDate(date) &&
        appt.start_time === startTime &&
        appt.end_time === endTime
    );
    return taken;
  }

  formatDate(date: Date): string {
    return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(
      date.getDate()
    )}`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  convertStringTimeToDate(time: string): Date {
    const timeParts = time.split(':');
    const hour = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    return new Date(0, 0, 0, hour, minutes);
  }

  selectDay(day: { date: Date; availableTimes: ScheduleTime[] }) {
    if (this.selectedDay === day) {
      this.selectedDay = undefined;
    } else {
      this.selectedDay = day;
      const formattedDate = this.formatDate(day.date);
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

  handleSubmit() {
    const email = getAuth().currentUser?.email;

    if (this.form.valid && email) {
      const requestData: Appointment = {
        day: this.form.get('day')?.value ?? '',
        start_time: this.form.get('start_time')?.value ?? '',
        end_time: this.form.get('end_time')?.value ?? '',
        specialty: this.form.get('specialty')?.value ?? '',
        professional_id: this.form.get('professional')?.value ?? '',
        patient: email,
        professional: this.professionalSelected?.email ?? '',
        status: 'PENDIENTE',
        date: this.form.get('date')?.value ?? '' ?? '',
      };
      this.hasConfirm = false;
      this.appointmentRequested = requestData;
    }
  }

  handleCreateRequestAppointment() {
    this.hasConfirm = true;
    this.handleReset();
  }

  handleReset() {
    this.form.reset();
    // clean states
    this.professionalSelected = undefined;
    this.professionalSchedule = undefined;
    this.professionalAppointmentAvailable = undefined;
    this.availableDays = [];
    this.hasToShowAppointments = false;
    this.datesTaken = [];
    this.selectedDay = undefined;
    this.selectTime = undefined;
  }

  handleBack() {
    this.router.navigate(['/']);
    this.handleReset();
  }
}
