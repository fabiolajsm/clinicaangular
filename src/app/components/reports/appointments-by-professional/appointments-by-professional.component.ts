import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { Subscription } from 'rxjs';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../interfaces/appointment.interface';
import { UserInterface } from '../../../interfaces/user.interface';
import { AuthService } from '../../../services/auth.service';
import { GeneratePdfService } from '../../../services/generate-pdf.service';

@Component({
  selector: 'app-appointments-by-professional',
  standalone: true,
  imports: [NgxSpinnerModule, NgxChartsModule],
  templateUrl: './appointments-by-professional.component.html',
})
export class AppointmentsByProfessionalComponent {
  showChart: boolean = false;
  private subscriptions: Subscription[] = [];
  doctors: UserInterface[] = [];
  colorScheme: Color = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
    name: 'appointmentsByDoctor',
    selectable: true,
    group: ScaleType.Ordinal,
  };
  data: { name: string; value: number }[] = [];

  private specialistsLoadedCount: number = 0;
  @ViewChild('appByProf') idElement!: ElementRef;

  constructor(
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private appService: AppointmentService,
    private pdfService: GeneratePdfService
  ) {}

  ngOnInit(): void {
    this.spinner.show();

    const doctorsSub = this.authService
      .getDoctors()
      .subscribe((doctors: UserInterface[]) => {
        this.doctors = doctors;
        this.data = this.doctors.map((doctor) => ({
          name: doctor.name,
          value: 0,
        }));

        this.doctors.forEach((doctor, index) => {
          const doctorId = doctor.id;
          if (!doctorId) return;

          const appointmentsSub = this.appService
            .getAppointmentsBySpecialist(doctorId)
            .subscribe((appointments: Appointment[]) => {
              const filteredAppointments =
                this.filterAppointmentsByDateRange(appointments);
              this.data[index].value = filteredAppointments.length;

              this.specialistsLoadedCount++;
              if (this.specialistsLoadedCount === this.doctors.length) {
                this.checkIfAllDataLoaded();
                this.spinner.hide();
              }
            });

          this.subscriptions.push(appointmentsSub);
        });
      });

    this.subscriptions.push(doctorsSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private filterAppointmentsByDateRange(
    appointments: Appointment[]
  ): Appointment[] {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      return (
        appointmentDate >= firstDayOfMonth && appointmentDate <= lastDayOfMonth
      );
    });
  }

  private checkIfAllDataLoaded(): void {
    const allLoaded = this.data.every((doctor) => doctor.value >= 0);
    if (allLoaded) {
      this.showChart = true;
    }
  }

  downloadPDF() {
    this.pdfService.createPDF(
      this.idElement.nativeElement,
      'Cantidad-Turnos-Solicitados-A-Medicos'
    );
  }
}
