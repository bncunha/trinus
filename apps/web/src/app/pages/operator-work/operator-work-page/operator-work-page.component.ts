import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-operator-work-page',
  standalone: true,
  templateUrl: './operator-work-page.component.html',
  styleUrl: './operator-work-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatorWorkPageComponent {}
