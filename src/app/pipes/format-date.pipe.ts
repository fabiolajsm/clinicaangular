import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
  standalone: true,
})

/**
 * Transforms a Date object into a formatted string 'YYYY-MM-DD'.
 * @param date The Date object to format.
 * @returns A string representation of the date in 'YYYY-MM-DD' format.
 */
export class FormatDatePipe implements PipeTransform {
  transform(date: Date): string {
    return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(
      date.getDate()
    )}`;
  }
  /**
   * Pads a number with a leading '0' if it's less than 10.
   * @param num The number to pad.
   * @returns A string representation of the padded number.
   */
  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}
