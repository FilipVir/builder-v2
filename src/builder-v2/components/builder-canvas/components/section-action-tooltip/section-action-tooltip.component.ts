import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'db-section-action-tooltip',
  templateUrl: './section-action-tooltip.component.html',
  styleUrl: './section-action-tooltip.component.scss'
})
export class SectionActionTooltipComponent implements OnInit {
  @Output() duplicate: EventEmitter<void> = new EventEmitter<void>();
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  @Output() addSection: EventEmitter<number> = new EventEmitter<number>();
  @Input() limitPassed: boolean;
  options = [
    {
      title: 'Duplicate',
      icons: {
        win: ['db-icon-ds-win-duplicate'],
        mac: ['db-icon-ds-mac-duplicate'],
      },
      action: (() => this.duplicate.emit()).bind(this),
      canDisable: true
    },
    {
      title: 'Delete',
      icons: {
        win: ['db-icon-ds-backspace'],
        mac: ['db-icon-ds-backspace'],
      },
      action: (() => this.delete.emit()).bind(this)
    },
    {
      title: 'Add section above',
      icons: {
        win: [],
        mac: [],
      },
      action: (() => this.addSection.emit(0)).bind(this),
      canDisable: true
    },
    {
      title: 'Add section below',
      icons: {
        win: ['db-icon-ds-win-add-below'],
        mac: ['db-icon-ds-mac-add-below'],
      },
      action: (() => this.addSection.emit(1)).bind(this),
      canDisable: true
    }
  ];

  ngOnInit() {
  }

}
