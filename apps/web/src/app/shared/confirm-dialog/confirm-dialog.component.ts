import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  protected readonly confirmDialogService = inject(ConfirmDialogService);
}
