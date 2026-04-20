import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../../services-api/auth.service';
import { OrdersService } from '../../../services-api/orders.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [AsyncPipe, CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ordersService = inject(OrdersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly session$ = this.authService.session$;
  protected readonly pageData$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    startWith(null),
    map(() => this.getDeepestRouteData())
  );
  protected errorMessage = '';
  protected isLoadingOrders = false;
  protected readonly roleLabels = {
    ADMIN: 'Administrador',
    MANAGER: 'Gestor',
    OPERATOR: 'Operador'
  } as const;

  ngOnInit(): void {
    this.loadOrders();
  }

  protected logout(): void {
    this.errorMessage = '';
    this.authService.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.ordersService.resetOrders();
        void this.router.navigateByUrl('/login');
      },
      error: () => {
        this.errorMessage = 'Não foi possível sair agora.';
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  private loadOrders(): void {
    this.isLoadingOrders = true;
    this.ordersService
      .loadOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoadingOrders = false;
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.isLoadingOrders = false;
          this.errorMessage = 'Não foi possível carregar os pedidos.';
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private getDeepestRouteData(): { eyebrow: string; title: string } {
    let route = this.route.firstChild;

    while (route?.firstChild) {
      route = route.firstChild;
    }

    return {
      eyebrow: route?.snapshot.data['eyebrow'] ?? 'Trinus',
      title: route?.snapshot.data['title'] ?? 'Dashboard'
    };
  }
}
