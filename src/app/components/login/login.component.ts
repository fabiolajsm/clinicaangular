import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../services/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import {
  Role,
  Specialists,
  UserInterface,
} from '../../interfaces/user.interface';
import { FirebaseError } from 'firebase/app';
import { authErrors } from '../../services/auth.errors';
import { getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SweetAlert2Module,
    NgxSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form: FormGroup;
  errorMessage: string = '';
  email: string = '';
  password: string = '';
  users: UserInterface[] = [];
  usersQuickAccess = [
    'suarezfabiola17@gmail.com',
    'brallaucraunoite-6064@yopmail.com',
    'especialista2@gmail.com',
    'wesaf63292@lisoren.com',
    'paciente2NoVerificoEmail@gmail.com',
    'paciente3@noverifico.com',
  ];
  role: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.spinner.show();
    this.authService.getUsers().subscribe((response) => {
      this.users = response
        .filter((user) =>
          this.usersQuickAccess.includes((user as UserInterface).email)
        )
        .sort((a, b) => {
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

  private createForm(): FormGroup {
    return new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  handleSubmit() {
    this.spinner.show();
    const email = this.form.get('email')?.value;
    const password = this.form.get('password')?.value;

    this.authService.login(email, password, this.role as Role).subscribe({
      next: () => {
        const currentUserAuth = getAuth()?.currentUser;
        if (currentUserAuth && !currentUserAuth.emailVerified) {
          this.showAlert(
            'Por favor verifica tu dirección de correo electrónico.'
          );
          this.spinner.hide();
          return;
        } else {
          this.authService.getUserByEmail(email).subscribe(
            (currentUserData) => {
              if (currentUserData && currentUserData.role === 'ESPECIALISTA') {
                if (!(currentUserData as Specialists).profileEnabled) {
                  this.showAlert(
                    'No puedes ingresar, un administrador debe aprobar tu perfil.'
                  );
                  this.spinner.hide();
                  return;
                }
              }

              this.authService.addToLoginHistory(email);
              this.router.navigateByUrl('');
              this.spinner.hide();
            },
            (error) => {
              console.error('Error al obtener información del usuario:', error);
              this.spinner.hide();
            }
          );
        }
      },
      error: (err: FirebaseError) => {
        let errorMessage = 'Se produjo un error desconocido.';
        for (const error of authErrors) {
          if (error.code === err.code) {
            errorMessage = error.message;
            break;
          }
        }
        this.errorMessage = errorMessage;
        this.spinner.hide();
      },
    });
  }

  private showAlert(message: string) {
    this.authService.logout();
    this.spinner.hide();
    Swal.fire({
      icon: 'error',
      title: 'No puedes iniciar sesión',
      text: message,
      showConfirmButton: false,
      timer: 7000,
    });
  }

  handleLogin(email: string) {
    this.spinner.show();
    const userSelected: UserInterface = this.users.filter(
      (item) => item.email === email
    )[0];
    this.form.controls['email'].setValue(userSelected.email);
    this.form.controls['password'].setValue(userSelected.password);
    this.role = userSelected.role;
    this.spinner.hide();
  }

  handleBack() {
    this.router.navigate(['/']);
  }
}
