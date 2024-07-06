import { Component, Input } from '@angular/core';
import {
  Appointment,
  PatientHistory,
} from '../../interfaces/appointment.interface';
import { CommonModule } from '@angular/common';
import { Role } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-history.component.html',
  styleUrl: './patient-history.component.scss',
})
export class PatientHistoryComponent {
  @Input() showLastThreeAppointments: boolean | undefined;
  @Input() appointments: Appointment[] | undefined;
  role: Role | undefined;

  constructor(private authService: AuthService) {}

  ngOnChanges(){
    console.log(this.appointments, 'ajajajajgjudhgjudy');
    
  }
  ngOnInit() {
    this.role = this.authService.getRole() as Role;
  }

  getExtraDataKeys(extraData: { [key: string]: string } | undefined): string[] {
    return extraData ? Object.keys(extraData) : [];
  }
}
