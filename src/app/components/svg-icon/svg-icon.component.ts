import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-svg-icon',
  templateUrl: 'svg-icon.component.html',
})
export class SvgIconComponent {
  @Input() iconName?: string;
  @Input() size = 71;

  get iconPath(): string {
    return `assets/icons/${this.iconName}.svg`;
  }
}
