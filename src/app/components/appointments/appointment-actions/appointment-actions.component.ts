import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { RouterModule } from '@angular/router';
import {
  Appointment,
  AppointmentActions,
  PatientHistory,
  Status,
} from '../../../interfaces/appointment.interface';
import { AuthService } from '../../../services/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-appointment-actions',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSpinnerModule, ReactiveFormsModule],
  templateUrl: './appointment-actions.component.html',
  styleUrl: './appointment-actions.component.scss',
})
export class AppointmentActionsComponent {
  form: FormGroup;
  formHistoryPatient: FormGroup;

  @Input() itemSelected: Appointment | undefined;

  hasToShowCancelAction: boolean = false;
  hasToShowAcceptAction: boolean = false;
  hasToShowDeclineAction: boolean = false;
  hasToShowFinishAction: boolean = false;

  // Visibility flags for patient
  hasToShowProfessionalReview: boolean = false;
  hasToShowRateProfessional: boolean = false;
  hasToShowQuestionnaire: boolean = false;

  // Visibility flags for specialist
  hasToShowPatientReview: boolean = false;

  role: string = '';
  modalTitle: string = '';
  action: AppointmentActions | undefined = undefined;

  constructor(
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private appointmentService: AppointmentService
  ) {
    this.form = this.createForm();
    this.formHistoryPatient = this.createHistoryForm();
  }

