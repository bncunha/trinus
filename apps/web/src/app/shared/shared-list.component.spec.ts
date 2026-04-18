import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedListComponent } from './shared-list.component';

interface Item {
  id: string;
  name: string;
}

@Component({
  standalone: true,
  imports: [SharedListComponent],
  template: `
    <app-shared-list [items]="items" ariaLabel="Lista de teste" [trackBy]="trackById">
      <ng-template let-item let-index="index">
        <strong>{{ index }} - {{ item.name }}</strong>
      </ng-template>
    </app-shared-list>
  `
})
class HostComponent {
  items: Item[] = [
    { id: '1', name: 'Primeiro' },
    { id: '2', name: 'Segundo' }
  ];

  trackById(_index: number, item: Item): string {
    return item.id;
  }
}

describe('SharedListComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('renderiza itens com conteudo dinamico', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('ul')?.getAttribute('aria-label')).toBe('Lista de teste');
    expect(host.querySelectorAll('li')).toHaveLength(2);
    expect(host.textContent).toContain('0 - Primeiro');
    expect(host.textContent).toContain('1 - Segundo');
  });
});
