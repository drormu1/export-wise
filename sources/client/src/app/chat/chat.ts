import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { ChatMessage } from '../models/api.models';

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

    const id = Number(text);
    if (!Number.isInteger(id) || id <= 0) {
      this.push({ role: 'assistant', text: 'יש להזין מזהה יצרן מספרי (למשל 1)', state: 'error' });
      return;
    }

    const assistantId = this.push({ role: 'assistant', text: '', state: 'loading' });
    this.sending.set(true);

    this.api.askForProducts(text).subscribe({
      next: (res) => {
        if (res.products.length === 0) {
          this.patch(assistantId, {
            state: 'empty',
            manufacturer: res.manufacturer,
            text: `אין מוצרים ליצרן ${res.manufacturer.name}`,
          });
        } else {
          this.patch(assistantId, {
            state: 'ok',
            manufacturer: res.manufacturer,
            products: res.products,
            text: `המוצרים של ${res.manufacturer.name}`,
          });
        }
        this.sending.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.status === 404 ? `לא נמצא יצרן עם מזהה ${text}` : 'שגיאת רשת — נסה שוב';
        this.patch(assistantId, { state: 'error', text: msg });
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
