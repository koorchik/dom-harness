import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextInputComponent } from '../text-input/text-input.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, TextInputComponent, ButtonComponent],
  template: `
    <form data-testid="login-form" (submit)="handleSubmit($event)">
      <app-text-input name="username" type="text" [(value)]="username" />
      <app-text-input name="password" type="password" [(value)]="password" />
      <app-button type="submit">Login</app-button>
      <p *ngIf="submitted" data-testid="welcome">Welcome, {{ username }}!</p>
    </form>
  `,
})
export class LoginFormComponent {
  username = '';
  password = '';
  submitted = false;

  handleSubmit(event: Event) {
    event.preventDefault();
    this.submitted = true;
  }
}
