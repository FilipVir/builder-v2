import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit, Output,
  Renderer2
} from '@angular/core';
import {DragulaService} from "ng2-dragula";
import {BuilderHistoryService} from "../../../../builder-history.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {BuilderTourEnum} from "../../../../builder-tour.enum";
import {interval, takeWhile, tap} from "rxjs";
import {BuilderSectionsInteractionService} from "../../../../builder-sections-interaction.service";
import {skip} from "rxjs/internal/operators/skip";
import {BuilderGeneratedPageSectionI, SectionTemplateI} from "../../../../builder-v2.interface";
import {filter} from "rxjs/operators";
import {GoogleAnalyticsService} from "../../../../../shared/services/google-analytics/google-analytics.service";
import {FormControl} from "@angular/forms";
import {BuilderV2Service} from "../../../../builder-v2.service";
import {TriggersService} from "../../../../services/triggers.service";
import {CanvasZoomService} from "../../../../services/canvas-zoom.service";
import {DragHelperService} from "../../../../services/drag-helper.service";

@Component({
  selector: 'db-page-constructor',
  templateUrl: './page-constructor.component.html',
  styleUrl: './page-constructor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // animations: [
  //   trigger('fadeInOut', [
  //     transition(':enter', [
  //       style({opacity: 0}),
  //       animate('200ms ease-in', style({opacity: 1})),
  //     ]),
  //   ]),
  // ],
})
export class PageConstructorComponent implements OnInit, OnDestroy {
  @Input() sectionTemplates: SectionTemplateI[] = [];
  tourEnum = BuilderTourEnum;
  pageSections: BuilderGeneratedPageSectionI[] = [];
  staticSections: BuilderGeneratedPageSectionI[] = [];
  draggableSections: BuilderGeneratedPageSectionI[] = [];
  private _destroyRef = inject(DestroyRef);
  selectedSection: BuilderGeneratedPageSectionI;
  selectedSectionIndex: number;
  showActions = false;
  loading = true;
  isEdit = false;
  isDragging: boolean = false;
  disabledSteps = [BuilderTourEnum.PAGE_BUILDER, BuilderTourEnum.START, BuilderTourEnum.INTRO];
  sectionErrors: boolean[] = [];
  sectionWarns: boolean[] = [];
  sectionTemplatesOpened = false;
  changedSectionId: number = null;
  templatesForSection: number = null;
  sectionLoading = false;
  generationType = null;
  private _triggerService: TriggersService = inject(TriggersService);
  isMobile: boolean = false;
  tempoSection = null;
  @Output() openMagicLink: EventEmitter<boolean> = new EventEmitter<boolean>();


  @Input() popupMode: boolean;
  @Input() uniqueId: string;
  @Input() user;

  @HostListener('document:keydown.control.d', ['$event'])
  @HostListener('document:keydown.meta.d', ['$event'])
  duplicate(event: KeyboardEvent) {
    if (!this.selectedSection) {
      return;
    }
    event.preventDefault();
    this.duplicateSection(this.selectedSectionIndex);
  }

  @HostListener('document:keydown.backspace', ['$event'])
  @HostListener('document:keydown.delete', ['$event'])
  remove(event: KeyboardEvent) {
    if (this._restrictDelete()) return;
    event.preventDefault();
    this.removeSection(this.selectedSectionIndex);
  }

  @HostListener('document:keydown.control.enter', ['$event'])
  @HostListener('document:keydown.meta.enter', ['$event'])
  addSectionAbove(event: KeyboardEvent) {
    if (!this.selectedSection) {
      return;
    }
    event.preventDefault();
    this.addSection(this.selectedSectionIndex + 1);
  }

  constructor(private _dragulaService: DragulaService,
              private _ngZone: NgZone,
              private _cdr: ChangeDetectorRef,
              private _renderer: Renderer2,
              public _sectionsInteractionsService: BuilderSectionsInteractionService,
              private _googleAnalyticsService: GoogleAnalyticsService,
              private _builderV2Service: BuilderV2Service,
              private _canvasZoomService: CanvasZoomService,
              private _dragHelperService: DragHelperService,
              public builderHistoryService: BuilderHistoryService) {
    this._dragulaService.createGroup('sections', {
      revertOnSpill: true,
      direction: 'vertical',
      moves: () => {
        return this.builderHistoryService.tourStep.value === this.tourEnum.END;
      }
    });
    this._dragulaService.drag('sections').subscribe(() => {
      this.isDragging = true;
      this.sectionTemplatesOpened = false;
      this.templatesForSection = null;
    });

    this._dragulaService.dragend('sections').subscribe(() => {
      this.isDragging = false;
    });
  }

