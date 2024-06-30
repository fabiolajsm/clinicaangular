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
import { getAuth } from 'firebase/auth';
import { Schedules } from '../../interfaces/specialties.interface';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule, ReactiveFormsModule],
  templateUrl: './my-profile.component.html',
})
export class MyProfileComponent {
  user: UserInterface | Patients | Specialists | undefined = undefined;
  email: string | null | undefined = null;
  schedules: Schedules | null = null;
  form: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthService,
    private specialtiesService: SpecialtiesService,
    private spinner: NgxSpinnerService
  ) {
    this.form = this.createForm();

    this.email = getAuth().currentUser?.email;
    if (!this.email) return;
    this.spinner.show();
    this.authService.getUserByEmail(this.email).subscribe((currentUserData) => {
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
      this.spinner.hide();
    });
  }

  ngOnChanges() {
    this.form.get('start')?.valueChanges.subscribe(() => {
      this.form.get('end')?.updateValueAndValidity();
    });
    this.form.get('end')?.valueChanges.subscribe(() => {
      this.form.get('start')?.updateValueAndValidity();
    });
  }

  private createForm(): FormGroup {
    return new FormGroup({
      start: new FormControl('', [Validators.required]),
      end: new FormControl('', [Validators.required, this.endDateValidator]),
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
}
