import { Component } from '@angular/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { Subscription } from 'rxjs';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../interfaces/appointment.interface';
import { Specialties } from '../../../interfaces/specialties.interface';
import { SpecialtiesService } from '../../../services/specialties.service';

@Component({
  selector: 'app-appointments-by-specialty',
  standalone: true,
  imports: [NgxSpinnerModule, NgxChartsModule],
  templateUrl: './appointments-by-specialty.component.html',
  styleUrl: './appointments-by-specialty.component.scss',
})
export class AppointmentsBySpecialtyComponent {
  showChart: boolean = false;
  private subscriptions: Subscription[] = [];
  specialties: Specialties[] = [];

  colorScheme: Color = {
    name: 'appointmentsBySpecialty',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };

  data: { name: string; value: number }[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private appService: AppointmentService,
    private specialtyService: SpecialtiesService
  ) {}

  ngOnInit() {
    this.spinner.show();
    const specialtiesSub = this.specialtyService
      .getSpecialties()
      .subscribe((specialties: Specialties[]) => {
        this.specialties = specialties;

        this.data = this.specialties.map((specialty) => ({
          name: specialty.name,
          value: 0,
        }));

        const appointmentsSub = this.appService
          .getAppointments()
          .subscribe((appointments: Appointment[]) => {
            this.calculateAppointmentsPerSpecialty(appointments);
            this.showChart = true;
            this.spinner.hide();
          });

        this.subscriptions.push(appointmentsSub);
      });

    this.subscriptions.push(specialtiesSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private calculateAppointmentsPerSpecialty(appointments: Appointment[]) {
    this.data.forEach((specialty) => (specialty.value = 0));

    appointments.forEach((appointment) => {
      const specialtyIndex = this.data.findIndex(
        (specialty) => specialty.name === appointment.specialty
      );
      if (specialtyIndex !== -1) {
        this.data[specialtyIndex].value++;
      }
    });
  }
}