  ngOnInit() {
    this.isMobile = window.innerWidth < 991;
    this.loadSections();
    this._listenStateChange();
    this._listenTour();
    this._listenOutlineChangesFromTemplate();
    this._listenSectionChange();
  }


  private _listenOutlineChangesFromTemplate() {
    this._sectionsInteractionsService.changePageOutline
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(value => {
        this._handleAddTemplateSection(value);
      });
  }

  private _handleAddTemplateSection({tempo, template, action, ...rest}) {
    const index = rest['index'] !== null ? rest['index'] : this.pageSections.length - 2;
    if (action === 'add') {
      const id = new Date().getTime();
      const elementToAdd = {
        id,
        index,
        section_title: template.ui_name,
        section_description: template.description,
        section_type: template.key,
        is_tempo: tempo,
        loading: !tempo,
        title_control: new FormControl(template.name),
        description_control: new FormControl(template.description),
      };

      if (!tempo) {
        const isCustom = template.key === 'custom';
        this.templatesForSection = null;
        this.tempoSection = null;
        this.addSection(index, !isCustom ? elementToAdd : null, !isCustom);

        if (!isCustom) {
          this.changedSectionId = id;
          this._sectionsInteractionsService.enhanceSection.next({type: 'description', index: index + 1});
        }

        setTimeout(() => {
          this.selectSection(this.draggableSections[index], index);
          this._triggerService.scrollToSection.next(id.toString());
          this._cdr.detectChanges();
        }, 100);
      } else {
        this.tempoSection = elementToAdd;
      }
    } else {
      this.tempoSection = null;
    }
  }

