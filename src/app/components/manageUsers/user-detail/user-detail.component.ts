import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  Patients,
  Role,
  Specialists,
  UserInterface,
} from '../../../interfaces/user.interface';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSpinnerModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent {
  @Input() userSelected: UserInterface | Patients | Specialists | undefined;

  constructor(
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {}

  handleEnableSpecialist(userId: string | undefined) {
    if (!userId) return;
    this.spinner.show();
    this.authService.changeProfileEnable(
      userId,
      !(this.userSelected as Specialists).profileEnabled
    );
    this.authService.getUsers().subscribe((response) => {
      const updatedUser = response.find(
        (user: any) => user.email === this.userSelected?.email
      );
      if (updatedUser) {
        this.userSelected = updatedUser;
      }
    });
    this.spinner.hide();
  }

  getData(role: Role): string {
    switch (role) {
      case 'PACIENTE':
        return `Obra social: ${
          (this.userSelected as Patients).healthInsurance
        }`;
      case 'ESPECIALISTA':
        return `Especialidades: ${(
          this.userSelected as Specialists
        ).specialties.join(', ')}`;
      default:
        return '';
    }
  }
  getButtonMessage(): string {
    const profileEnabled = (this.userSelected as Specialists).profileEnabled;
    return profileEnabled ? 'Deshabilitar' : 'Habilitar';
  }
}
