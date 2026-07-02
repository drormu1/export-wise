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
  readonly mode = signal<SearchMode>('exact');
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

    // Smart (semantic) mode is not wired to a vector backend yet.
    if (this.mode() === 'smart') {
      this.push({
        role: 'assistant',
        text: 'חיפוש סמנטי (AI) יתווסף בקרוב — יבוסס על מנוע חיפוש וקטורי. בינתיים השתמש במצב "מדויק".',
        state: 'info',
      });
      return;
    }

    // Exact (SQL) search.
    const assistantId = this.push({ role: 'assistant', text: '', state: 'loading' });
    this.sending.set(true);

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

  private push(message: Omit<ChatMessage, 'id'>): number {
    const id = ++this.nextId;
    this.messages.update((list) => [...list, { ...message, id }]);
    return id;
  }

  private patch(id: number, patch: Partial<ChatMessage>): void {
    this.messages.update((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
}
