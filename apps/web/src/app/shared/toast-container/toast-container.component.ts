import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
