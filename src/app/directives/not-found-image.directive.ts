import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNotFoundImage]',
  standalone: true,
})
export class NotFoundImageDirective {
  constructor(private imagen: ElementRef) {}

  @HostListener('error') onError(): void {
    this.imagen.nativeElement.src =
      'https://firebasestorage.googleapis.com/v0/b/clinicaangular-edc0f.appspot.com/o/generica.jpeg?alt=media&token=35dc22a6-b5c1-4cb0-b576-5ed2934fbb74';
  }
}
