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
}
