import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { RouterModule } from '@angular/router';
import { Appoiment, Status } from '../../../interfaces/appoiment.interface';
import { AuthService } from '../../../services/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AppoimentService } from '../../../services/appoiment.service';

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
  action: Status | undefined = undefined;

  constructor(
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private appoimentService: AppoimentService
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
        this.action === 'REALIZADO' ? Validators.required : null
      ),
    });
  }

  ngOnInit() {
    this.role = this.authService.getRole();
  }

  ngOnChanges(): void {
    this.handleActionsVisibility();
  }

  handleActionsVisibility() {
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

  handleClickAction(actionName: Status) {
    this.action = actionName;
    switch (actionName) {
      case 'CANCELADO':
        this.modalTitle = 'Cancelar turno';
        break;
      case 'RECHAZADO':
        this.modalTitle = 'Rechazar turno';
        break;
      case 'ACEPTADO':
        this.modalTitle = 'Aceptar turno';
        break;
      case 'REALIZADO':
        this.modalTitle = 'Finalizar turno';
        break;
      default:
        this.action = undefined;
        break;
    }
  }
  handleCancelAction() {
    this.form.reset();
  }
  handleSubmit() {
    const comment = this.form.get('comment')?.value;
    const diagnosis = this.form.get('diagnosis')?.value;

    if (this.action === 'REALIZADO' && !diagnosis) {
      this.form.get('diagnosis')?.setErrors({ required: true });
    } else {
      this.form.get('diagnosis')?.setErrors(null);
    }
    if (this.action === 'ACEPTADO') {
      this.form.get('comment')?.setErrors(null);
    }

    if (this.form.valid && this.itemSelected?.id && this.action) {
      this.spinner.show();
      this.itemSelected.status = this.action;
      this.appoimentService.updateAppoimentStatus(
        this.itemSelected.id,
        this.action
      );
      this.appoimentService.getAppoiments().subscribe((response) => {
        const appoiment: Appoiment = response.filter(
          (item) => item.id == this.itemSelected?.id
        )[0];
        if (appoiment) {
          this.itemSelected = appoiment;
          this.handleActionsVisibility();
        }
        this.spinner.hide();
      });
      this.form.reset();
    }
  }
}
