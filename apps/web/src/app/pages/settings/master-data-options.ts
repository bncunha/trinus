import type { SearchableSelectOption } from '../../shared/searchable-select/searchable-select.component';

export function activeOrSelected<T extends { id: string; isActive: boolean }>(items: T[], selectedId: string | null | undefined): T[] {
  return items.filter((item) => item.isActive || item.id === selectedId);
}

export function toOptions<T extends { id: string; name: string }>(items: T[], emptyLabel?: string): SearchableSelectOption[] {
  const options = items.map((item) => ({ value: item.id, label: item.name }));
  return emptyLabel ? [{ value: '', label: emptyLabel }, ...options] : options;
}
