import { Component } from '@angular/core';
import { Appoiment } from '../../../interfaces/appoiment.interface';
import { AppoimentTableComponent } from '../appoiment-table/appoiment-table.component';
import { AppoimentActionsComponent } from '../appoiment-actions/appoiment-actions.component';

@Component({
  selector: 'app-appoiment',
  standalone: true,
  imports: [AppoimentTableComponent, AppoimentActionsComponent],
  templateUrl: './appoiment.component.html',
  styleUrl: './appoiment.component.scss',
})
export class AppoimentComponent {
  itemSelected: Appoiment | undefined = undefined;

  handleItemSelected(user: any) {
    this.itemSelected = user;
  }
}
