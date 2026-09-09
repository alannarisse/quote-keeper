import { Component, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteService, Quote, QuoteFilters } from '../../services/quote.service';
import { AuthService } from '../../services/auth.service';
import { PasswordModalComponent } from '../password-modal/password-modal.component';
import { EditQuoteModalComponent } from '../edit-quote-modal/edit-quote-modal.component';

@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordModalComponent, EditQuoteModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="quote-list-container">
      <wa-card class="filters">
        <div class="filter-row">
          <wa-input placeholder="Search by source..." [value]="filters.source || ''" (input)="filters.source = $any($event).target.value; loadQuotes()">
            <wa-icon slot="prefix" name="magnifying-glass"></wa-icon>
          </wa-input>
          <wa-input placeholder="Search by speaker..." [value]="filters.speaker || ''" (input)="filters.speaker = $any($event).target.value; loadQuotes()">
            <wa-icon slot="prefix" name="user"></wa-icon>
          </wa-input>
          <wa-select placeholder="All tags" [value]="filters.tag || ''" (change)="filters.tag = $any($event).target.value; loadQuotes()">
            <wa-option value="">All tags</wa-option>
            @for (tag of tags(); track tag) { <wa-option [value]="tag">{{ tag }}</wa-option> }
          </wa-select>
        </div>
        <div class="filter-row">
          <wa-checkbox [checked]="filters.unused || false" (change)="filters.unused = $any($event).target.checked; loadQuotes()">Show unused only</wa-checkbox>
          <div class="sort-controls">
            <span>Sort by:</span>
            <wa-select [value]="filters.sort || 'created_at'" (change)="onSortChange($event)">
              <wa-option value="created_at">Date Added</wa-option>
              <wa-option value="source_name">Source</wa-option>
              <wa-option value="speaker_1">Speaker</wa-option>
              <wa-option value="contributor">Contributor</wa-option>
              <wa-option value="tags">Tags</wa-option>
              <wa-option value="next_up">Next Up</wa-option>
              <wa-option value="random">Random</wa-option>
            </wa-select>
            <wa-button variant="text" size="small" (click)="toggleOrder()" [title]="filters.sort === 'random' ? 'Reshuffle' : (filters.order === 'asc' ? 'Sort Ascending' : 'Sort Descending')">
              <wa-icon [name]="filters.sort === 'random' ? 'shuffle' : (filters.order === 'asc' ? 'arrow-up' : 'arrow-down')"></wa-icon>
            </wa-button>
          </div>
        </div>
      </wa-card>

      <div class="quote-count">
        <wa-badge variant="neutral">{{ quotes().length }}</wa-badge>
        quote{{ quotes().length !== 1 ? 's' : '' }}
      </div>

      @if (loading()) {
        <div class="loading">
          <wa-spinner></wa-spinner>
          <span>Loading quotes...</span>
        </div>
      } @else {
        <div class="quotes-grid">
          @for (quote of quotes(); track quote.id) {
            <wa-card class="quote-item" [class.used]="quote.used_at" [class.next-up]="quote.next_up">
              <div class="quote-layout">
              <div>
                <img
                  [src]="getImageUrl(quote)"
                  [alt]="quote.source_name || 'Movie thumbnail'"
                  (error)="onImageError($event)"
                  class="quote-thumb-img"
                />
                </div>
                <div class="quote-source">
                    <span class="source">{{ quote.source_name }}</span>
                    @if (quote.speaker_1) { <span class="speaker">— {{ quote.speaker_1 }}</span> }
                  </div>
              </div>
              <div class="quote-body">
                  <p class="quote-text">{{ quote.quote_text }}</p>
                  
                  @if (quote.tags.length > 0) {
                    <div class="tags">@for (tag of quote.tags; track tag) { <wa-tag size="xs">{{ tag }}</wa-tag> }</div>
                  }
                  <div class="quote-meta">
                    @if (quote.next_up) { <wa-badge variant="warning">Next Up</wa-badge> }
                    @if (quote.used_at) { <wa-badge variant="success">Used</wa-badge> }
                    @if (quote.contributor) { <span class="contributor">by {{ quote.contributor }}</span> }
                  </div>
                  
                </div>
                <div class="quote-actions">
                  <wa-button variant="neutral" size="xs" title="Copy quote" aria-label="Copy quote" (click)="copyQuote(quote)">
                    <wa-icon name="clipboard"></wa-icon>
                  </wa-button>
                  <wa-button variant="neutral" size="xs" title="Edit quote" aria-label="Edit quote" (click)="editQuote(quote)">
                    <wa-icon name="pencil"></wa-icon>
                  </wa-button>
                  <wa-button [variant]="quote.next_up ? 'brand' : 'neutral'" size="xs" [title]="quote.next_up ? 'Remove from Next Up' : 'Add to Next Up'" [aria-label]="quote.next_up ? 'Remove from Next Up' : 'Add to Next Up'" (click)="toggleNextUp(quote)">
                    <wa-icon name="star"></wa-icon>
                  </wa-button>
                  <wa-button [variant]="quote.used_at ? 'success' : 'neutral'" size="xs" [title]="quote.used_at ? 'Mark as unused' : 'Mark as used'" [aria-label]="quote.used_at ? 'Mark as unused' : 'Mark as used'" (click)="toggleUsed(quote)">
                    <wa-icon [name]="quote.used_at ? 'rotate-left' : 'check'"></wa-icon>
                  </wa-button>
                  <wa-button variant="neutral" size="xs" class="delete-btn" title="Delete quote" aria-label="Delete quote" (click)="deleteQuote(quote)">
                    <wa-icon name="trash"></wa-icon>
                  </wa-button>
                </div>
            </wa-card>
          }
        </div>
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
  styleUrls: ['./quote-list.component.scss']

})
export class QuoteListComponent implements OnInit {
  private quoteService = inject(QuoteService);
  private authService = inject(AuthService);

