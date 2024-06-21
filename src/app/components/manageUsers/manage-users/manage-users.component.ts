import { Component } from '@angular/core';
import { UsersTableComponent } from '../users-table/users-table.component';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { UserInterface } from '../../../interfaces/user.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [UsersTableComponent, UserDetailComponent, RouterLink],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss',
})
export class ManageUsersComponent {
  userSelected: UserInterface | undefined = undefined;

  handleItemSelected(user: any) {
    this.userSelected = user;
  }
}
