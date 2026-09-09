import { Component, EventEmitter, Output, inject, signal, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteService } from '../../services/quote.service';
import { AuthService } from '../../services/auth.service';
import { PasswordModalComponent } from '../password-modal/password-modal.component';

@Component({
  selector: 'app-add-quote',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="add-quote-container">
      <h2>Add a Quote</h2>
      <wa-card>
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

          <wa-input label="Your Name" [value]="form.contributor" (input)="form.contributor = $any($event).target.value" placeholder="Who's adding this quote?">
            <wa-icon slot="prefix" name="pencil"></wa-icon>
          </wa-input>

          <wa-input label="Tags (comma-separated, max 8)" [value]="tagsInput" (input)="tagsInput = $any($event).target.value" placeholder="comedy, classic, inspirational...">
            <wa-icon slot="prefix" name="tags"></wa-icon>
          </wa-input>

          <div class="image-upload-section">
            <label class="section-label">Quote Image (Optional)</label>
            <div class="file-dropzone" [class.has-file]="previewUrl()" (click)="fileInput.click()">
              <input #fileInput type="file" accept="image/jpeg,image/png,image/gif,image/webp" (change)="onFileSelected($event)" style="display: none;" />
              
              @if (previewUrl()) {
                <div class="preview-wrapper" (click)="$event.stopPropagation()">
                  <img [src]="previewUrl()" [alt]="form.source_name || 'Selected quote preview'" class="preview-thumb" />
                  <div class="preview-details">
                    <span class="file-name">{{ selectedFile?.name }}</span>
                    <span class="file-size">{{ getFormattedFileSize() }}</span>
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
                  <span class="default-hint">If no image is uploaded, the default thumbnail will be used.</span>
                </div>
              }
            </div>
          </div>

          <wa-textarea label="Notes" [value]="form.notes" (input)="form.notes = $any($event).target.value" placeholder="Any additional context..." rows="2" resize="auto"></wa-textarea>

          @if (error()) { <wa-callout variant="danger">{{ error() }}</wa-callout> }
          @if (success()) { <wa-callout variant="success">Quote added successfully!</wa-callout> }

          <div class="form-actions">
            <wa-button type="button" variant="neutral" (click)="reset()">
              <wa-icon slot="prefix" name="xmark"></wa-icon>
              Clear
            </wa-button>
            <wa-button type="submit" variant="brand" [disabled]="submitting()" [loading]="submitting()">
              <wa-icon slot="prefix" name="plus"></wa-icon>
              {{ submitting() ? 'Adding...' : 'Add Quote' }}
            </wa-button>
          </div>
        </form>
      </wa-card>
      @if (showPasswordModal()) { <app-password-modal (close)="showPasswordModal.set(false)" (authenticated)="onAuthenticated($event)" /> }
    </div>
  `,
  styles: [`
    .add-quote-container { padding: 20px 0; max-width: 700px; margin:auto;}
    h2 { margin-bottom: 20px; }
    wa-card { display: block; }
    wa-input, wa-textarea { display: block; margin-bottom: 16px; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 16px; wa-input { margin-bottom: 0; } }
    wa-callout { margin-bottom: 16px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid var(--wa-color-neutral-200); }

    .image-upload-section {
      margin-bottom: 16px;
      .section-label {
        display: block;
        font-weight: 500;
        color: var(--color-dark-brown);
        margin-bottom: 6px;
        font-size: 0.95rem;
      }
    }

    .file-dropzone {
      border: 2px dashed var(--wa-color-neutral-300);
      border-radius: var(--radius-sm, 6px);
      padding: 16px;
      text-align: center;
      background: var(--color-light-bg, #fdfaf6);
      cursor: pointer;
      transition: border-color 0.2s, background-color 0.2s;

      &:hover {
        border-color: var(--color-brown, #75b058);
        background: #f9f5ee;
      }

      &.has-file {
        cursor: default;
        border-style: solid;
        border-color: var(--wa-color-neutral-300);
        background: #fff;
      }
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: var(--color-text-light);
      font-size: 0.9rem;

      .upload-icon {
        font-size: 1.8rem;
        color: var(--color-brown);
      }

      .default-hint {
        font-size: 0.8rem;
        opacity: 0.75;
      }
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
        color: var(--color-text-light);
      }

      .remove-btn {
        align-self: flex-start;
        margin-top: 4px;
        --wa-color-neutral-600: var(--wa-color-danger-600);
      }
    }
  `]
})
export class AddQuoteComponent {
  @Output() quoteAdded = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  private quoteService = inject(QuoteService);
  private authService = inject(AuthService);

  form = { source_name: '', quote_text: '', speaker_1: '', speaker_2: '', speaker_3: '', contributor: '', notes: '' };
  tagsInput = '';
  selectedFile: File | null = null;
  previewUrl = signal<string | null>(null);
  submitting = signal(false);
  error = signal('');
  success = signal(false);
  showPasswordModal = signal(false);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        this.error.set('Image must be smaller than 2MB');
        return;
      }
      this.selectedFile = file;
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
    if (!this.form.source_name.trim() || !this.form.quote_text.trim()) { this.error.set('Source and quote are required'); return; }
    if (!this.authService.isAuthenticated()) { this.showPasswordModal.set(true); return; }
    this.doSubmit();
  }

  onAuthenticated(password: string) { this.showPasswordModal.set(false); this.doSubmit(); }

  private doSubmit() {
    const password = this.authService.password();
    if (!password) return;
    this.submitting.set(true); this.error.set(''); this.success.set(false);
    const tags = this.tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t).slice(0, 8);

    let payload: Partial<any> | FormData;

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('source_name', this.form.source_name.trim());
      formData.append('quote_text', this.form.quote_text.trim());
      if (this.form.speaker_1.trim()) formData.append('speaker_1', this.form.speaker_1.trim());
      if (this.form.speaker_2.trim()) formData.append('speaker_2', this.form.speaker_2.trim());
      if (this.form.speaker_3.trim()) formData.append('speaker_3', this.form.speaker_3.trim());
      if (this.form.contributor.trim()) formData.append('contributor', this.form.contributor.trim());
      if (this.form.notes.trim()) formData.append('notes', this.form.notes.trim());
      formData.append('tags', JSON.stringify(tags));
      formData.append('image', this.selectedFile);
      payload = formData;
    } else {
      payload = { ...this.form, tags };
    }

    this.quoteService.addQuote(payload, password).subscribe({
      next: () => {
        this.success.set(true);
        this.reset();
        this.submitting.set(false);
        this.quoteAdded.emit();
        setTimeout(() => this.success.set(false), 3000);
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 401) {
          this.authService.clearPassword();
          this.error.set('Invalid password.');
          this.showPasswordModal.set(true);
        } else {
          this.error.set(err.error?.error || 'Failed to add quote.');
        }
      }
    });
  }

  reset() {
    this.form = { source_name: '', quote_text: '', speaker_1: '', speaker_2: '', speaker_3: '', contributor: '', notes: '' };
    this.tagsInput = '';
    this.clearFile();
    this.error.set('');
  }
}

