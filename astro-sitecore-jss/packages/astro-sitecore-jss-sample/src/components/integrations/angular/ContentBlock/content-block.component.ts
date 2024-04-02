import { NgIf } from '@angular/common';
import type { ComponentRendering } from '@sitecore-jss/sitecore-jss-angular';
import { Component, Input } from '@angular/core';
import { TextDirective } from '../Standalone/text.directive';
import { RichTextDirective } from '../Standalone/rich-text.directive';

@Component({
  standalone: true,
  selector: 'app-content-block',
  templateUrl: './content-block.component.html',
  imports: [NgIf, TextDirective, RichTextDirective]

})
export class ContentBlockComponent {
  @Input() fields: ComponentRendering | any | undefined;
}

