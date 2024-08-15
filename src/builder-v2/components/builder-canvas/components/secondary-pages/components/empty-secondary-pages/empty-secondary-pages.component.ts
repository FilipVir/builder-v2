import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'db-empty-secondary-pages',
  templateUrl: './empty-secondary-pages.component.html',
  styleUrl: './empty-secondary-pages.component.scss'
})
export class EmptySecondaryPagesComponent {
  @Output() onAddPage: EventEmitter<string> = new EventEmitter<string>();
  showAddPageTooltip: boolean;
}
