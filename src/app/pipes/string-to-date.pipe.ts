import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringToDate',
  standalone: true,
})
/**
 * Transforms a time string in 'HH:mm' format into a Date object.
 * @example time '17:00' returns Sun Dec 31 1899 17:00:00 GMT-0416 (Argentina Standard Time)
 */
export class StringToDatePipe implements PipeTransform {
  transform(time: string): Date {
    const timeParts = time.split(':');
    const hour = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    return new Date(0, 0, 0, hour, minutes);
  }
}
