import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'db-change-page-type-tooltip',
  templateUrl: './change-page-type-tooltip.component.html',
  styleUrl: './change-page-type-tooltip.component.scss'
})
export class ChangePageTypeTooltipComponent {
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() regenerate: EventEmitter<void> = new EventEmitter<void>();
}
