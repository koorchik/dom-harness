import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-text-input',
  standalone: true,
  template: `
    <input
      data-testid="text-input"
      [attr.name]="name"
      [attr.type]="type"
      [value]="value"
      (input)="onInput($event)"
    />
  `,
})
export class TextInputComponent {
  @Input() name = '';
  @Input() type = 'text';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event) {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
