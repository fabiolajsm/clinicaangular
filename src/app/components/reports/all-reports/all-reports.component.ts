import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoginComponent } from '../login/login.component';
import { AppointmentsByDayComponent } from '../appointments-by-day/appointments-by-day.component';
import { AppointmentsByProfessionalComponent } from '../appointments-by-professional/appointments-by-professional.component';
import { AppointmentsBySpecialtyComponent } from '../appointments-by-specialty/appointments-by-specialty.component';
import { AppointmentsCompletedComponent } from '../appointments-completed/appointments-completed.component';
import { SectionTitleDirective } from '../../../directives/section-title.directive';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-all-reports',
  standalone: true,
  imports: [
    LoginComponent,
    AppointmentsByDayComponent,
    AppointmentsByProfessionalComponent,
    AppointmentsBySpecialtyComponent,
    AppointmentsCompletedComponent,
    SectionTitleDirective,
    MatTabsModule,
  ],
  templateUrl: './all-reports.component.html',
})
export class AllReportsComponent {
  constructor(private router: Router) {}

  handleBack() {
    this.router.navigate(['/']);
  }
}
