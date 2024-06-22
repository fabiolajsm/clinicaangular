import { Component, EventEmitter, Output } from '@angular/core';
import { Appoiment } from '../../../interfaces/appoiment.interface';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AppoimentService } from '../../../services/appoiment.service';
import { AuthService } from '../../../services/auth.service';
import { UserInterface } from '../../../interfaces/user.interface';

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
    this.appoimentService.getAppoiments().subscribe((response) => {
      this.appoiments = response; // TODO: ordenar por orden de fechas
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
