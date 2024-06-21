import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

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

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe((isAuthenticated) => {
      this.isLogged = isAuthenticated;
    });
    this.isAdmin = this.authService.getIsRole('ADMIN');
  }

  handleLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('');
      },
      error: () => {
        console.log('error en logout');
      },
    });
  }
}
