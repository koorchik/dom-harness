import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button data-testid="button" [type]="type">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  @Input() type = 'button';
}
