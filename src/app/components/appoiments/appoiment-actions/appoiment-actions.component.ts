import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { RouterModule } from '@angular/router';
import { Appoiment } from '../../../interfaces/appoiment.interface';
import { AuthService } from '../../../services/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-appoiment-actions',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSpinnerModule, ReactiveFormsModule],
  templateUrl: './appoiment-actions.component.html',
  styleUrl: './appoiment-actions.component.scss',
})
export class AppoimentActionsComponent {
  form: FormGroup;

  @Input() itemSelected: Appoiment | undefined;
  hasToShowCancelAction: boolean = false;
  hasToShowAcceptAction: boolean = false;
  hasToShowDeclineAction: boolean = false;
  hasToShowFinishAction: boolean = false;

  role: string = '';
  modalTitle: string = '';
  action: string = '';

  constructor(
    private spinner: NgxSpinnerService,
    private authService: AuthService
  ) {
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    return new FormGroup({
      comment: new FormControl('', [
        Validators.required,
        Validators.maxLength(301),
      ]),
      diagnosis: new FormControl(
        null,
        this.action === 'FINALIZAR' ? Validators.required : null
      ),
    });
  }

  ngOnInit() {
    this.role = this.authService.getRole();
  }

  ngOnChanges(): void {
    if (this.itemSelected) {
      const status = this.itemSelected?.status;

      // Reset visibility flags
      this.hasToShowCancelAction = false;
      this.hasToShowDeclineAction = false;
      this.hasToShowAcceptAction = false;

      // Logic based on role
      switch (this.role) {
        case 'PACIENTE':
          this.hasToShowCancelAction =
            status !== 'REALIZADO' && status !== 'CANCELADO';
          break;
        case 'ESPECIALISTA':
          this.hasToShowCancelAction =
            status !== 'ACEPTADO' &&
            status !== 'REALIZADO' &&
            status !== 'RECHAZADO' &&
            status !== 'CANCELADO';
          this.hasToShowDeclineAction =
            status !== 'ACEPTADO' &&
            status !== 'REALIZADO' &&
            status !== 'CANCELADO' &&
            status !== 'RECHAZADO';
          this.hasToShowAcceptAction =
            status !== 'REALIZADO' &&
            status !== 'CANCELADO' &&
            status !== 'RECHAZADO' &&
            status !== 'ACEPTADO';
          this.hasToShowFinishAction = status === 'ACEPTADO';
          break;
        case 'ADMIN':
          this.hasToShowCancelAction =
            status !== 'ACEPTADO' &&
            status !== 'REALIZADO' &&
            status !== 'RECHAZADO' &&
            status !== 'CANCELADO';
          break;
        default:
          break;
      }
    }
  }

  handleClickAction(actionName: string) {
    this.action = actionName;
    switch (actionName) {
      case 'CANCELAR':
        this.modalTitle = 'Cancelar turno';
        break;
      case 'RECHAZAR':
        this.modalTitle = 'Rechazar turno';
        break;
      case 'ACEPTAR':
        this.modalTitle = 'Aceptar turno';
        break;
      case 'FINALIZAR':
        this.modalTitle = 'Finalizar turno';
        break;
      default:
        this.action = '';
        break;
    }
  }
  handleCancelAction() {
    this.form.reset();
  }
  handleSubmit() {
    const comment = this.form.get('comment')?.value;
    const diagnosis = this.form.get('diagnosis')?.value;

    if (this.action === 'FINALIZAR' && !diagnosis) {
      this.form.get('diagnosis')?.setErrors({ required: true });
    }
    if (this.form.valid) {
      console.log('entree');
    }
  }
}
