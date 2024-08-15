import {ChangeDetectionStrategy, Component, EventEmitter, HostListener, inject, Input, Output} from '@angular/core';
import {BuilderSectionsInteractionService} from "../../builder-sections-interaction.service";
import {TriggersService} from "../../services/triggers.service";
import {CanvasZoomService} from "../../services/canvas-zoom.service";

@Component({
  selector: 'db-zoom-controller',
  templateUrl: './zoom-controller.component.html',
  styleUrl: './zoom-controller.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZoomControllerComponent {
  @Input() zoomLevel: number = 100;
  @Input() minZoomLevel: number = 30;
  @Input() maxZoomLevel: number = 250;
  @Output() zoomLevelChange = new EventEmitter<number>();
  tooltipOpened = false;
  zoomStep = 15;
  triggersService: TriggersService = inject(TriggersService);
  canvasZoomService = inject(CanvasZoomService);

  @HostListener('document:keydown.control.+', ['$event'])
  @HostListener('document:keydown.meta.=', ['$event'])
  zoomIn(event: KeyboardEvent) {
    event.preventDefault();
    this.updateValue(this.zoomLevel + this.zoomStep);
  }

  @HostListener('document:keydown.control.-', ['$event'])
  @HostListener('document:keydown.meta.-', ['$event'])
  zoomOut(event: KeyboardEvent) {
    if (this._builderInteractionsService.isSectionEdit) {
      return;
    }
    event.preventDefault();
    this.updateValue(this.zoomLevel - this.zoomStep);
  }

  @HostListener('document:keydown.control.0', ['$event'])
  @HostListener('document:keydown.meta.0', ['$event'])
  zoomReset(event: KeyboardEvent) {
    if (this._builderInteractionsService.isSectionEdit) {
      return;
    }
    event.preventDefault();
    this.updateValue(100);
  }

  @HostListener('document:keydown.shift.!', ['$event'])
  @HostListener('document:keydown.control.1', ['$event'])
  zoomToFitKeys(event: KeyboardEvent) {
    if (this._builderInteractionsService.isSectionEdit) {
      return;
    }
    event.preventDefault();
    this.triggersService.fitToScreen.next();
  }

  constructor(private _builderInteractionsService: BuilderSectionsInteractionService) {
  }

  updateValue(value: number) {
    if ((value < this.minZoomLevel) || (value > this.maxZoomLevel)) {
      return;
    }

    this.zoomLevel = value;
    this.zoomLevelChange.emit(value); // for later improvements
  }
}
