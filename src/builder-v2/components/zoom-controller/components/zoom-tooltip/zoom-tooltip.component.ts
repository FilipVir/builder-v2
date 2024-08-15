import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

@Component({
  selector: 'db-zoom-tooltip',
  templateUrl: './zoom-tooltip.component.html',
  styleUrl: './zoom-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoomTooltipComponent implements OnInit, AfterViewInit {
  @Output() changeZoom: EventEmitter<number> = new EventEmitter<number>();
  @Output() zoomByStep: EventEmitter<number> = new EventEmitter<number>();
  @Output() zoomToFit: EventEmitter<void> = new EventEmitter<void>();
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  options = {
    firstSection: [
      {
        title: 'Zoom in',
        icons: {
          win: ['db-icon-ds-win-zoom-in'],
          mac: ['db-icon-ds-mac-zoom-in']
        },
        action: (() => this.zoomByStep.emit(1)).bind(this)
      },
      {
        title: 'Zoom out',
        icons: {
          win: ['db-icon-ds-win-zoom-out'],
          mac: ['db-icon-ds-mac-zoom-out']
        },
        action: (() => this.zoomByStep.emit(-1)).bind(this)
      },
      {
        title: 'Zoom to fit',
        icons: {
          win: ['db-icon-ds-win-zoom-to-fit'],
          mac: ['db-icon-ds-mac-zoom-to-fit']
        },
        action: (() => this.zoomToFit.emit()).bind(this)
      }
    ],
    secondSection: [
      {
        title: '200%',
        icons: {
          win: [],
          mac: []
        },
        action: (() => this.changeZoom.emit(200)).bind(this)
      },
      {
        title: '100%',
        icons: {
          win: ['db-icon-ds-win-full-size'],
          mac: ['db-icon-ds-mac-full-size']
        },
        action: (() => this.changeZoom.emit(100)).bind(this)
      },
      {
        title: '50%',
        icons: {
          win: [],
          mac: []
        },
        action: (() => this.changeZoom.emit(50)).bind(this)
      },
    ]
  };
  opened = false;
  constructor(private elRef: ElementRef) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.opened = true;
    });
      this.elRef.nativeElement.querySelectorAll('.tools-container .tool > div').forEach(item => {
        item.addEventListener('mouseover', () => {
          item.classList.add('hovered');
          this.elRef.nativeElement.querySelectorAll('.tools-container .tool > div').forEach(sibling => {
            if (sibling !== item) {
              sibling.classList.add('not-hovered');
            }
          });
        });

        item.addEventListener('mouseout', () => {
          item.classList.remove('hovered');
          this.elRef.nativeElement.querySelectorAll('.tools-container .tool > div').forEach(sibling => {
            sibling.classList.remove('not-hovered');
          });
        });
      });
  }
}
