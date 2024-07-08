import { Component } from '@angular/core';
import {
  LoginHistory,
  UserInterface,
} from '../../../interfaces/user.interface';
import { AuthService } from '../../../services/auth.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgxSpinnerModule, NgxChartsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  users: UserInterface[] | undefined = undefined;
  loginHistory: LoginHistory[] | undefined = undefined;
  private subscriptions: Subscription[] = [];

  colorScheme: Color = {
    name: 'logs',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };

  data = [
    {
      name: 'Germany',
      value: 40632,
    },
    {
      name: 'United States',
      value: 50000,
    },
    {
      name: 'France',
      value: 36745,
    },
    {
      name: 'United Kingdom',
      value: 36240,
    },
    {
      name: 'Spain',
      value: 33000,
    },
    {
      name: 'Italy',
      value: 35800,
    },
  ];

  constructor(
    private spinner: NgxSpinnerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.spinner.show();
    const userSub = this.authService.getUsers().subscribe((res) => {
      this.users = res;
    });
    this.subscriptions.push(userSub);
    const loginHistorySub = this.authService
      .getLoginHistory()
      .subscribe((res) => {
        this.loginHistory = res;
        this.spinner.hide();
      });
    this.subscriptions.push(loginHistorySub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
