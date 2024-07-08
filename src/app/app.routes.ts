import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    title: 'Home',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (c) => c.LoginComponent
      ),
    title: 'Login',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (c) => c.RegisterComponent
      ),
    title: 'Registro',
  },
  {
    path: 'manageUsers',
    loadComponent: () =>
      import(
        './components/manageUsers/manage-users/manage-users.component'
      ).then((c) => c.ManageUsersComponent),
    title: 'Administrar usuarios',
    canMatch: [authGuard, adminGuard],
  },
  {
    path: 'myProfile',
    loadComponent: () =>
      import('./components/my-profile/my-profile.component').then(
        (c) => c.MyProfileComponent
      ),
    canMatch: [authGuard],
    title: 'Mi perfil',
  },
  {
    path: 'appointment',
    loadComponent: () =>
      import(
        './components/appointments/appointment/appointment.component'
      ).then((c) => c.AppointmentComponent),
    canMatch: [authGuard],
  },
  {
    path: 'createAppointment',
    loadComponent: () =>
      import(
        './components/appointments/create-appointments/create-appointments.component'
      ).then((c) => c.CreateAppointmentsComponent),
    canMatch: [authGuard],
    title: 'Solicitar turno',
  },
  {
    path: 'myPatients',
    loadComponent: () =>
      import('./components/my-patients/my-patients.component').then(
        (c) => c.MyPatientsComponent
      ),
    canMatch: [authGuard],
    title: 'Mis pacientes',
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./components/reports/all-reports/all-reports.component').then(
        (c) => c.AllReportsComponent
      ),
    title: 'Informes',
    canMatch: [authGuard, adminGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/error/error.component').then(
        (c) => c.ErrorComponent
      ),
  },
];
