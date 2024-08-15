import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'db-add-page-btn',
  templateUrl: './add-page-btn.component.html',
  styleUrl: './add-page-btn.component.scss'
})
export class AddPageBtnComponent {
  @Output() addPage: EventEmitter<void> = new EventEmitter<void>();
  @Input() openRight = true;
  @Input() opened = false;
  @Input() disabled = false;

  onAddPage() {
    if (this.disabled) {
      return;
    }
    this.addPage.emit();
  }
}
