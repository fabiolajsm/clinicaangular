import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { RouterModule } from '@angular/router';
import {
  Appointment,
  AppointmentActions,
  Appointment_Extra_Info,
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
import { PatientHistoryService } from '../../../services/patient-history.service';
import { ActionModalTitlePipe } from '../../../pipes/action-modal-title.pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-appointment-actions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    ActionModalTitlePipe,
  ],
  templateUrl: './appointment-actions.component.html',
  styleUrl: './appointment-actions.component.scss',
})
export class AppointmentActionsComponent {
  form: FormGroup;
  formHistoryPatient: FormGroup;

  @Input() itemSelected: Appointment | undefined;

  // Visibility flags
  hasToShowCancelAction: boolean = false;
  hasToShowAcceptAction: boolean = false;
  hasToShowDeclineAction: boolean = false;
  hasToShowFinishAction: boolean = false;
  hasToShowProfessionalReview: boolean = false;
  hasToShowRateProfessional: boolean = false;
  hasToShowQuestionnaire: boolean = false;
  hasToShowAnswersQuestionnaire: boolean = false;
  hasToShowAnswerRateProfessional: boolean = false;
  hasToShowPatientReview: boolean = false;
  hasToShowTheirReviewSpecialist: boolean = false;
  hasToShowCancelOrDeclineReason: boolean = false;

