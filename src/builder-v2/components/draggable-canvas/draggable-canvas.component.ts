import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ContentChild, DestroyRef,
  EventEmitter,
  HostListener, inject,
  Input, OnInit,
  Output,
  Renderer2
} from '@angular/core';
import {Observable} from "rxjs/internal/Observable";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {CanvasZoomService} from "../../services/canvas-zoom.service";
import {TriggersService} from "../../services/triggers.service";

@Component({
  selector: 'db-draggable-canvas',
  templateUrl: './draggable-canvas.component.html',
  styleUrl: './draggable-canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DraggableCanvasComponent implements AfterViewInit, OnInit {
  private _destroyRef = inject(DestroyRef);
  private _canvasZoomService: CanvasZoomService = inject(CanvasZoomService);
  private _triggerService: TriggersService = inject(TriggersService);
  private _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  isDragging: boolean;
  mouseDragMode: boolean;
  _scale: number = 1;
  _positionX: number = 0;
  _positionY: number = 0;
  draggableElement: HTMLElement;
  private _lastMouseX: number;
  private _lastMouseY: number;
  private _scaleInPercentage = 100;
  @ContentChild('projected', {static: false}) projectedContent;
  @Output() canvasScale: EventEmitter<number> = new EventEmitter<number>();
  @Output() smoothTransition: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() isMobile: boolean;

  @Input() set scaleLevel(level: number) {
    this.scaleInPercentage = level;
  }

  ngOnInit() {
    this._listenFitToScreen();
    this._listenMinZoomTrigger();
    this._listenScrollToSection();
  }

  private _listenMinZoomTrigger() {
    this._triggerService.calculateMinZoom
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(this._setGlobalZoomLevel.bind(this));
  }

  private _listenFitToScreen() {
    this._triggerService.fitToScreen
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(this.fitToScreen.bind(this));
  }

  private _setGlobalZoomLevel() {
    setTimeout(() => {
      const scaleInPercentage = this._getPageFitScale() * 100;
      this._canvasZoomService.minZoom.next(scaleInPercentage);
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space' && !this.mouseDragMode) {
      this.mouseDragMode = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.code === 'Space') {
      this.mouseDragMode = false;
    }
  }

  public set scale(value: number) {
    this._scale = value;
    this._canvasZoomService.scale.next(this._scale);
    this.transformElement();
  }

  public get scale() {
    return this._scale;
  }

  public set positionX(value: number) {
    this._positionX = value;
    this.transformElement();
  }

  public set positionY(value: number) {
    this._positionY = value;
    this.transformElement();
  }

  public get positionX() {
    return this._positionX;
  }

  public get positionY() {
    return this._positionY;
  }

  set scaleInPercentage(percentage: number) {
    this.scale = percentage / 100;
    if (percentage !== this._scaleInPercentage) {
      this.canvasScale.emit(percentage);
    }
    this._scaleInPercentage = percentage;
  }

  get scaleInPercentage(): number {
    return this._scaleInPercentage;
  }

  onMouseUp(event: MouseEvent) {
    this.isDragging = false;
  }

  onMouseDown(event: MouseEvent) {
    if (!this.mouseDragMode) {
      return;
    }
    event.preventDefault();
    document.activeElement['blur']();
    this.isDragging = true;
    this._lastMouseX = event.clientX;
    this._lastMouseY = event.clientY;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) {
      return;
    }
    event.preventDefault();
    const deltaX = event.clientX - this._lastMouseX;
    const deltaY = event.clientY - this._lastMouseY;
    this.positionX += deltaX * 1.5;
    this.positionY += deltaY * 1.5;

    this._lastMouseX = event.clientX;
    this._lastMouseY = event.clientY;
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const isMouseWheel = event.deltaY === 100 || event.deltaY === -100;
    const isPinch = event['wheelDelta'] === 120 || event['wheelDelta'] === -120;
    // control pinch and vertical move actions
    if (this._isDecimal(event.deltaY) || isMouseWheel) {
      const deltaY = isMouseWheel ? event.deltaY / 10 : event.deltaY;
      this.scale += deltaY * -0.01;
      this.scale = Math.min(Math.max(this._canvasZoomService.minZoom.value / 100, this.scale), 2.5);
    } else {
      this.positionY += event.deltaY * -0.9;
      this.positionY = Math.min(Math.max(-10000, this.positionY), 10000);
    }

    this.positionX += event.deltaX * -0.9;
    this.positionX = Math.min(Math.max(-10000, this.positionX), 10000);
    this.scaleInPercentage = Math.floor(this.scale * 100);
  }

  private _isDecimal(num): boolean {
    return !Number.isInteger(num);
  }

  ngAfterViewInit() {
    this.draggableElement = document.getElementById('draggable');
  }

  transformElement() {
    if (this.draggableElement) {
      this.draggableElement.style.transform = `scale(${this.scale}) translate(${this.positionX}px, ${this.positionY}px)`;
    }
  }

  fitToScreen() {
    const builderCanvas = document.getElementById('draggable');
    this.scale = this._getPageFitScale();
    builderCanvas.style.transformOrigin = 'top center';
    this.scaleInPercentage = Math.floor(this.scale * 100);
    this.positionY = 0;
    this.positionX = 0;
    this._setGlobalZoomLevel();
  }

  private _getPageFitScale(): number {
    const container = this.projectedContent.nativeElement;
    const builderCanvas = document.getElementById('draggable');
    const containerWidth = container?.clientWidth;
    const containerHeight = container?.clientHeight - 75;
    const canvasWidth = builderCanvas?.clientWidth;
    // const canvasHeight = builderCanvas.clientHeight + (!!this.isMobile ? 1700 : 350);
    const canvasHeight = builderCanvas?.clientHeight + 50;
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    return Math.min(scaleX, scaleY);
  }

  private _listenScrollToSection() {
    this._triggerService.scrollToSection
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(sectionId => {
        this._moveToSection(sectionId);
      });
  }

  private _moveToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }
    this.smoothTransition.emit(true);
    this.positionY = -section.offsetTop;
    this._cdr.markForCheck();
    setTimeout(() => {
      this.smoothTransition.emit(false);
    });
  }

}
