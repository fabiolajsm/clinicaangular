import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Role, UserInterface } from '../../interfaces/user.interface';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirebaseError } from 'firebase/app';
import { authErrors } from '../../services/auth.errors';
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
  Storage,
} from '@angular/fire/storage';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { getAuth, sendEmailVerification } from 'firebase/auth';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Specialties } from '../../interfaces/specialties.interface';
import { SpecialtiesService } from '../../services/specialties.service';
import { HealthInsuranceService } from '../../services/health-insurance.service';
import { HealthInsurance } from '../../interfaces/healthInsurance.interface';
import { RecaptchaModule } from 'ng-recaptcha';
import { SectionTitleDirective } from '../../directives/section-title.directive';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SweetAlert2Module,
    NgxSpinnerModule,
    RecaptchaModule,
    SectionTitleDirective
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  formSelected: Role | null = null;
  form: FormGroup;
  specialtiesOptions: Specialties[] = [];
  specialtiesSelected: string[] = [];
  healthInsuranceOptions: HealthInsurance[] = [];
  imagesAux: File[] = [];
  imagesUrls: string[] = [];
  errorMessage: string = '';
  isAdmin: boolean = false;
  captcha: string | undefined = undefined;
  showCaptchaError: boolean = false;

  constructor(
    private router: Router,
    private storage: Storage,
    private authService: AuthService,
    private specialtiesService: SpecialtiesService,
    private healthInsuranceService: HealthInsuranceService,
    private spinner: NgxSpinnerService
  ) {
    this.form = this.createForm();
  }

  ngOnInit() {
    this.spinner.show();
    this.isAdmin = this.authService.getIsRole('ADMIN');
    this.specialtiesService
      .getSpecialties()
      .subscribe((data: Specialties[]) => {
        this.specialtiesOptions = data;
      });
    this.healthInsuranceService
      .getHealthInsurances()
      .subscribe((data: HealthInsurance[]) => {
        this.healthInsuranceOptions = data;
        this.spinner.hide();
      });
  }

  private createForm(): FormGroup {
    return new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      dni: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{9,10}$'),
      ]),
      age: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(100),
        Validators.pattern('^[1-9][0-9]?$|^100$'),
      ]),
      name: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'),
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'),
      ]),
      healthInsurance: new FormControl(
        null,
        this.formSelected === 'PACIENTE' ? Validators.required : null
      ),
      specialties: new FormControl(
        null,
        this.formSelected === 'ESPECIALISTA' ? Validators.required : null
      ),
      otherSpecialty: new FormControl(''),
      images: new FormControl(null),
    });
  }

  selectFormType(role: Role) {
    this.formSelected = role;
  }

  clearSpecialties() {
    this.form.get('specialties')?.setValue([]);
    this.specialtiesSelected = [];
  }

  handleSelect(event: Event) {
    const selectedOption = (event.target as HTMLSelectElement).value
      .split(': ')[1]
      .replace(/'/g, '')
      .trim();

    if (!this.specialtiesSelected.includes(selectedOption)) {
      this.specialtiesSelected.push(selectedOption);
    }
    this.form.get('specialties')?.setValue(this.specialtiesSelected);
  }

  removeSpecialty(specialty: string) {
    this.specialtiesSelected = this.specialtiesSelected.filter(
      (item) => item !== specialty
    );
    this.form.get('specialties')?.setValue(this.specialtiesSelected);
  }

  addOtherSpecialty() {
    const otherSpecialtyControl = this.form.get('otherSpecialty');
    const otherSpecialty = otherSpecialtyControl?.value?.trim();
    if (!otherSpecialty || otherSpecialty === '') return;

    const containsNumbersOrSpecialChars =
      /[0-9!@#$%^&*(),.?":{}|<>ñÑáéíóúÁÉÍÓÚ]/.test(otherSpecialty);
    if (containsNumbersOrSpecialChars) {
      otherSpecialtyControl?.setErrors({ invalid: true });
      return;
    }
    if (!this.specialtiesSelected.includes(otherSpecialty)) {
      this.specialtiesSelected.push(otherSpecialty);
      this.form.get('specialties')?.patchValue(this.specialtiesSelected);
      otherSpecialtyControl?.setValue('');
      otherSpecialtyControl?.setErrors(null);
    }
  }

  handleBack() {
    if (!this.formSelected) {
      this.router.navigate(['/']);
    } else {
      this.formSelected = null;
      this.form.reset();
      this.specialtiesSelected = [];
    }
  }

  validateFormByRole(): boolean {
    if (this.formSelected === 'PACIENTE') {
      if (!this.form.get('healthInsurance')?.value) {
        this.form.get('healthInsurance')?.setErrors({ required: true });
        return false;
      } else {
        this.form.get('healthInsurance')?.setErrors(null);
        return true;
      }
    } else if (this.formSelected === 'ESPECIALISTA') {
      const specialtiesValue = this.form.get('specialties')?.value;
      if (!specialtiesValue || specialtiesValue.length === 0) {
        this.form.get('specialties')?.setErrors({ required: true });
        return false;
      } else {
        this.form.get('specialties')?.setErrors(null);
        return true;
      }
    }

    return true;
  }

  handleImages(event: Event) {
    this.imagesAux = [];
    const fileLength = this.formSelected === 'PACIENTE' ? 2 : 1;
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;
    if (!files || !this.validateImages(files.length)) return;

    for (let i = 0; i < fileLength; i++) {
      this.imagesAux.push(files[i]);
    }
  }

  validateImages(imagesLength: number) {
    const fileLength = this.formSelected === 'PACIENTE' ? 2 : 1;
    if (imagesLength === fileLength) {
      this.form.get('images')?.setErrors(null);
      return true;
    } else {
      this.form.get('images')?.setErrors({ required: true });
      return false;
    }
  }

  async handleUploadImages(images: File[]): Promise<string[]> {
    const urls: string[] = [];

    try {
      for (const image of images) {
        const imgRef = storageRef(this.storage, `${image.name}`);
        await uploadBytes(imgRef, image);
        const downloadUrl = await getDownloadURL(imgRef);
        urls.push(downloadUrl);
      }
      return urls;
    } catch (error) {
      throw new Error(`Error al subir las imágenes`);
    }
  }

  handleSubmit() {
    this.spinner.show();
    if (!this.captcha) {
      this.showCaptchaError = true;
    }
    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });
    const hasValidInfoByRole = this.validateFormByRole();
    const hasImages = this.validateImages(this.imagesAux.length);

    if (this.form.valid && hasValidInfoByRole && hasImages && this.captcha) {
      this.handleUploadImages(this.imagesAux)
        .then((imageUrls) => {
          if (!this.formSelected) return;
          const userData: UserInterface = {
            email: this.form.get('email')?.value,
            password: this.form.get('password')?.value,
            dni: this.form.get('dni')?.value,
            age: this.form.get('age')?.value,
            name: this.form.get('name')?.value,
            lastname: this.form.get('lastname')?.value,
            role: this.formSelected,
            profilePicture: imageUrls[0],
          };

          this.authService
            .register(userData.email, userData.password || '')
            .subscribe({
              next: () => {
                if (userData.role === 'PACIENTE') {
                  this.authService.updatePatient({
                    ...userData,
                    healthInsurance: this.form.get('healthInsurance')?.value,
                    secondProfilePicture: imageUrls[1],
                  });
                } else if (userData.role === 'ESPECIALISTA') {
                  this.addSelectedSpecialties();
                  this.authService.updateSpecialist({
                    ...userData,
                    specialties: this.form.get('specialties')?.value,
                    profileEnabled: false,
                  });
                } else {
                  this.authService.updateAdmin(userData);
                }

                // show success message
                this.form.reset();
                this.spinner.hide();
                sendEmailVerification(getAuth().currentUser!)
                  .then(() => {
                    this.authService.logout();
                    Swal.fire({
                      icon: 'success',
                      title: 'Registro exitoso!',
                      text: 'Para iniciar sesión tienes que verificar la cuenta en tu casilla de email.',
                      showConfirmButton: false,
                      timer: 8000,
                    });
                  })
                  .catch(() => {
                    Swal.fire({
                      icon: 'error',
                      title: 'Oops! Esto podría tardar unos minutos más...',
                      text: 'Lo sentimos, su registro fue exitoso pero hubo un error al enviar el email para verificar su cuenta.',
                      showConfirmButton: false,
                      timer: 8000,
                    });
                  });

                this.router.navigateByUrl('login');
              },
              error: (err: FirebaseError) => {
                this.spinner.hide();
                let errorMessage = 'Se produjo un error desconocido.';
                for (const error of authErrors) {
                  if (error.code === err.code) {
                    errorMessage = error.message;
                    break;
                  }
                }
                this.errorMessage = errorMessage;
              },
            });
        })
        .catch((error) => {
          console.error('Error al subir imágenes:', error);
        });
    } else {
      this.spinner.hide();
    }
  }

  addSelectedSpecialties() {
    for (const specialtyName of this.specialtiesSelected) {
      const exists = this.specialtiesOptions.some(
        (option) =>
          option.name.toLocaleLowerCase() === specialtyName.toLocaleLowerCase()
      );
      if (!exists) {
        this.specialtiesService.addSpecialty(specialtyName);
      }
    }
  }

  resolved(captchaResponse: any) {
    this.captcha = captchaResponse;
    this.showCaptchaError = false;
  }
}
