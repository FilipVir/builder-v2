import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'db-add-section-btn',
  templateUrl: './add-section-btn.component.html',
  styleUrl: './add-section-btn.component.scss'
})
export class AddSectionBtnComponent {
  @Output() onAddSection: EventEmitter<void> = new EventEmitter<void>();

}
