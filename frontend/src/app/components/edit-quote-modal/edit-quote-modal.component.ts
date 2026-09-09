import { Component, EventEmitter, Input, Output, OnInit, inject, signal, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteService, Quote } from '../../services/quote.service';
import { AuthService } from '../../services/auth.service';
import { PasswordModalComponent } from '../password-modal/password-modal.component';

@Component({
  selector: 'app-edit-quote-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <wa-card class="edit-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Edit Quote</h2>
          <wa-button variant="text" size="small" (click)="close.emit()">
            <wa-icon name="xmark"></wa-icon>
          </wa-button>
        </div>

        <form (ngSubmit)="submit()">
          <wa-input label="Source" [value]="form.source_name" (input)="form.source_name = $any($event).target.value" placeholder="Movie, TV show, comedian, etc." required>
            <wa-icon slot="prefix" name="film"></wa-icon>
          </wa-input>

          <wa-textarea label="Quote" [value]="form.quote_text" (input)="form.quote_text = $any($event).target.value" placeholder="Enter the quote..." rows="4" required resize="auto"></wa-textarea>

          <div class="form-row">
            <wa-input label="Speaker 1" [value]="form.speaker_1" (input)="form.speaker_1 = $any($event).target.value" placeholder="Who said it?">
              <wa-icon slot="prefix" name="user"></wa-icon>
            </wa-input>
            <wa-input label="Speaker 2" [value]="form.speaker_2" (input)="form.speaker_2 = $any($event).target.value" placeholder="Second speaker"></wa-input>
            <wa-input label="Speaker 3" [value]="form.speaker_3" (input)="form.speaker_3 = $any($event).target.value" placeholder="Third speaker"></wa-input>
          </div>

          <wa-input label="Contributor" [value]="form.contributor" (input)="form.contributor = $any($event).target.value" placeholder="Who added this quote?">
            <wa-icon slot="prefix" name="pencil"></wa-icon>
          </wa-input>

          <wa-input label="Tags (comma-separated, max 8)" [value]="tagsInput" (input)="tagsInput = $any($event).target.value" placeholder="comedy, classic, inspirational...">
            <wa-icon slot="prefix" name="tags"></wa-icon>
          </wa-input>

          <div class="image-upload-section">
            <label class="section-label">Quote Image</label>
            <div class="file-dropzone" [class.has-file]="previewUrl()" (click)="fileInput.click()">
              <input #fileInput type="file" accept="image/jpeg,image/png,image/gif,image/webp" (change)="onFileSelected($event)" style="display: none;" />

              @if (previewUrl()) {
                <div class="preview-wrapper" (click)="$event.stopPropagation()">
                  <img [src]="previewUrl()" [alt]="form.source_name || 'Quote preview'" class="preview-thumb" />
                  <div class="preview-details">
                    @if (selectedFile) {
                      <span class="file-name">{{ selectedFile.name }}</span>
                      <span class="file-size">{{ getFormattedFileSize() }}</span>
                    } @else {
                      <span class="file-name">Current image</span>
                    }
                    <wa-button type="button" variant="text" size="small" (click)="clearFile($event)" class="remove-btn">
                      <wa-icon slot="prefix" name="trash"></wa-icon>
                      Remove
                    </wa-button>
                  </div>
                </div>
              } @else {
                <div class="upload-placeholder">
                  <wa-icon name="image" class="upload-icon"></wa-icon>
                  <span>Click to choose an image (JPG, PNG, GIF, WEBP max 2MB)</span>
                </div>
              }
            </div>
          </div>

          <wa-textarea label="Notes" [value]="form.notes" (input)="form.notes = $any($event).target.value" placeholder="Any additional context..." rows="2" resize="auto"></wa-textarea>

          @if (error()) { <wa-callout variant="danger">{{ error() }}</wa-callout> }

          <div class="form-actions">
            <wa-button type="button" variant="neutral" (click)="close.emit()">
              Cancel
            </wa-button>
            <wa-button type="submit" variant="brand" [disabled]="submitting()" [loading]="submitting()">
              <wa-icon slot="prefix" name="check"></wa-icon>
              {{ submitting() ? 'Saving...' : 'Save Changes' }}
            </wa-button>
          </div>
        </form>

        @if (showPasswordModal()) {
          <app-password-modal (close)="showPasswordModal.set(false)" (authenticated)="onAuthenticated($event)" />
        }
      </wa-card>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .edit-modal {
      width: 100%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--wa-color-neutral-200);

      h2 { margin: 0; }
    }

    wa-input, wa-textarea { display: block; margin-bottom: 16px; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 16px; wa-input { margin-bottom: 0; } }
    wa-callout { margin-bottom: 16px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid var(--wa-color-neutral-200); }

    .image-upload-section {
      margin-bottom: 16px;
      .section-label {
        display: block;
        font-weight: 500;
        margin-bottom: 6px;
        font-size: 0.95rem;
      }
    }

    .file-dropzone {
      border: 2px dashed var(--wa-color-neutral-300);
      border-radius: 6px;
      padding: 16px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background-color 0.2s;

      &:hover {
        border-color: var(--wa-color-brand-600);
      }

      &.has-file {
        cursor: default;
        border-style: solid;
      }
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: var(--wa-color-neutral-600);
      font-size: 0.9rem;

      .upload-icon { font-size: 1.8rem; }
    }

    .preview-wrapper {
      display: flex;
      align-items: center;
      gap: 16px;
      text-align: left;
    }

    .preview-thumb {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid var(--wa-color-neutral-200);
      flex-shrink: 0;
    }

    .preview-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow: hidden;

      .file-name {
        font-weight: 500;
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .file-size {
        font-size: 0.8rem;
        color: var(--wa-color-neutral-600);
      }

      .remove-btn {
        align-self: flex-start;
        margin-top: 4px;
      }
    }
  `]
})
export class EditQuoteModalComponent implements OnInit {
  @Input() quote!: Quote;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private quoteService = inject(QuoteService);
  private authService = inject(AuthService);

  form = { source_name: '', quote_text: '', speaker_1: '', speaker_2: '', speaker_3: '', contributor: '', notes: '' };
  tagsInput = '';
  selectedFile: File | null = null;
  previewUrl = signal<string | null>(null);
  removeImage = false;
  submitting = signal(false);
  error = signal('');
  showPasswordModal = signal(false);

  ngOnInit() {
    this.form = {
      source_name: this.quote.source_name || '',
      quote_text: this.quote.quote_text || '',
      speaker_1: this.quote.speaker_1 || '',
      speaker_2: this.quote.speaker_2 || '',
      speaker_3: this.quote.speaker_3 || '',
      contributor: this.quote.contributor || '',
      notes: this.quote.notes || ''
    };
    this.tagsInput = (this.quote.tags || []).join(', ');

    if (this.quote.image_url) {
      this.previewUrl.set(this.quoteService.getImageUrl(this.quote));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        this.error.set('Image must be smaller than 2MB');
        return;
      }
      this.selectedFile = file;
      this.removeImage = false;
      this.error.set('');

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  clearFile(event?: Event) {
    if (event) event.stopPropagation();
    this.selectedFile = null;
    this.previewUrl.set(null);
    this.removeImage = true;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  getFormattedFileSize(): string {
    if (!this.selectedFile) return '';
    const bytes = this.selectedFile.size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  submit() {
    if (!this.form.source_name.trim() || !this.form.quote_text.trim()) {
      this.error.set('Source and quote are required');
      return;
    }
    if (!this.authService.isAuthenticated()) {
      this.showPasswordModal.set(true);
      return;
    }
    this.doSubmit();
  }

  onAuthenticated(password: string) {
    this.showPasswordModal.set(false);
    this.doSubmit();
  }

  private doSubmit() {
    const password = this.authService.password();
    if (!password) return;

    this.submitting.set(true);
    this.error.set('');

    const tags = this.tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t).slice(0, 8);

    let payload: Partial<any> | FormData;

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('source_name', this.form.source_name.trim());
      formData.append('quote_text', this.form.quote_text.trim());
      formData.append('speaker_1', this.form.speaker_1.trim());
      formData.append('speaker_2', this.form.speaker_2.trim());
      formData.append('speaker_3', this.form.speaker_3.trim());
      formData.append('contributor', this.form.contributor.trim());
      formData.append('notes', this.form.notes.trim());
      formData.append('tags', JSON.stringify(tags));
      formData.append('image', this.selectedFile);
      payload = formData;
    } else {
      payload = {
        source_name: this.form.source_name.trim(),
        quote_text: this.form.quote_text.trim(),
        speaker_1: this.form.speaker_1.trim(),
        speaker_2: this.form.speaker_2.trim(),
        speaker_3: this.form.speaker_3.trim(),
        contributor: this.form.contributor.trim(),
        notes: this.form.notes.trim(),
        tags,
        ...(this.removeImage ? { image_url: null } : {})
      };
    }

    this.quoteService.updateQuote(this.quote.id, payload, password).subscribe({
      next: () => {
        this.submitting.set(false);
        this.saved.emit();
        this.close.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 401) {
          this.authService.clearPassword();
          this.error.set('Invalid password.');
          this.showPasswordModal.set(true);
        } else {
          this.error.set(err.error?.error || 'Failed to update quote.');
        }
      }
    });
  }
}
