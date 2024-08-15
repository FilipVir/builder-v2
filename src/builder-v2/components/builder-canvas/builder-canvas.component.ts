import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output, Renderer2, SimpleChanges
} from '@angular/core';
import {BuilderSectionsInteractionService} from "../../builder-sections-interaction.service";
import {map} from "rxjs/operators";
import {Observable} from "rxjs/internal/Observable";
import {BuilderHistoryService} from "../../builder-history.service";
import {BuilderTourEnum} from "../../builder-tour.enum";
import {DbActiveModal} from "../../../modules/modal/modal-ref";
import {BuilderV2Service} from "../../builder-v2.service";
import {PageMetaI, SectionTemplateI} from "../../builder-v2.interface";
import {DragHelperService} from "../../services/drag-helper.service";
import {CanvasZoomService} from "../../services/canvas-zoom.service";

@Component({
  selector: 'db-builder-canvas',
  templateUrl: './builder-canvas.component.html',
  styleUrl: './builder-canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuilderCanvasComponent implements OnInit {
  @Output() zoomToFit: EventEmitter<void> = new EventEmitter<void>();
  @Input() pageMeta: PageMetaI[] = [];
  @Input() popupMode;
  @Input() isMobile = false;
  @Input() user;
  @Output() openMagicLink: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() set uniqueId(uniqueId: string) {
    if (!uniqueId) {
      return;
    }
    this.uniqueIdValue = uniqueId;
    this._getTemplatesList(uniqueId);
  }

  uniqueIdValue: string;
  sectionsLoaded$: Observable<boolean> = inject(BuilderSectionsInteractionService).pageLoaded.pipe(map(() => true));
  tourStep = inject(BuilderHistoryService).tourStep;
  tourSteps = BuilderTourEnum;
  sectionTemplates: SectionTemplateI[] = [];

  constructor(private _builderService: BuilderV2Service,
              private _activeModal: DbActiveModal,
              public builderInteractionsService: BuilderSectionsInteractionService,
              private _dragHelperService: DragHelperService,
              private _renderer: Renderer2,
              private _canvasZoomService: CanvasZoomService,
              public builderHistoryService: BuilderHistoryService) {
  }

  ngOnInit() {
    this._activeModal.hideCloseBtn(true);
  }

  private _getTemplatesList(uniqueId: string) {
    this._builderService.getTemplatesList(uniqueId)
      .subscribe((response) => {
        if (response && response.data) {
          this.sectionTemplates = response.data;
        }
      });
  }
}
