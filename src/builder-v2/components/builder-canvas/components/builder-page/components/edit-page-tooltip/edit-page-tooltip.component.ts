import {AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Output} from '@angular/core';
import {close} from "node:fs";

@Component({
  selector: 'db-edit-page-tooltip',
  templateUrl: './edit-page-tooltip.component.html',
  styleUrl: './edit-page-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPageTooltipComponent implements AfterViewInit {
  @Output() addPage: EventEmitter<void> = new EventEmitter<void>();
  @Output() renamePage: EventEmitter<void> = new EventEmitter<void>();
  @Output() deletePage: EventEmitter<void> = new EventEmitter<void>();
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  options = {
    firstSection: [
      {
        title: 'Rename',
        icons: {
          win: [],
          mac: []
        },
        action: (() => this.renamePage.emit()).bind(this)
      },
      {
        title: 'Delete',
        icons: {
          win: [],
          mac: [],
        },
        action: (() => this.deletePage.emit()).bind(this)
      },
    ],
    secondSection: []
  };
  opened: boolean;


  ngAfterViewInit() {
    setTimeout(() => {
      this.opened = true;
    });
  }
}
