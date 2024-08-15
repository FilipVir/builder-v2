import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef, EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  WritableSignal
} from '@angular/core';
import {BuilderTourEnum} from "../../builder-tour.enum";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {BuilderSectionsInteractionService} from "../../builder-sections-interaction.service";
import {BuilderGeneratedPageI} from "../../builder-v2.interface";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {CanvasZoomService} from "../../services/canvas-zoom.service";
import {TriggersService} from "../../services/triggers.service";

@Component({
  selector: 'db-builder-outline',
  templateUrl: './builder-outline.component.html',
  styleUrl: './builder-outline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInOut', [
      state('true', style({transform: 'translateX(0)', opacity: 1})),
      state('false', style({transform: 'translateX(100%)', opacity: 0})),
      transition('false => true', [
        style({transform: 'translateX(100%)', opacity: 0}),
        animate('0.2s ease-out')
      ]),
      transition('true => false', [
        animate('0.2s ease-out', style({transform: 'translateX(100%)', opacity: 0}))
      ])
    ])
  ],
  providers: [CanvasZoomService]
})
export class BuilderOutlineComponent implements OnInit {
  get scaleInPercentage(): number {
    return this._scaleInPercentage;
  }

  set scaleInPercentage(value: number) {
    this._scaleInPercentage = value;
  }

  tourEnum = BuilderTourEnum;
  showCustomization: boolean = false;
  builderInteractionsService = inject(BuilderSectionsInteractionService);
  canvasZoomService = inject(CanvasZoomService);
  _destroyRef = inject(DestroyRef);
  _triggerService = inject(TriggersService);
  @Input() popupMode: boolean = false;
  @Input() user;
  @Input() tourStep: number;
  @Input() uniqueId: string;
  @Input() isMobile: boolean;
  @Input() outline: BuilderGeneratedPageI;
  coverSteps: number[] = [BuilderTourEnum.OUTLINE_POPUP, BuilderTourEnum.PAGE_BUILDER, BuilderTourEnum.CUSTOMIZER, BuilderTourEnum.GENERATION];
  isSmoothTransition: boolean;
  accentZIndex = 20;
  private _scaleInPercentage: number = 100;
  @Output() onGenerate: EventEmitter<void> = new EventEmitter();
  @Output() openMagicLink: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit() {
    this._listenSectionsLoaded();
  }

  private _listenSectionsLoaded() {
    this.builderInteractionsService.pageLoaded
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._triggerService.calculateMinZoom.next();
        !!this.isMobile && this._triggerService.fitToScreen.next();
      });
  }

}
