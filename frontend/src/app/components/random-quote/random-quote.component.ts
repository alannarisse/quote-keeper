import { Component, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteService, Quote } from '../../services/quote.service';
import { AuthService } from '../../services/auth.service';
import { PasswordModalComponent } from '../password-modal/password-modal.component';
import { EditQuoteModalComponent } from '../edit-quote-modal/edit-quote-modal.component';

@Component({
  selector: 'app-random-quote',
  standalone: true,
  imports: [CommonModule, PasswordModalComponent, EditQuoteModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="random-quote-container">
      <div class="header">
        <h2>Random Quote</h2>
        <wa-button variant="brand" (click)="getRandomQuote()" [disabled]="loading()">
          <wa-icon slot="prefix" name="shuffle"></wa-icon>
          {{ quote() ? 'Another One' : 'Get Random Quote' }}
        </wa-button>
      </div>

      @if (loading()) {
        <wa-card class="loading-card">
          <wa-spinner></wa-spinner>
          <p>Finding a quote...</p>
        </wa-card>
      } @else if (quote()) {
        <wa-card class="quote-card">
          <div class="thumb-container">
            <img
              [src]="getImageUrl(quote())"
              [alt]="quote()!.source_name || 'Movie thumbnail'"
              (error)="onImageError($event)"
              class="random-quote-thumb"
            />
          </div>
          <p class="quote-text">{{ quote()!.quote_text }}</p>
          <div class="quote-source">
            <span class="source">— {{ quote()!.source_name }}</span>
            @if (quote()!.speaker_1) { <span class="speaker">({{ quote()!.speaker_1 }})</span> }
          </div>
          @if (quote()!.tags.length > 0) {
            <div class="tags">
              @for (tag of quote()!.tags; track tag) { <wa-tag size="small">{{ tag }}</wa-tag> }
            </div>
          }
          <div class="actions">
            <wa-button variant="neutral" (click)="copyToClipboard()">
              <wa-icon slot="prefix" name="clipboard"></wa-icon>
              Copy
            </wa-button>
            <wa-button variant="neutral" (click)="editQuote()">
              <wa-icon slot="prefix" name="pen-to-square"></wa-icon>
              Edit
            </wa-button>
            <wa-button [variant]="quote()!.next_up ? 'brand' : 'neutral'" (click)="toggleNextUp()">
              <wa-icon slot="prefix" name="star"></wa-icon>
              {{ quote()!.next_up ? 'Remove from Next Up' : 'Next Up' }}
            </wa-button>
            <wa-button variant="neutral" (click)="markAsUsed()">
              <wa-icon slot="prefix" name="check"></wa-icon>
              Mark as Used
            </wa-button>
          </div>
        </wa-card>
      } @else if (error()) {
        <wa-card class="error-card">
          <wa-icon name="circle-xmark" style="font-size: 2rem; color: var(--wa-color-danger-600);"></wa-icon>
          <p>{{ error() }}</p>
          <wa-button variant="neutral" (click)="getRandomQuote()">Try Again</wa-button>
        </wa-card>
      } @else {
        <wa-card class="empty-card">
          <wa-icon name="lightbulb" style="font-size: 2rem; opacity: 0.5;"></wa-icon>
          <p>Click the button to get a random unused quote!</p>
        </wa-card>
      }

      @if (copied()) { <wa-callout variant="success" class="toast-notification">Copied to clipboard!</wa-callout> }
      @if (showPasswordModal()) {
        <app-password-modal (close)="showPasswordModal.set(false)" (authenticated)="onAuthenticated($event)" />
      }
      @if (editingQuote()) {
        <app-edit-quote-modal [quote]="editingQuote()!" (close)="editingQuote.set(null)" (saved)="onQuoteSaved()" />
      }
    </div>
  `,
  styles: [`
    .random-quote-container { padding: 20px 0; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .quote-card { text-align: center; padding: 40px 32px; }
    .thumb-container { margin-bottom: 20px; display: flex; justify-content: center; }
    .random-quote-thumb {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: var(--radius-md, 10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--wa-color-neutral-200);
    }
    .quote-text { font-size: 1.4rem; max-width: 700px; margin: 0 auto 20px; font-style: italic; &::before { content: '"'; } &::after { content: '"'; } }
    .quote-source { margin-bottom: 16px; .source { font-weight: 500; color: var(--color-brown); } .speaker { color: var(--color-text-light); margin-left: 6px; } }
    .tags { margin-bottom: 24px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
    .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; padding-top: 16px; border-top: 1px solid var(--wa-color-neutral-200); margin-top: 16px; }
    .loading-card, .empty-card, .error-card { text-align: center; padding: 40px; color: var(--color-text-light); display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .error-card { color: var(--color-error); }
    .toast-notification { position: fixed; bottom: 20px; right: 20px; z-index: 1000; animation: slideIn 0.3s ease; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    wa-card { display: block; }
  `]
})
export class RandomQuoteComponent implements OnInit {
  private quoteService = inject(QuoteService);
  private authService = inject(AuthService);

  quote = signal<Quote | null>(null);
  loading = signal(false);
  error = signal('');
  copied = signal(false);
  showPasswordModal = signal(false);
  editingQuote = signal<Quote | null>(null);
  pendingAction = signal<'used' | 'nextup' | null>(null);

  ngOnInit() {
    this.getRandomQuote();
  }

  getImageUrl(quote?: Quote | null): string {
    return this.quoteService.getImageUrl(quote);
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.endsWith('/images/thumbs/default.jpg')) {
      target.src = '/images/thumbs/default.jpg';
    }
  }

  getRandomQuote() {
    this.loading.set(true);
    this.error.set('');
    this.quoteService.getRandomQuote().subscribe({
      next: (q) => { this.quote.set(q); this.loading.set(false); },
      error: (err) => { this.error.set(err.status === 404 ? 'No unused quotes available!' : 'Failed to fetch quote'); this.loading.set(false); }
    });
  }

  copyToClipboard() {
    const q = this.quote();
    if (!q) return;
    const text = `"${q.quote_text}" — ${q.source_name}${q.speaker_1 ? ` (${q.speaker_1})` : ''}`;
    navigator.clipboard.writeText(text);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  markAsUsed() {
    if (!this.authService.isAuthenticated()) { this.pendingAction.set('used'); this.showPasswordModal.set(true); return; }
    this.doMarkAsUsed();
  }

  toggleNextUp() {
    if (!this.authService.isAuthenticated()) { this.pendingAction.set('nextup'); this.showPasswordModal.set(true); return; }
    this.doToggleNextUp();
  }

  editQuote() {
    const q = this.quote();
    if (q) this.editingQuote.set(q);
  }

  onQuoteSaved() {
    const q = this.quote();
    if (q) {
      this.quoteService.getQuotes({ unused: false }).subscribe({
        next: (quotes) => {
          const updated = quotes.find(quote => quote.id === q.id);
          if (updated) this.quote.set(updated);
        }
      });
    }
  }

  onAuthenticated(password: string) {
    this.showPasswordModal.set(false);
    const action = this.pendingAction();
    if (action === 'nextup') this.doToggleNextUp();
    else this.doMarkAsUsed();
    this.pendingAction.set(null);
  }

  private doMarkAsUsed() {
    const q = this.quote();
    const password = this.authService.password();
    if (!q || !password) return;
    this.quoteService.markAsUsed(q.id, password).subscribe({
      next: (updated) => this.quote.set(updated),
      error: (err) => { if (err.status === 401) { this.authService.clearPassword(); this.pendingAction.set('used'); this.showPasswordModal.set(true); } }
    });
  }

  private doToggleNextUp() {
    const q = this.quote();
    const password = this.authService.password();
    if (!q || !password) return;
    this.quoteService.toggleNextUp(q.id, password).subscribe({
      next: (updated) => this.quote.set(updated),
      error: (err) => { if (err.status === 401) { this.authService.clearPassword(); this.pendingAction.set('nextup'); this.showPasswordModal.set(true); } }
    });
  }
}
