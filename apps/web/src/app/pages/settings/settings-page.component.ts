import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MasterDataService } from '../../services-api/master-data.service';

type SettingsShortcut = {
  title: string;
  description: string;
  route: string;
  count: number;
};

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent implements OnInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly masterDataService = inject(MasterDataService);

  protected isLoading = false;
  protected shortcuts: SettingsShortcut[] = [
    {
      title: 'Unidades de medida',
      description: 'Configure siglas usadas em capacidades e etapas.',
      route: '/configuracoes/unidades-medida',
      count: 0
    },
    {
      title: 'Variáveis',
      description: 'Cadastre parâmetros numéricos usados na produção.',
      route: '/configuracoes/variaveis',
      count: 0
    },
    {
      title: 'Setores',
      description: 'Organize as áreas produtivas da empresa.',
      route: '/configuracoes/setores',
      count: 0
    },
    {
      title: 'Etapas',
      description: 'Defina atividades, capacidade e vínculos produtivos.',
      route: '/configuracoes/etapas',
      count: 0
    },
    {
      title: 'Templates de produção',
      description: 'Monte fluxos ordenados de etapas recorrentes.',
      route: '/configuracoes/templates-producao',
      count: 0
    }
  ];

  ngOnInit(): void {
    this.loadCounts();
  }

  private loadCounts(): void {
    this.isLoading = true;
    forkJoin({
      units: this.masterDataService.listMeasurementUnits(),
      variables: this.masterDataService.listVariables(),
      sectors: this.masterDataService.listSectors(),
      stages: this.masterDataService.listStages(),
      templates: this.masterDataService.listTemplates()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ units, variables, sectors, stages, templates }) => {
          const counts = [units.length, variables.length, sectors.length, stages.length, templates.length];
          this.shortcuts = this.shortcuts.map((shortcut, index) => ({ ...shortcut, count: counts[index] }));
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }
      });
  }
}
