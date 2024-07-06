import { Directive, ElementRef, Input } from '@angular/core';
import { Status } from '../interfaces/appointment.interface';

@Directive({
  selector: '[appHighlightStatus]',
  standalone: true,
})
export class HighlightStatusDirective {
  @Input('appHighlightStatus') status: Status | undefined;

  constructor(private el: ElementRef) {}
  ngOnInit() {
    if (!this.status) return;

    switch (this.status) {
      case 'ACEPTADO':
        this.applyStyles('#a7c957'); // green
        break;
      case 'CANCELADO':
        this.applyStyles('#f77f00'); // orange
        break;
      case 'PENDIENTE':
        this.applyStyles('#6c757d'); // gray
        break;
      case 'REALIZADO':
        this.applyStyles('#f75590'); // pink
        break;
      case 'RECHAZADO':
        this.applyStyles('#ba181b'); // red
        break;
      default:
        this.applyStyles('#562c2c'); // brown
        break;
    }
  }

  private applyStyles(textColor: string) {
    this.el.nativeElement.style.color = textColor;
  }
}
