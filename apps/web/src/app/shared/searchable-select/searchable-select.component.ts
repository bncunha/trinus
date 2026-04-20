import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  forwardRef,
  inject
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true
    }
  ],
  templateUrl: './searchable-select.component.html',
  styleUrl: './searchable-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchableSelectComponent implements ControlValueAccessor {
  private static nextId = 0;
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input() options: SearchableSelectOption[] = [];
  @Input() placeholder = 'Selecione';
  @Input() searchPlaceholder = 'Filtrar opções';
  @Input() ariaLabel = 'Selecionar opção';

  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

  protected readonly listboxId = `searchable-select-${SearchableSelectComponent.nextId++}`;
  protected value = '';
  protected filter = '';
  protected isOpen = false;
  protected isDisabled = false;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected get selectedOption(): SearchableSelectOption | undefined {
    return this.options.find((option) => option.value === this.value);
  }

  protected get filteredOptions(): SearchableSelectOption[] {
    const normalizedFilter = this.normalize(this.filter);

    return normalizedFilter ? this.options.filter((option) => this.normalize(option.label).includes(normalizedFilter)) : this.options;
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(onChange: (value: string) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }

  protected toggle(): void {
    if (this.isDisabled) {
      return;
    }

    this.isOpen ? this.close() : this.open();
  }

  protected select(option: SearchableSelectOption): void {
    this.value = option.value;
    this.onChange(option.value);
    this.close();
    this.changeDetectorRef.markForCheck();
  }

  protected updateFilter(event: Event): void {
    this.filter = (event.target as HTMLInputElement).value;
  }

  @HostListener('document:click', ['$event'])
  protected closeOnOutsideClick(event: MouseEvent): void {
    if (this.isOpen && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
      this.changeDetectorRef.markForCheck();
    }
  }

  @HostListener('keydown.enter', ['$event'])
  protected preventFormSubmit(event: KeyboardEvent): void {
    event.stopPropagation();
  }

  private open(): void {
    this.isOpen = true;
    this.filter = '';
    this.changeDetectorRef.markForCheck();
    window.setTimeout(() => this.searchInput?.nativeElement.focus());
  }

  private close(): void {
    this.isOpen = false;
    this.filter = '';
    this.onTouched();
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
