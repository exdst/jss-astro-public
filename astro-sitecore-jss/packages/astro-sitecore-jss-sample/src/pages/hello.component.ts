import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hello',
  standalone: true,
  imports: [NgIf],
  template: `
    <p>Hello from Angular!!</p>

    <p *ngIf="show">{{ helpText }}</p>

    <button (click)="toggle()">Toggle</button>
  `,
})
export class HelloComponent {
  @Input() helpText = 'help';

  show = false;

  toggle() {
    this.show = !this.show;
  }
}