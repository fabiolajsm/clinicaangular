import { Component, Input } from '@angular/core';
import { PatientHistory } from '../../interfaces/appointment.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-history.component.html',
  styleUrl: './patient-history.component.scss',
})
export class PatientHistoryComponent {
  @Input() patientData: PatientHistory[] | undefined;

  getExtraDataKeys(extraData: { [key: string]: string } | undefined): string[] {
    return extraData ? Object.keys(extraData) : [];
  }
}
