import { Component } from '@angular/core';
import { Appointment } from '../../../interfaces/appointment.interface';
import { AppointmentTableComponent } from '../appointment-table/appointment-table.component';
import { AppointmentActionsComponent } from '../appointment-actions/appointment-actions.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [
    AppointmentTableComponent,
    AppointmentActionsComponent,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.scss',
})
export class AppointmentComponent {
  itemSelected: Appointment | undefined = undefined;
  isAdmin: boolean = false;

  constructor(private authService: AuthService) {
    this.isAdmin = this.authService.getIsRole('ADMIN');
  }

  handleItemSelected(user: any) {
    this.itemSelected = user;
  }
}