  message: string = '';
  role: string = '';
  modalTitle: string = '';
  action: AppointmentActions | undefined = undefined;
  hasCreatedAction: boolean = false;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private patientHistoryService: PatientHistoryService
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
        Validators.max(300), // en kg
      ]),
      temperature: new FormControl('', [
        Validators.required,
        Validators.min(28),
        Validators.max(50),
      ]),
      pressure: new FormControl('', [
        Validators.required,
        Validators.min(20),
        Validators.max(300),
      ]),
      extraA: new FormControl('', []),
      extraB: new FormControl('', []),
      extraC: new FormControl('', []),
      valueA: new FormControl('', []),
      valueB: new FormControl('', []),
      valueC: new FormControl('', []),
    });
  }

  ngOnInit() {
    this.role = this.authService.getRole();
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngOnChanges(): void {
    this.handleActionsVisibility();
  }

  handleActionsVisibility() {
    this.hasCreatedAction = false;
    if (!this.itemSelected) return;

    const status = this.itemSelected.status;
    this.cleanActions();

    switch (this.role) {
      case 'PACIENTE':
        this.handlePatientActions(status);
        break;
      case 'ESPECIALISTA':
        this.handleProfessionalActions(status);
        break;
      case 'ADMIN':
        this.hasToShowCancelAction = status === 'PENDIENTE';
        break;
      default:
        break;
    }
  }

  private handlePatientActions(status: string): void {
    this.hasToShowCancelAction =
      status === 'ACEPTADO' || status === 'PENDIENTE';
    if (this.itemSelected?.id) {
      this.appointmentService
        .getExtraInfoByAppointmentId(this.itemSelected.id)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((extraInfo: Appointment_Extra_Info[]) => {
          const hasDiagnosisAndComment = extraInfo.some((item) => {
            return item.diagnosis && item.comment;
          });

          this.hasToShowProfessionalReview =
            hasDiagnosisAndComment && status === 'REALIZADO' ? true : false;

          const hasPoints = extraInfo.some((item) => item.points);
          this.hasToShowRateProfessional = !hasPoints && status === 'REALIZADO';
          this.hasToShowAnswerRateProfessional =
            hasPoints && status === 'REALIZADO';

          const hasQuality = extraInfo.some((item) => item.quality);
          this.hasToShowQuestionnaire = !hasQuality && status === 'REALIZADO';
          this.hasToShowAnswersQuestionnaire =
            hasQuality && status === 'REALIZADO' ? true : false;
          const hasLeftCancelOrRejected = extraInfo.some((item) => {
            const hasCancel =
              this.itemSelected?.status === 'RECHAZADO' ||
              this.itemSelected?.status === 'CANCELADO';
            return item.comment && hasCancel;
          });
          this.hasToShowCancelOrDeclineReason = hasLeftCancelOrRejected
            ? true
            : false;
        });
    }
  }

  private handleProfessionalActions(status: string): void {
    this.hasToShowCancelAction = status === 'ACEPTADO';
    this.hasToShowDeclineAction = status === 'PENDIENTE';
    this.hasToShowAcceptAction = status === 'PENDIENTE';
    this.hasToShowFinishAction = status === 'ACEPTADO';

    if (this.itemSelected?.id) {
      this.appointmentService
        .getExtraInfoByAppointmentId(this.itemSelected.id)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((extraInfo: Appointment_Extra_Info[]) => {
          const hasPointsAndComment = extraInfo.some(
            (item) => item.points && item.comment
          );
          this.hasToShowPatientReview =
            hasPointsAndComment && status === 'REALIZADO' ? true : false;

          const hasLeftReview = extraInfo.some(
            (item) => item.comment && item.diagnosis
          );
          this.hasToShowTheirReviewSpecialist =
            status === 'REALIZADO' && hasLeftReview ? true : false;

          const hasLeftCancelOrRejected = extraInfo.some((item) => {
            const hasCancel =
              this.itemSelected?.status === 'RECHAZADO' ||
              this.itemSelected?.status === 'CANCELADO';
            return item.comment && hasCancel;
          });
          this.hasToShowCancelOrDeclineReason = hasLeftCancelOrRejected
            ? true
            : false;
        });
    }
  }

  cleanActions(): void {
    this.hasToShowCancelAction = false;
    this.hasToShowAcceptAction = false;
    this.hasToShowDeclineAction = false;
    this.hasToShowFinishAction = false;
    this.hasToShowProfessionalReview = false;
    this.hasToShowRateProfessional = false;
    this.hasToShowQuestionnaire = false;
    this.hasToShowAnswersQuestionnaire = false;
    this.hasToShowAnswerRateProfessional = false;
    this.hasToShowPatientReview = false;
    this.hasToShowTheirReviewSpecialist = false;
    this.hasToShowCancelOrDeclineReason = false;
    this.message = '';
  }

  handleClickAction(actionName: AppointmentActions): void {
    this.action = actionName;

    if (this.handleShowForm() || !this.itemSelected?.id) return;
    this.spinner.show();
    this.appointmentService
      .getExtraInfoByAppointmentId(this.itemSelected.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((extraInfo: Appointment_Extra_Info[]) => {
        if (!extraInfo) return;
        switch (this.action) {
          case 'VER_REVIEW_PACIENTE':
          case 'VER_REVIEW_PROFESIONAL_PACIENTE':
            const hasPointsAndComment = extraInfo.find(
              (item) => item.points && item.comment
            );
            this.message = `Puntaje: ${hasPointsAndComment?.points}. Comentario: ${hasPointsAndComment?.comment}`;
            break;
          case 'VER_MI_COMENTARIO_DIAGNOSTICO':
          case 'VER_REVIEW_PROFESIONAL':
            const hasDiagnosis = extraInfo.find(
              (item) => item.diagnosis && item.comment
            );
            this.message = `Diagnóstico: ${hasDiagnosis?.diagnosis}. Comentario: ${hasDiagnosis?.comment}`;
            break;
          case 'VER_CUESTIONARIO':
            const hasQuality = extraInfo.find(
              (item) => item.quality && item.facilitiesAndConditions
            );
            this.message = `Comentario: ${hasQuality?.comment}. Calidad del servicio (1-10): ${hasQuality?.quality} Instalaciones y condiciones (1-10): ${hasQuality?.facilitiesAndConditions}. Tiempo de espera (1-10): ${hasQuality?.waitTime}. Seguridad y privacidad (1-10): ${hasQuality?.securityAndPrivacy}`;
            break;
          case 'VER_MOTIVO_DE_BAJA':
            const hasLeftCancelOrRejected = extraInfo.find((item) => {
              const hasCancel =
                this.itemSelected?.status === 'RECHAZADO' ||
                this.itemSelected?.status === 'CANCELADO';
              return item.comment && hasCancel;
            });
            if (this.role === 'PACIENTE') {
              this.message = `No se realizó el turno por "${
                hasLeftCancelOrRejected?.comment
              }" (Comentario del : ${hasLeftCancelOrRejected?.role?.toLocaleLowerCase()})`;
            } else {
              this.message = `${
                hasLeftCancelOrRejected?.role === 'PACIENTE'
                  ? 'El paciente canceló por: '
                  : 'No pude atender por:'
              } ${hasLeftCancelOrRejected?.comment}`;
            }
            break;
          default:
            break;
        }
        this.spinner.hide();
      });
  }

  handleShowForm(): boolean {
    if (!this.action) return false;
    switch (this.action) {
      case 'CALIFICAR':
      case 'CANCELADO':
      case 'COMPLETAR_CUESTIONARIO':
      case 'RECHAZADO':
        return true;
      case 'ACEPTADO':
      case 'VER_CUESTIONARIO':
      case 'VER_MI_COMENTARIO_DIAGNOSTICO':
      case 'VER_MOTIVO_DE_BAJA':
      case 'VER_REVIEW_PACIENTE':
      case 'VER_REVIEW_PROFESIONAL':
      case 'VER_REVIEW_PROFESIONAL_PACIENTE':
        return false;
      default:
        return false;
    }
  }

  handleSubmit() {
    if (
      this.itemSelected?.id &&
      this.action &&
      this.action !== 'VER_REVIEW_PROFESIONAL' &&
      this.action !== 'VER_REVIEW_PACIENTE'
    ) {
      this.spinner.show();

      if (!this.handleValidateAndCreateExtraInfo()) {
        this.spinner.hide();
        return;
      }

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
      this.hasCreatedAction = true;
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

          // Create patient history
          if (this.createPatientHistory()) {
            // complete comment
            this.appointmentService.createExtraInfo({
              id: this.itemSelected?.id,
              comment: comment,
              diagnosis: diagnosis,
            });
            return true;
          } else {
            return false;
          }
        }
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

  createPatientHistory(): boolean {
    this.formHistoryPatient.setErrors(null);
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

    // Marcar todos los controles como tocados para mostrar los mensajes de error
    if (this.formHistoryPatient.invalid) {
      Object.values(this.formHistoryPatient.controls).forEach((control) => {
        control.markAsTouched();
      });
      return false;
    }
    if (extraA && !valueA) {
      this.formHistoryPatient.get('valueA')?.setErrors({ required: true });
      return false;
    }
    if (extraB && !valueB) {
      this.formHistoryPatient.get('valueB')?.setErrors({ required: true });
      return false;
    }
    if (extraC && !valueC) {
      this.formHistoryPatient.get('valueC')?.setErrors({ required: true });
      return false;
    }

    this.formHistoryPatient.setErrors(null);
    if (!this.itemSelected?.id) return false;
    const patientHistory: PatientHistory = {
      id_patient: this.itemSelected?.patient_id || '',
      id_appointment: this.itemSelected?.id,
      height: height,
      weight: weight,
      temperature: temperature,
      pressure: pressure,
      extraData: {
        ...(extraA ? { [extraA]: valueA } : {}),
        ...(extraB ? { [extraB]: valueB } : {}),
        ...(extraC ? { [extraC]: valueC } : {}),
      },
    };

    this.patientHistoryService.createPatientHistory(patientHistory);
    return true;
  }

  handleCloseModal() {
    this.form.reset();
    this.formHistoryPatient.reset();
  }

  hasToShowAction(): boolean {
    return (
      this.hasToShowCancelAction ||
      this.hasToShowDeclineAction ||
      this.hasToShowAcceptAction ||
      this.hasToShowFinishAction ||
      this.hasToShowProfessionalReview ||
      this.hasToShowQuestionnaire ||
      this.hasToShowAnswersQuestionnaire ||
      this.hasToShowRateProfessional ||
      this.hasToShowAnswerRateProfessional ||
      this.hasToShowPatientReview ||
      this.hasToShowTheirReviewSpecialist ||
      this.hasToShowCancelOrDeclineReason
    );
  }
}
