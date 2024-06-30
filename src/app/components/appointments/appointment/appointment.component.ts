import { Component } from '@angular/core';
import { Appointment } from '../../../interfaces/appointment.interface';
import { AppointmentTableComponent } from '../appointment-table/appointment-table.component';
import { AppointmentActionsComponent } from '../appointment-actions/appointment-actions.component';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [AppointmentTableComponent, AppointmentActionsComponent],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.scss',
})
export class AppointmentComponent {
  itemSelected: Appointment | undefined = undefined;

  handleItemSelected(user: any) {
    this.itemSelected = user;
  }
}
