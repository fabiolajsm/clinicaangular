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
  },
  {
    path: 'appoiment',
    loadComponent: () =>
      import('./components/appoiment/appoiment.component').then(
        (c) => c.AppoimentComponent
      ),
    canMatch: [authGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/error/error.component').then(
        (c) => c.ErrorComponent
      ),
  },
];