  quotes = signal<Quote[]>([]);
  tags = signal<string[]>([]);
  loading = signal(true);
  copied = signal(false);
  showPasswordModal = signal(false);
  editingQuote = signal<Quote | null>(null);
  filters: QuoteFilters = { sort: 'created_at', order: 'desc' };
  pendingAction = signal<{ type: string; quote: Quote } | null>(null);

  ngOnInit() { this.loadQuotes(); this.loadTags(); }

  loadQuotes() {
    this.loading.set(true);
    this.quoteService.getQuotes(this.filters).subscribe({
      next: (quotes) => { this.quotes.set(quotes); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadTags() { this.quoteService.getTags().subscribe({ next: (tags) => this.tags.set(tags) }); }

  getImageUrl(quote: Quote): string {
    return this.quoteService.getImageUrl(quote);
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.endsWith('/images/thumbs/default.jpg')) {
      target.src = '/images/thumbs/default.jpg';
    }
  }

  onSortChange(event: any) {
    const newSort = typeof event === 'string' ? event : event?.target?.value;
    if (!newSort) return;
    this.filters.sort = newSort;
    if (newSort === 'source_name' || newSort === 'speaker_1' || newSort === 'contributor') {
      this.filters.order = 'asc';
    } else if (newSort === 'created_at') {
      this.filters.order = 'desc';
    }
    this.loadQuotes();
  }

  toggleOrder() {
    if (this.filters.sort === 'random') {
      this.loadQuotes();
    } else {
      this.filters.order = this.filters.order === 'asc' ? 'desc' : 'asc';
      this.loadQuotes();
    }
  }

  copyQuote(quote: Quote) {
    const text = `"${quote.quote_text}" — ${quote.source_name}${quote.speaker_1 ? ` (${quote.speaker_1})` : ''}`;
    navigator.clipboard.writeText(text);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  toggleUsed(quote: Quote) {
    if (!this.authService.isAuthenticated()) { this.pendingAction.set({ type: quote.used_at ? 'unuse' : 'use', quote }); this.showPasswordModal.set(true); return; }
    this.doToggleUsed(quote);
  }

  deleteQuote(quote: Quote) {
    if (!confirm('Delete this quote?')) return;
    if (!this.authService.isAuthenticated()) { this.pendingAction.set({ type: 'delete', quote }); this.showPasswordModal.set(true); return; }
    this.doDelete(quote);
  }

  toggleNextUp(quote: Quote) {
    if (!this.authService.isAuthenticated()) { this.pendingAction.set({ type: 'nextup', quote }); this.showPasswordModal.set(true); return; }
    this.doToggleNextUp(quote);
  }

  editQuote(quote: Quote) {
    this.editingQuote.set(quote);
  }

  onQuoteSaved() {
    this.loadQuotes();
  }

  onAuthenticated(password: string) {
    this.showPasswordModal.set(false);
    const action = this.pendingAction();
    if (action) {
      if (action.type === 'delete') this.doDelete(action.quote);
      else if (action.type === 'nextup') this.doToggleNextUp(action.quote);
      else this.doToggleUsed(action.quote);
    }
    this.pendingAction.set(null);
  }

  private doToggleUsed(quote: Quote) {
    const password = this.authService.password();
    if (!password) return;
    const action$ = quote.used_at ? this.quoteService.markAsUnused(quote.id, password) : this.quoteService.markAsUsed(quote.id, password);
    action$.subscribe({
      next: () => this.loadQuotes(),
      error: (err) => { if (err.status === 401) { this.authService.clearPassword(); this.pendingAction.set({ type: quote.used_at ? 'unuse' : 'use', quote }); this.showPasswordModal.set(true); } }
    });
  }

  private doDelete(quote: Quote) {
    const password = this.authService.password();
    if (!password) return;
    this.quoteService.deleteQuote(quote.id, password).subscribe({
      next: () => this.loadQuotes(),
      error: (err) => { if (err.status === 401) { this.authService.clearPassword(); this.pendingAction.set({ type: 'delete', quote }); this.showPasswordModal.set(true); } }
    });
  }

  private doToggleNextUp(quote: Quote) {
    const password = this.authService.password();
    if (!password) return;
    this.quoteService.toggleNextUp(quote.id, password).subscribe({
      next: () => this.loadQuotes(),
      error: (err) => { if (err.status === 401) { this.authService.clearPassword(); this.pendingAction.set({ type: 'nextup', quote }); this.showPasswordModal.set(true); } }
    });
  }
}
