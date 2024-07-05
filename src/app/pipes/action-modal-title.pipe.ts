import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentActions } from '../interfaces/appointment.interface';

@Pipe({
  name: 'actionModalTitle',
  standalone: true,
})
export class ActionModalTitlePipe implements PipeTransform {
  transform(actionName: AppointmentActions): string {
    let modalTitle;
    switch (actionName) {
      case 'CANCELADO':
        modalTitle = 'Cancelar turno';
        break;
      case 'RECHAZADO':
        modalTitle = 'Rechazar turno';
        break;
      case 'ACEPTADO':
        modalTitle = 'Aceptar turno';
        break;
      case 'REALIZADO':
        modalTitle = 'Finalizar turno';
        break;
      case 'CALIFICAR':
        modalTitle = 'Calificar atención';
        break;
      case 'COMPLETAR_CUESTIONARIO':
        modalTitle = 'Completar cuestionario';
        break;
      case 'VER_REVIEW_PROFESIONAL':
        modalTitle = 'Ver comentario/diagnostico del profesional';
        break;
      case 'VER_REVIEW_PACIENTE':
        modalTitle = 'Ver comentario/calificacion del paciente';
        break;
      case 'VER_MI_COMENTARIO_DIAGNOSTICO':
        modalTitle = 'Mi comentario/diagnóstico';
        break;
      case 'VER_CUESTIONARIO':
        modalTitle = 'Mis respuestas del cuestionario';
        break;
      case 'VER_REVIEW_PROFESIONAL_PACIENTE':
        modalTitle = 'Calificación que le envié al profesional';
        break;
      default:
        modalTitle = '';
        break;
    }
    return modalTitle;
  }
}
