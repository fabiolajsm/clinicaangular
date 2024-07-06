import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSectionTitle]',
  standalone: true,
})
export class SectionTitleDirective {
  constructor(private element: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.element.nativeElement, 'text-align', 'center');
    this.renderer.setStyle(this.element.nativeElement, 'font-size', '24px');
    this.renderer.setStyle(this.element.nativeElement, 'font-weight', '500');
    this.renderer.setStyle(this.element.nativeElement, 'color', 'black');
    this.renderer.setStyle(this.element.nativeElement, 'margin-bottom', '20px');
    this.renderer.setStyle(this.element.nativeElement, 'margin-top', '10px');
  }
}
