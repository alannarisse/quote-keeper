import { Component, signal, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { PasswordModalComponent } from './components/password-modal/password-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, PasswordModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private router = inject(Router);
  authService = inject(AuthService);
  showLoginModal = signal(false);
  protected warningColor = signal('red');

  isActive(path: string): boolean {
    if (path === '/') {
      return this.router.url === '/';
    }
    return this.router.url.startsWith(path);
  }

  logout() {
    this.authService.clearPassword();
  }

  onAuthenticated(password: string) {
    this.showLoginModal.set(false);
  }
}