  private createForm(): FormGroup {
    return new FormGroup({
      comment: new FormControl('', [
        Validators.required,
        Validators.maxLength(300),
      ]),
      diagnosis: new FormControl('', [
        Validators.required,
        Validators.maxLength(300),
      ]),
      points: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(10),
      ]),
      quality: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(10),
      ]),
      facilitiesAndConditions: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(10),
      ]),
      waitTime: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(10),
      ]),
      securityAndPrivacy: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(10),
      ]),
    });
  }

  private createHistoryForm(): FormGroup {
    return new FormGroup({
      height: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(250),
      ]),
      weight: new FormControl('', [
        Validators.required,
        Validators.min(1),
        Validators.max(1000), // en kg
      ]),
      temperature: new FormControl('', [
        Validators.required,
        Validators.min(35),
        Validators.max(50),
      ]),
      pressure: new FormControl('', [
        Validators.required,
        Validators.min(60),
        Validators.max(120),
      ]),
      extraA: new FormControl(''),
      extraB: new FormControl(''),
      extraC: new FormControl(''),
      valueA: new FormControl(''),
      valueB: new FormControl(''),
      valueC: new FormControl(''),
    });
  }

  ngOnInit() {
    this.role = this.authService.getRole();
  }

  ngOnChanges(): void {
    this.handleActionsVisibility();
  }

  cleanActions() {
    // Reset all visibility flags
    this.hasToShowCancelAction = false;
    this.hasToShowAcceptAction = false;
    this.hasToShowDeclineAction = false;
    this.hasToShowFinishAction = false;
    this.hasToShowProfessionalReview = false;
    this.hasToShowRateProfessional = false;
    this.hasToShowQuestionnaire = false;
    this.hasToShowPatientReview = false;
  }

  handleActionsVisibility() {
    if (this.itemSelected) {
      const status = this.itemSelected.status;
      this.cleanActions();

      switch (this.role) {
        case 'PACIENTE':
          this.hasToShowCancelAction =
            status === 'ACEPTADO' || status === 'PENDIENTE';
          if (this.itemSelected.id) {
            this.appointmentService
              .getExtraInfoByAppointmentId(this.itemSelected.id)
              .subscribe((review) => {
                this.hasToShowProfessionalReview =
                  review?.diagnosis && status === 'REALIZADO' ? true : false; // si el profesional cargo comentario y diagnosis
                !review?.points && status === 'REALIZADO' ? true : false; // si no califico la atencion del especialista
                !review?.quality && status === 'REALIZADO' ? true : false; // si no hizo el cuestionario
              });
          }
          break;
        case 'ESPECIALISTA':
          this.hasToShowCancelAction = status === 'ACEPTADO';
          this.hasToShowDeclineAction = status === 'PENDIENTE';
          this.hasToShowAcceptAction = status === 'PENDIENTE';
          this.hasToShowFinishAction = status === 'ACEPTADO';

          if (this.itemSelected.id) {
            this.appointmentService
              .getExtraInfoByAppointmentId(this.itemSelected.id)
              .subscribe((review) => {
                this.hasToShowPatientReview =
                  review?.points && status === 'REALIZADO' ? true : false; // si el paciente cargo review
              });
          }
          break;
        case 'ADMIN':
          this.hasToShowCancelAction = status === 'PENDIENTE';
          break;
        default:
          break;
      }
    }
  }

  handleClickAction(actionName: AppointmentActions) {
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
      case 'CALIFICAR':
        this.modalTitle = 'Calificar atención';
        break;
      case 'COMPLETAR_CUESTIONARIO':
        this.modalTitle = 'Completar cuestionario';
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
    if (this.itemSelected?.id && this.action) {
      this.spinner.show();

      if (!this.handleValidateAndCreateExtraInfo()) {
        this.spinner.hide();
        return;
      }

      // Si es valido el form y se crean los datos, se actualiza el estado del turno
      if (
        [
          'CANCELADO',
          'ACEPTADO',
          'RECHAZADO',
          'REALIZADO',
          'PENDIENTE',
        ].includes(this.action)
      ) {
        this.appointmentService.updateAppointmentStatus(
          this.itemSelected.id,
          this.action
        );
        this.itemSelected.status = this.action as Status;
      }

      // Reload appointment data after updates
      this.appointmentService.getAppointments().subscribe((response) => {
        const updatedAppointment = response.find(
          (item) => item.id === this.itemSelected?.id
        );
        if (updatedAppointment) {
          this.itemSelected = updatedAppointment;
          this.handleActionsVisibility();
        }
        this.spinner.hide();
      });

      // Reset the form
      this.form.reset();
      this.formHistoryPatient.reset();
    }
  }

  handleValidateAndCreateExtraInfo(): boolean {
    const comment = this.form.get('comment')?.value;
    const diagnosis = this.form.get('diagnosis')?.value;
    const points = this.form.get('points')?.value;
    const quality = this.form.get('quality')?.value;
    const facilitiesAndConditions = this.form.get(
      'facilitiesAndConditions'
    )?.value;
    const waitTime = this.form.get('waitTime')?.value;
    const securityAndPrivacy = this.form.get('securityAndPrivacy')?.value;

    switch (this.action) {
      case 'CANCELADO':
      case 'RECHAZADO':
        if (!comment) {
          this.form.get('comment')?.setErrors({ required: true });
          return false;
        } else {
          this.form.get('comment')?.setErrors(null);
          // complete comment
          this.appointmentService.createExtraInfo({
            id: this.itemSelected?.id,
            comment: comment,
            role: this.role,
          });
          return true;
        }
      case 'ACEPTADO':
        this.form.setErrors(null);
        return true;
      case 'REALIZADO':
        if (!comment || !diagnosis) {
          if (!comment) {
            this.form.get('comment')?.setErrors({ required: true });
          } else {
            this.form.get('comment')?.setErrors(null);
          }
          if (!diagnosis) {
            this.form.get('diagnosis')?.setErrors({ required: true });
          } else {
            this.form.get('diagnosis')?.setErrors(null);
          }
          return false;
        } else {
          this.form.get('comment')?.setErrors(null);
          this.form.get('diagnosis')?.setErrors(null);
          // complete comment
          this.appointmentService.createExtraInfo({
            id: this.itemSelected?.id,
            comment: comment,
            diagnosis: diagnosis,
          });

          // Create patient history
          this.createPatientHistory();
          return true;
        }
        break;
      case 'CALIFICAR':
        if (!comment || !points) {
          if (!comment) {
            this.form.get('comment')?.setErrors({ required: true });
          } else {
            this.form.get('comment')?.setErrors(null);
          }
          if (!points) {
            this.form.get('points')?.setErrors({ required: true });
          } else {
            this.form.get('points')?.setErrors(null);
          }
          return false;
        } else {
          this.form.get('comment')?.setErrors(null);
          this.form.get('points')?.setErrors(null);
          // complete comment
          this.appointmentService.createExtraInfo({
            id: this.itemSelected?.id,
            comment: comment,
            points: Number(points),
          });
        }
        return true;
      case 'COMPLETAR_CUESTIONARIO':
        if (
          !quality ||
          !facilitiesAndConditions ||
          !waitTime ||
          !securityAndPrivacy
        ) {
          if (!quality) {
            this.form.get('quality')?.setErrors({ required: true });
          } else {
            this.form.get('quality')?.setErrors(null);
          }
          if (!facilitiesAndConditions) {
            this.form
              .get('facilitiesAndConditions')
              ?.setErrors({ required: true });
          } else {
            this.form.get('facilitiesAndConditions')?.setErrors(null);
          }
          if (!waitTime) {
            this.form.get('waitTime')?.setErrors({ required: true });
          } else {
            this.form.get('waitTime')?.setErrors(null);
          }
          if (!securityAndPrivacy) {
            this.form.get('securityAndPrivacy')?.setErrors({ required: true });
          } else {
            this.form.get('securityAndPrivacy')?.setErrors(null);
          }
          return false;
        } else {
          this.form.setErrors(null);
          // complete comment
          this.appointmentService.createExtraInfo({
            id: this.itemSelected?.id,
            comment: comment,
            quality: Number(quality),
            facilitiesAndConditions: Number(facilitiesAndConditions),
            waitTime: Number(waitTime),
            securityAndPrivacy: Number(securityAndPrivacy),
          });
        }
        return true;
    }
    return false;
  }

  createPatientHistory() {
    const height = this.formHistoryPatient.get('height')?.value;
    const weight = this.formHistoryPatient.get('weight')?.value;
    const temperature = this.formHistoryPatient.get('temperature')?.value;
    const pressure = this.formHistoryPatient.get('pressure')?.value;
    const extraA = this.formHistoryPatient.get('extraA')?.value;
    const extraB = this.formHistoryPatient.get('extraB')?.value;
    const extraC = this.formHistoryPatient.get('extraC')?.value;
    const valueA = this.formHistoryPatient.get('valueA')?.value;
    const valueB = this.formHistoryPatient.get('valueB')?.value;
    const valueC = this.formHistoryPatient.get('valueC')?.value;

    const patientHistory: PatientHistory = {
      id_patient: this.itemSelected?.id || '',
      height: height,
      weight: weight,
      temperature: temperature,
      pressure: pressure,
      extraA: extraA,
      extraB: extraB,
      extraC: extraC,
      valueA: valueA,
      valueB: valueB,
      valueC: valueC,
    };

    // Llamar al servicio para crear el historial del paciente
    this.appointmentService.createPatientHistory(patientHistory);
  }
}
