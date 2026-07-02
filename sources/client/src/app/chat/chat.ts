import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { ChatMessage, SearchMode } from '../models/api.models';

@Component({
  selector: 'app-chat',
  imports: [],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  private readonly api = inject(ApiService);

  readonly messages = signal<ChatMessage[]>([]);
  readonly sending = signal(false);
  readonly mode = signal<SearchMode>('smart');
  private nextId = 0;

  private readonly scroll = viewChild<ElementRef<HTMLDivElement>>('scroll');

  constructor() {
    // Auto-scroll to the newest message whenever the list changes.
    effect(() => {
      this.messages();
      const el = this.scroll()?.nativeElement;
      if (el) {
        setTimeout(() => (el.scrollTop = el.scrollHeight));
      }
    });
  }

  setMode(mode: SearchMode): void {
    this.mode.set(mode);
  }

  /** Enter sends; Shift+Enter inserts a newline. */
  onEnter(event: Event, box: HTMLTextAreaElement): void {
    const ke = event as KeyboardEvent;
    if (ke.shiftKey) {
      return;
    }
    ke.preventDefault();
    this.submit(box);
  }

  submit(box: HTMLTextAreaElement): void {
    this.send(box.value);
    box.value = '';
    box.style.height = 'auto';
  }

  autosize(box: HTMLTextAreaElement): void {
    box.style.height = 'auto';
    box.style.height = Math.min(box.scrollHeight, 160) + 'px';
  }

  send(raw: string): void {
    const text = raw.trim();
    if (!text || this.sending()) {
      return;
    }

    this.push({ role: 'user', text });

    const assistantId = this.push({ role: 'assistant', text: '', state: 'loading' });
    this.sending.set(true);

    if (this.mode() === 'smart') {
      this.smartSearch(text, assistantId);
      return;
    }

    // Exact (SQL) search.
    this.api.searchProducts(text).subscribe({
      next: (res) => {
        if (res.count === 0) {
          this.patch(assistantId, { state: 'empty', text: `לא נמצאו מוצרים עבור "${text}"` });
        } else {
          this.patch(assistantId, {
            state: 'ok',
            products: res.products,
            text: `נמצאו ${res.count} מוצרים עבור "${text}"`,
          });
        }
        this.sending.set(false);
      },
      error: (_err: HttpErrorResponse) => {
        this.patch(assistantId, { state: 'error', text: 'שגיאת רשת — נסה שוב' });
        this.sending.set(false);
      },
    });
  }

  /** Smart (semantic) search: retrieve similar historical committee decisions. */
  private smartSearch(text: string, assistantId: number): void {
    this.api.semanticSearch(text).subscribe({
      next: (res) => {
        if (res.count === 0) {
          this.patch(assistantId, {
            state: 'empty',
            text: `לא נמצאו החלטות דומות עבור "${text}"`,
          });
        } else {
          this.patch(assistantId, {
            state: 'ok',
            cases: res.results,
            disclaimer: res.disclaimer,
            text: `נמצאו ${res.count} החלטות דומות עבור "${text}"`,
          });
        }
        this.sending.set(false);
      },
      error: (err: HttpErrorResponse) => {
        // 503 => embedding service (Ollama) is down; anything else is a generic failure.
        const message =
          err.status === 503
            ? 'שירות החיפוש הסמנטי אינו זמין כרגע (מנוע ה‑embeddings). נסה שוב מאוחר יותר.'
            : 'שגיאת רשת — נסה שוב';
        this.patch(assistantId, { state: 'error', text: message });
        this.sending.set(false);
      },
    });
  }

  private push(message: Omit<ChatMessage, 'id'>): number {
    const id = ++this.nextId;
    this.messages.update((list) => [...list, { ...message, id }]);
    return id;
  }

  private patch(id: number, patch: Partial<ChatMessage>): void {
    this.messages.update((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
}
