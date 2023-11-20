import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TextDirective } from "./standalone/text.directive"
import { RichTextDirective } from './standalone/rich-text.directive';

@Component({
  selector: 'app-hello',
  standalone: true,
  imports: [NgIf, TextDirective, RichTextDirective],
  template: `
    <h6 *scText="fields.heading"></h6>
    <p *scRichText="fields.content"></p>
  `,
})
export class ContentBlockComponent {
  @Input() helpText = 'help';
  @Input() fields: any;
  show = false;

  toggle() {
    this.show = !this.show;
  }
}