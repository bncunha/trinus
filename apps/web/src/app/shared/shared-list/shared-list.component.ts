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
  templateUrl: './shared-list.component.html',
  styleUrl: './shared-list.component.css',
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
