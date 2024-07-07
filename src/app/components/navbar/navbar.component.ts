import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  isLogged: boolean = false;
  isAdmin: boolean = false;
  isPatient: boolean = false;
  sub!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.sub = this.authService
      .isAuthenticated()
      .subscribe((isAuthenticated) => {
        this.isLogged = isAuthenticated;
        const role = this.authService.getRole();
        this.isAdmin = role === 'ADMIN';
        this.isPatient = role === 'PACIENTE';
      });
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  handleLogout(): void {
    this.authService.logout();
  }
}
