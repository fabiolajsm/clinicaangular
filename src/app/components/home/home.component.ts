import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  isLogged: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe((isAuthenticated) => {
      this.isLogged = isAuthenticated;
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
  goToAppointments(): void {
    this.router.navigate(['/appoiment']);
  }
  getTitle(): string {
    const role = this.authService.getRole();
    switch (role) {
      case 'ADMIN':
      case 'ESPECIALISTA':
        return 'Hola! Ahora manejar turnos es más sencillo';
      default:
        return '¡Su salud es lo más importante para nosotros!';
    }
  }
  getSubtitle(): string {
    const role = this.authService.getRole();
    switch (role) {
      case 'ADMIN':
      case 'ESPECIALISTA':
        return 'Gestione sus turnos de manera eficiente y sin complicaciones.';
      default:
        return 'Reciba atención médica de calidad desde la comodidad de su hogar.';
    }
  }
  getGoToAppoimentsText(): string {
    const role = this.authService.getRole();
    switch (role) {
      case 'ADMIN':
      case 'ESPECIALISTA':
        return 'Ir a turnos';
      case 'PACIENTE':
        return 'Ir a turnos';
      default:
        return '';
    }
  }
}
