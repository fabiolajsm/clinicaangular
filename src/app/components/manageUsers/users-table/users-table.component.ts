import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { UserInterface } from '../../../interfaces/user.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgxSpinnerModule],
  templateUrl: './users-table.component.html',
})
export class UsersTableComponent {
  users: UserInterface[] = [];
  @Output() public userSelected: EventEmitter<any> = new EventEmitter<any>();

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
  }
  handleBack() {
    this.router.navigate(['/']);
  }
}
