import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef, type TrackByFunction } from '@angular/core';

export interface SharedListItemContext<T> {
  $implicit: T;
  index: number;
}

@Component({
  selector: 'app-shared-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ul class="shared-list" *ngIf="itemTemplate as template" [attr.aria-label]="ariaLabel || null">
      <li class="shared-list__item" *ngFor="let item of normalizedItems; let index = index; trackBy: trackByItem">
        <ng-container *ngTemplateOutlet="template; context: { $implicit: item, index: index }"></ng-container>
      </li>
    </ul>
  `,
  styles: [
    `
      .shared-list {
        display: grid;
        gap: 14px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .shared-list__item {
        padding: 16px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: #fbfcfc;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharedListComponent<T> {
  @Input() items: readonly T[] | null = [];
  @Input() ariaLabel = '';
  @Input() trackBy: TrackByFunction<T> = (_index, item) => item;

  @ContentChild(TemplateRef) protected itemTemplate?: TemplateRef<SharedListItemContext<T>>;

  protected get normalizedItems(): readonly T[] {
    return this.items ?? [];
  }

  protected readonly trackByItem = (index: number, item: T): unknown => this.trackBy(index, item);
}
