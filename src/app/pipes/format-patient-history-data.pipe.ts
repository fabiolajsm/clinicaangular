import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPatientHistoryData',
  standalone: true,
})
export class FormatPatientHistoryDataPipe implements PipeTransform {
  transform(
    value: number | undefined,
    type: 'height' | 'weight' | 'temperature' | 'pressure'
  ): string {
    if (!value) return '-';
    switch (type) {
      case 'height':
        return `${value} cm`;
      case 'weight':
        return `${value} kg`;
      case 'pressure':
        return `${value} mmhg`;
      case 'temperature':
        return `${value} °C`;
    }
  }
}
