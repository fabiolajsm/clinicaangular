import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { UserInterface } from '../../../interfaces/user.interface';
import { AuthService } from '../../../services/auth.service';
import { SectionTitleDirective } from '../../../directives/section-title.directive';
import { Appointment } from '../../../interfaces/appointment.interface';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgxSpinnerModule,
    SectionTitleDirective,
    SweetAlert2Module,
  ],
  templateUrl: './users-table.component.html',
})
export class UsersTableComponent {
  users: UserInterface[] = [];
  @Output() public userSelected: EventEmitter<any> = new EventEmitter<any>();
  @Input() appointments: Appointment[] | undefined;

  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.authService.getUsers().subscribe((response) => {
      this.users = response.sort((a, b) => {
        if ((a as UserInterface).role < (b as UserInterface).role) {
          return -1;
        }
        if ((a as UserInterface).role > (b as UserInterface).role) {
          return 1;
        }
        return 0;
      });
      this.spinner.hide();
    });
  }

  handleClick(userEmail: string) {
    const userSelected: UserInterface = this.users.filter(
      (item) => item.email === userEmail
    )[0];
    this.userSelected.emit(userSelected);

    const userData = {
      Usuario: `${userSelected?.email || 'N/A'}`,
      Nombre: `${userSelected?.name || 'N/A'} ${
        userSelected?.lastname || 'N/A'
      }`,
      Edad: userSelected?.age || 'N/A',
      DNI: userSelected?.dni || 'N/A',
    };

    if (userSelected && this.appointments) {
      const filterApp = this.appointments.filter((item) => {
        return userSelected.role === 'PACIENTE'
          ? item.patient_id === userSelected.id
          : false;
      });

      const detail: any[] = [];
      filterApp.forEach((app: Appointment) => {
        const infoTurnoExcel = {
          Fecha: app.date,
          Horario: `${app.start_time} - ${app.end_time} hs`,
          Estado: app.status,
          Especialidad: app.specialty,
          NombrePaciente: app.patient_name,
          Especialista: app.professional_name,
        };
        detail.push(infoTurnoExcel);
      });

      const wsUserData = XLSX.utils.json_to_sheet([userData]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsUserData, 'Información Usuario');

      if (filterApp.length > 0) {
        const wsAppointments = XLSX.utils.json_to_sheet(detail);
        XLSX.utils.book_append_sheet(wb, wsAppointments, 'Turnos');
      }

      XLSX.writeFile(
        wb,
        `${userSelected.name}-${userSelected.lastname}-Informacion.xlsx`
      );
    } else {
      const wsUserData = XLSX.utils.json_to_sheet([userData]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsUserData, 'Información Usuario');

      XLSX.writeFile(
        wb,
        `${userSelected?.name || 'Usuario'}-${
          userSelected?.lastname || 'Info'
        }.xlsx`
      );
    }
  }

  handleBack() {
    this.router.navigate(['/']);
  }
}
