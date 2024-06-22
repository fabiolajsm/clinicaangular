import { Component, EventEmitter, Output } from '@angular/core';
import { Appoiment } from '../../../interfaces/appoiment.interface';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AppoimentService } from '../../../services/appoiment.service';
import { AuthService } from '../../../services/auth.service';
import { UserInterface } from '../../../interfaces/user.interface';
import { getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-appoiment-table',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSpinnerModule],
  templateUrl: './appoiment-table.component.html',
  styleUrl: './appoiment-table.component.scss',
})
export class AppoimentTableComponent {
  appoiments: Appoiment[] = [];
  currentUserRole: string = '';
  users: UserInterface[] = [];

  @Output() public itemSelected: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private appoimentService: AppoimentService,

    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.currentUserRole = this.authService.getRole();
    this.authService.getUsers().subscribe((response) => {
      this.users = response;
    });
    const currentUserEmail = getAuth().currentUser?.email;
    const role = this.authService.getRole();
    this.appoimentService.getAppoiments().subscribe((response) => {
      this.appoiments = response
        .filter((item) => {
          if (!currentUserEmail || role === 'ADMIN') return true;
          return (
            item.professional === currentUserEmail ||
            item.patient == currentUserEmail
          );
        })
        .sort((a, b) => {
          if ((a as Appoiment).status < (b as Appoiment).status) {
            return -1;
          }
          if ((a as Appoiment).status > (b as Appoiment).status) {
            return 1;
          }
          return 0;
        });
      this.spinner.hide();
    });
  }

  handleClick(id: string) {
    const itemSelected: Appoiment = this.appoiments.filter(
      (item) => item.id === id
    )[0];
    this.itemSelected.emit(itemSelected);
  }
  handleBack() {
    this.router.navigate(['/']);
  }
}
