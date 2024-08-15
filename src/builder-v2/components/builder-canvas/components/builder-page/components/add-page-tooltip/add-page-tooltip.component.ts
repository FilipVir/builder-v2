import {Component, EventEmitter, Output} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'db-add-page-tooltip',
  templateUrl: './add-page-tooltip.component.html',
  styleUrl: './add-page-tooltip.component.scss'
})
export class AddPageTooltipComponent {
  @Output() addPage: EventEmitter<string> = new EventEmitter<string>();
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  nameControl = new FormControl('', [Validators.required]);

  proceed(name: string) {
    this.addPage.emit(name);
  }
}
