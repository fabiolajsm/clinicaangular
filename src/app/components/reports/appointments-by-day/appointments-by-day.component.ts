import { Component } from '@angular/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { Subscription } from 'rxjs';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../interfaces/appointment.interface';

@Component({
  selector: 'app-appointments-by-day',
  standalone: true,
  imports: [NgxSpinnerModule, NgxChartsModule],
  templateUrl: './appointments-by-day.component.html',
})
export class AppointmentsByDayComponent {
  showChart: boolean = false;
  private subscriptions: Subscription[] = [];

  colorScheme: Color = {
    name: 'appointmentsByDay',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };

  data = [
    { name: 'Lunes', value: 0 },
    { name: 'Martes', value: 0 },
    { name: 'Miércoles', value: 0 },
    { name: 'Jueves', value: 0 },
    { name: 'Viernes', value: 0 },
  ];

  constructor(
    private spinner: NgxSpinnerService,
    private appService: AppointmentService
  ) {}

  ngOnInit() {
    this.spinner.show();
    const appointmentsSub = this.appService
      .getAppointments()
      .subscribe((appointments: Appointment[]) => {
        this.calculateAppointmentsPerDay(appointments);
        this.showChart = true;
        this.spinner.hide();
      });
    this.subscriptions.push(appointmentsSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private calculateAppointmentsPerDay(appointments: Appointment[]) {
    this.data.forEach((day) => (day.value = 0));

    appointments.forEach((appointment) => {
      const dayIndex = this.data.findIndex(
        (day) => day.name === appointment.day
      );
      if (dayIndex !== -1) {
        this.data[dayIndex].value++;
      }
    });
  }
}
