import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type FlashMessage = {
  kind: 'success' | 'error';
  text: string;
};

@Injectable({
  providedIn: 'root'
})
export class FlashMessageService {
  private readonly messageSubject = new BehaviorSubject<FlashMessage | null>(null);

  readonly message$ = this.messageSubject.asObservable();

  show(message: FlashMessage): void {
    this.messageSubject.next(message);
  }

  clear(): void {
    this.messageSubject.next(null);
  }
}