  private _listenTour() {
    this.builderHistoryService.tourStep
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._selectSectionForTour();
      });
  }

  private _selectSectionForTour() {
    if (this.builderHistoryService.tourStep.value === this.tourEnum.PAGE_BUILDER && !this.selectedSection) {
      if (this.draggableSections[0]) {
        this.selectSection(this.draggableSections[0], 0);
      }
    }
  }

  // TODO refactor
  loadSections() {
    const interval$ = interval(500);
    let addedItemsCount = 0;
    interval$.pipe(
      filter(() => !!this._sectionsInteractionsService.pageSections.length),
      tap(() => {
        if (this.pageSections.length && addedItemsCount >= this._sectionsInteractionsService.pageSections.length) {
          this.loading = false;
          this._setErrors();
          this.builderHistoryService.addStateInHistory(structuredClone({
            sections: this._sectionsInteractionsService.removeFormControls(this.pageSections),
            invalidSections: this.sectionErrors
          }));
          this._sectionsInteractionsService.pageLoaded.next(true);
          this._listenSectionTypesChange();
          this._cdr.markForCheck();
        }
      }),
      takeWhile(() => this.loading)
    ).subscribe(() => {
      const currentIndex = addedItemsCount;
      const item = this._sectionsInteractionsService.pageSections[currentIndex];
      if (item) {
        item.title_control = new FormControl(item.section_title);
        item.description_control = new FormControl(item.section_description);
        addedItemsCount++;
        this.pageSections.push(item);
        if (currentIndex === 0 || currentIndex === this._sectionsInteractionsService.pageSections.length - 1) {
          this.staticSections.push(item);
          return;
        }

        this.draggableSections.push(item);
        this._selectSectionForTour();
        this._cdr.markForCheck();
      }
    });
  }

  private _setErrors() {
    this.pageSections.map((section: BuilderGeneratedPageSectionI, index) => {
      this.sectionErrors[index - 1] = (!section.section_title)
        && !(!section.section_description && !section.section_title);
      this.sectionWarns[index - 1] = (!section.section_description)
        && !(!section.section_description && !section.section_title);
    });
  }

  private _listenSectionTypesChange() {
    this._sectionsInteractionsService.updateSectionTypes
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        filter(sections => !!sections?.length)
      ).subscribe(sections => {
      for (let section of sections) {
        const changedSection: BuilderGeneratedPageSectionI = this.pageSections.find(sec => sec.section_title === section.section_title &&
          sec.section_description === section.section_description);
        if (changedSection) {
          changedSection.section_type = section.section_type;
          changedSection.section_title = section.section_title;
          changedSection.section_description = section.section_description;
          changedSection.loading = false;
          changedSection.is_tempo = false;

          if (section.variation) {
            changedSection.variation = section.variation;
          } else {
            changedSection.user_preferences = section.user_preferences;
          }
        }
      }
      this._sectionsInteractionsService.pageSections = this.pageSections;
      this._sectionsInteractionsService.saveLocalState.next();
    });
  }

  onClickAddSection(index: number, section?) {
    if (!this._sectionsInteractionsService.canAddSection.value || this.loading || this.sectionLoading) {
      return;
    }
    this.sectionTemplatesOpened = false;
    this.templatesForSection = section ? -1 : index;
    this.selectSection(section || this.draggableSections[index], index);
  }

  private _listenSectionChange() {
    this._sectionsInteractionsService.updateEnhancedSection
      .pipe(
        takeUntilDestroyed(this._destroyRef),
      ).subscribe(section => {
      const changedSection: BuilderGeneratedPageSectionI = this.pageSections.find(sec => sec.id === this.changedSectionId);
      if (changedSection) {
        changedSection.section_title = section.section_title;
        changedSection.section_description = section.section_description;
        changedSection.loading = false;
        changedSection.is_tempo = false;
        this.sectionLoading = false;
      }

      if (section.index !== 0 && section.index !== this.pageSections.length - 1) {
        const draggableSection = this.draggableSections[section.index - 1];
        draggableSection.loading = false;
        draggableSection.is_tempo = false;
        draggableSection.section_title = section.section_title;
        draggableSection.section_description = section.section_description;
        draggableSection.description_control.setValue(draggableSection.section_description);
        draggableSection.title_control.setValue(draggableSection.section_title);
        this.draggableSections = [...this.draggableSections];
        setTimeout(() => {
          document.getElementById('draggable').click();
        }, 100);
        setTimeout(() => {
          document.getElementById((section.index - 1).toString()).click();
        }, 200);
        this._cdr.markForCheck();
        this._cdr.detectChanges();
      }

      this._sectionsInteractionsService.pageSections = this.pageSections;
      this._sectionsInteractionsService.saveLocalState.next();
      this._setErrors();
      this.updateHistory(this.pageSections);

      if (this.generationType === 'new') {
        const sections = this._sectionsInteractionsService.removeFormControls(this.pageSections);
        this._sectionsInteractionsService.sectionChanges.next({sections, changedIndex: section.index});
      }
      this.changedSectionId = null;
      this.generationType = null;
    });
  }

  private _listenStateChange() {
    this.builderHistoryService.currentStateIndex
      .pipe(
        skip(1),
        takeUntilDestroyed(this._destroyRef),
      ).subscribe(index => {
      const history = this.builderHistoryService.history.value[index];
      const sections = structuredClone(history.sections);
      this.sectionErrors = structuredClone(history.invalidSections);
      this.pageSections = this._sectionsInteractionsService.addFormControls(sections);
      this._sectionsInteractionsService.pageSections = sections;
      this._sectionsInteractionsService.saveLocalState.next();
      this.staticSections = [sections.at(0), sections.at(-1)];
      this.draggableSections = sections.slice(1, -1);
      this._cdr.markForCheck();
    });
  }

  onSectionEdit(value: boolean) {
    this.isEdit = value;
    this._sectionsInteractionsService.isSectionEdit = value;
  }

  addSection(index: number, elementToAdd?, skipAddHistory?: boolean) {
    if (!this._sectionsInteractionsService.canAddSection.value) {
      return;
    }
    if (!elementToAdd) {
      elementToAdd = {
        id: new Date().getTime(),
        index,
        section_title: "",
        section_description: "",
        section_type: null,
        title_control: new FormControl(''),
        description_control: new FormControl(''),
      };
    }
    this.draggableSections.splice(index, 0, elementToAdd);
    this.pageSections.splice(index + 1, 0, elementToAdd);
    this.selectedSection = elementToAdd;
    this.selectedSectionIndex = index;
    this._sectionsInteractionsService.checkAddLimit(this.draggableSections.length);
    this.updateHistory(this.pageSections, skipAddHistory);
    this._sendEvent('Section-based AI Flow - Section Added', '-');
  }

  removeSection(index) {
    this.draggableSections.splice(index, 1);
    this.pageSections.splice(index + 1, 1);
    if (this.sectionErrors[index]) {
      this.sectionErrors.splice(index, 1);
    }
    if (this.sectionWarns[index]) {
      this.sectionWarns.splice(index, 1);
    }
    this.updateHistory(this.pageSections);

    if (this.draggableSections[index]) {
      this.selectSection(this.draggableSections[index], 0);
    }
    if (!this.draggableSections.length) {
      this.selectSection(this.staticSections[0], 0);
    }
    this._sectionsInteractionsService.checkAddLimit(this.draggableSections.length);
    this._setErrors();
    this._sendEvent('Section-based AI Flow - Section Deleted', '-');
  }

  duplicateSection(index) {
    const {description_control, title_control, ...exampleSection} = this.pageSections[index + 1];
    const duplicate = structuredClone(exampleSection);
    duplicate.id = new Date().getTime();
    duplicate['title_control'] = new FormControl(duplicate.section_title);
    duplicate['description_control'] = new FormControl(duplicate.section_description);

    this.draggableSections.splice(index + 1, 0, duplicate);
    this.pageSections.splice(index + 2, 0, duplicate);
    this.selectedSection = duplicate;
    this.updateHistory(this.pageSections);
  }

  onGenerate(index: number, type: 'new' | 'enhance' | 'title' | 'description') {
    const section = this.draggableSections[index];
    this._sectionsInteractionsService.pageSections[index + 1] = {
      ...section,
      section_title: section.title_control.value,
      section_description: section.description_control.value
    };
    this.draggableSections[index].loading = true;
    this.sectionLoading = true;
    this.changedSectionId = this.draggableSections[index].id;
    this.generationType = type;
    this._sectionsInteractionsService.enhanceSection.next({type, index: ++index});
  }

  updateHistory(data: BuilderGeneratedPageSectionI[], skipAddHistory = false) {
    data = this._sectionsInteractionsService.removeFormControls(data);
    let sections = structuredClone(data);
    const invalidSections = structuredClone(this.sectionErrors);
    const secondaryPages = this._sectionsInteractionsService.secondaryPages.value;
    if (!skipAddHistory) {
      this.builderHistoryService.addStateInHistory({sections, invalidSections, secondaryPages});
    }
    this._sectionsInteractionsService.pageSections = sections;
    this._sectionsInteractionsService.saveLocalState.next();
  }

  sectionValueChange(value: {
                       section_title: string,
                       section_description: string
                     }, section: BuilderGeneratedPageSectionI,
                     index: number, isStatic = false) {
    section.section_type = null;
    section = {
      ...section,
      ...value
    };
    this.pageSections[index] = section;
    if (!isStatic) {
      this.draggableSections[index - 1] = section;
    }
    const sections = this._sectionsInteractionsService.removeFormControls(this.pageSections);
    this.sectionErrors[index - 1] = (!section.section_title)
      && !(!section.section_description && !section.section_title);
    this.sectionWarns[index - 1] = (!section.section_description)
      && !(!section.section_description && !section.section_title);
    this._sectionsInteractionsService.sectionChanges.next({sections, changedIndex: index});
    this.updateHistory(this.pageSections);
  }

  onStructureChange(data) {
    this.draggableSections = data;
    this.pageSections = [this.staticSections[0], ...data, this.staticSections[1]];
    this._setErrors();
    this.updateHistory(this.pageSections);
    this.selectedSection = null;
  }

  rightClick(event, section, index) {
    if (this.isEdit || this.tourEnum.END !== this.builderHistoryService.tourStep.value) {
      return;
    }
    this.showActions = true;
    if (event) {
      event.preventDefault();
      this.selectSection(section, index);
    }
  }

  onCloseRightClick() {
    this.showActions = false;
  }

  selectSection(section, index) {
    this.selectedSection = section;
    this.selectedSectionIndex = index;
  }


  // TODO fix on scale drag
  dragClassChanged() {
    this._dragHelperService.recalculateDraggableElementPosition(this._canvasZoomService.scale.value, this._renderer);
  }

  resetSelection() {
    if (this.tourEnum.PAGE_BUILDER === this.builderHistoryService.tourStep.value) {
      return;
    }
    this.selectedSection = null;
    this.selectedSectionIndex = null;
  }

  private _restrictDelete() {
    const isStaticSection = this.staticSections?.at(0)?.id === this.selectedSection?.id ||
      this.staticSections?.at(1)?.id === this.selectedSection?.id;
    return !this.selectedSection ||
      this.isEdit ||
      isStaticSection;
  }

  private _sendEvent(action: string, label: string): void {
    const analyticsData = {
      eventCategory: this.popupMode ? 'Dashboard Action' : 'Onboarding',
      eventAction: action,
      eventLabel: label,
      uniqueId: this.uniqueId
    };
    if (!this.user) {
      this._googleAnalyticsService.sendAnalyticsEventWithCoreWithoutUserData(analyticsData);
    } else {
      this._googleAnalyticsService.sendAnalyticsEventWithCore(analyticsData);
    }
  }

  openSectionTemplates() {
    window.innerWidth <= 991 ? this.openMagicLink.emit(true) : this.sectionTemplatesOpened = true;
  }

  ngOnDestroy() {
    this._dragulaService.destroy('sections');
  }
}
