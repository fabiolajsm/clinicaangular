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
})
export class LoginComponent {
  private subscriptions: Subscription[] = [];
  users: UserInterface[] = [];
  loginHistory: LoginHistory[] = [];
  data: { name: string; value: number }[] = [];
  loginDetail: { user: string; lastLogin: string }[] = [];
  colorScheme: Color = {
    name: 'logs',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };

  constructor(
    private spinner: NgxSpinnerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.spinner.show();

    const userSub = this.authService.getUsers().subscribe((users) => {
      this.users = users;
      this.updateChartData();
    });

    const loginHistorySub = this.authService
      .getLoginHistory()
      .subscribe((history) => {
        this.loginHistory = history;
        this.updateChartData();
        this.spinner.hide();
      });

    this.subscriptions.push(userSub, loginHistorySub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private updateChartData(): void {
    if (this.users.length === 0 || this.loginHistory.length === 0) {
      return;
    }

    const loginCounts: { [key: string]: number } = {};
    const lastLogins: { [key: string]: Date } = {};

    this.loginHistory.forEach((log) => {
      const userEmail = log.email;
      if (loginCounts[userEmail]) {
        loginCounts[userEmail]++;
      } else {
        loginCounts[userEmail] = 1;
      }

      if (!lastLogins[userEmail] || log.date > lastLogins[userEmail]) {
        lastLogins[userEmail] = log.date;
      }
    });

    this.data = Object.keys(loginCounts).map((email) => {
      const user = this.users.find((u) => u.email === email);
      const userName = user ? user.email : 'Usuario desconocido';
      const label = `${userName} - Cantidad de ingresos: ${loginCounts[email]}`;
      const formattedLastLogin = lastLogins[email]
        ? lastLogins[email].toString()
        : 'Nunca';

      const existingDetailIndex = this.loginDetail.findIndex(
        (detail) => detail.user === userName
      );

      if (existingDetailIndex === -1) {
        this.loginDetail.push({
          user: userName,
          lastLogin: formattedLastLogin,
        });
      } else {
        this.loginDetail[existingDetailIndex].lastLogin = formattedLastLogin;
      }

      return {
        name: label,
        value: loginCounts[email],
      };
    });
  }
}
