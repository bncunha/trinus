import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from '../shared/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ConfirmDialogComponent, RouterOutlet, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
