import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef,
  EventEmitter, HostListener, inject,
  Input, OnDestroy,
  OnInit,
  Output, Renderer2
} from '@angular/core';
import {
  BuilderGeneratedPageSectionI,
  PageMetaI,
  SecondaryPageWithSectionsI, SectionTemplateI
} from "../../../../../../builder-v2.interface";
import {DragulaService} from "ng2-dragula";
import {interval, takeWhile, tap} from "rxjs";
import {filter, map} from "rxjs/operators";
import {FormControl} from "@angular/forms";
import {BuilderTourEnum} from "../../../../../../builder-tour.enum";
import {DragHelperService} from "../../../../../../services/drag-helper.service";
import {TriggersService} from "../../../../../../services/triggers.service";
import {Observable} from "rxjs/internal/Observable";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Subject} from "rxjs/internal/Subject";
import {BuilderSectionsInteractionService} from "../../../../../../builder-sections-interaction.service";
import {BuilderV2Service} from "../../../../../../builder-v2.service";
import {CommonBuilderDataService} from "../../../../../../services/common-builder-data.service";
import {CanvasZoomService} from "../../../../../../services/canvas-zoom.service";
import {skip} from "rxjs/internal/operators/skip";
import {BuilderHistoryService} from "../../../../../../builder-history.service";

@Component({
  selector: 'db-builder-page-body',
  templateUrl: './builder-page-body.component.html',
  styleUrl: './builder-page-body.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuilderPageBodyComponent implements OnInit, OnDestroy {
  @Input('pageWithSections') set sections(sections: SecondaryPageWithSectionsI) {
    if (sections && !sections.sections.length && !this.loading) {
      this.loading = true;
      this._builderInteractionsService.secondaryPageLoading.next(true);
      this.pageSections = [];
      this.staticSections = [];
      this.draggableSections = [];
      this._loadSections();
    }
    this.pageWithSections = sections;
  }

  @Input('needRegeneration') set regeneration(value: boolean) {
    // if (value) {
    //   this.loading = true;
    //   this.pageSections = [];
    //   this.staticSections = [];
    //   this.draggableSections = [];
    //   this._loadSections();
    // }
    // this.needRegeneration = !!value;
  }

  needRegeneration = false;

  pageWithSections: SecondaryPageWithSectionsI;
  @Input() page: PageMetaI;
  @Input() sectionTemplates: SectionTemplateI[] = [];
  @Input() enhanceObservable: Subject<{ id: number; data: any; }> = new Subject<{ id: number; data: any; }>();
  @Input() sectionTypesObservable: Subject<{ id: number; data: any; }> = new Subject<{ id: number; data: any; }>();
  @Output() loadingChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() sectionSelected: EventEmitter<void> = new EventEmitter<void>();
  @Output() enhance: EventEmitter<{
    type: string;
    index: number;
    id: number;
    sections: BuilderGeneratedPageSectionI[];
  }> = new EventEmitter<{
    type: string;
    index: number;
    id: number;
    sections: BuilderGeneratedPageSectionI[];
  }>();
  @Output() sectionTypeChange: EventEmitter<BuilderGeneratedPageSectionI[]> = new EventEmitter<BuilderGeneratedPageSectionI[]>();
  @Output() sectionsListChanged: EventEmitter<BuilderGeneratedPageSectionI[]> = new EventEmitter<BuilderGeneratedPageSectionI[]>();
  pageSections: BuilderGeneratedPageSectionI[] = [];
  staticSections: BuilderGeneratedPageSectionI[] = [];
  draggableSections: BuilderGeneratedPageSectionI[] = [];
  loading: boolean = true;
  selectedSection: BuilderGeneratedPageSectionI;
  selectedSectionIndex: number;
  openTemplatesForSection = null;
  tourEnum = BuilderTourEnum;
  showActions = false;
  sectionLoading = false;
  isEdit: boolean;
  private _destroyRef: DestroyRef = inject(DestroyRef);
  isDragging: boolean;
  private sectionTemplatesOpened: boolean;
  private templatesForSection: null;
  readonly sectionsLimit = 3;
  temprorarySection = null;

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
    if (this.selectedSectionIndex === null || !this.selectedSection) {
      return;
    }
    event.preventDefault();
    this.addSection(this.selectedSectionIndex + 1);
  }

  constructor(private _dragulaService: DragulaService,
              private _dragHelperService: DragHelperService,
              private _triggerService: TriggersService,
              private _builderInteractionsService: BuilderSectionsInteractionService,
              private _builderService: BuilderV2Service,
              private _builderCommonDataService: CommonBuilderDataService,
              private _canvasZoomService: CanvasZoomService,
              private _renderer: Renderer2,
              private builderHistoryService: BuilderHistoryService,
              private _cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this._dragulaService.createGroup(this.page.id.toString(), {
      revertOnSpill: true,
      direction: 'vertical',
    });

    this._dragulaService.drag(this.page.id.toString()).subscribe(() => {
      this.isDragging = true;
      this.sectionTemplatesOpened = false;
      this.templatesForSection = null;
    });

    this._dragulaService.dragend(this.page.id.toString()).subscribe(() => {
      this.isDragging = false;
    });
    this._loadSections();
    this._listenSectionEnhance();
    this._listenStateChange();
  }

  sectionValueChanged(section: BuilderGeneratedPageSectionI, index: number) {
    this.draggableSections[index] = section;
    this.pageSections[index + 1] = section;
    this._getSectionTypes(index + 1);
    this.sectionsListChanged.emit(this.pageSections);
  }

  private _listenSectionEnhance() {
    this.enhanceObservable
      .pipe(
        takeUntilDestroyed(this._destroyRef),
      ).subscribe(({id, data}) => {
      const changedSection: BuilderGeneratedPageSectionI = this.pageSections.find(sec => sec.index === data.index);
      if (changedSection) {
        changedSection.section_title = data.section_title;
        changedSection.section_description = data.section_description;
        changedSection.loading = false;
        changedSection.is_tempo = false;
        this.pageSections[data.index] = changedSection;
        this.sectionLoading = false;
      }

      if (data.index !== 0 && data.index !== this.pageSections.length - 1) {
        const draggableSection = this.draggableSections[data.index - 1];
        draggableSection.loading = false;
        draggableSection.is_tempo = false;
        draggableSection.section_title = data.section_title;
        draggableSection.section_description = data.section_description;
        draggableSection.description_control.setValue(draggableSection.section_description);
        draggableSection.title_control.setValue(draggableSection.section_title);
      }
      this.sectionsListChanged.emit(this.pageSections);
      this._cdr.detectChanges();
    });
  }

  pageOutlineChange({tempo, template, action, ...rest}) {
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
        title_control: this._sectionField(template.ui_name),
        description_control: this._sectionField(template.description),
      };

      if (!tempo) {
        const isCustom = template.key === 'custom';
        this.temprorarySection = null;
        this.addSection(index, !isCustom ? elementToAdd : null, !isCustom);

        if (!isCustom) {
          this.enhance.next({type: 'description', index: index + 1, id, sections: this.pageSections});
        }

        setTimeout(() => {
          this.selectSection(this.draggableSections[index], index);
          this._cdr.detectChanges();
        }, 100);
      } else {
        this.temprorarySection = elementToAdd;
        this._cdr.detectChanges();
      }
    } else {
      this.temprorarySection = null;
    }
    this.draggableSections = this._dragHelperService.updateSectionIndexes(this.draggableSections);
  }

  rightClick(event, section, index) {
    if (this.isEdit) {
      return;
    }
    this.showActions = true;
    if (event) {
      event.preventDefault();
      this.selectSection(section, index);
    }
  }

  private _loadSections() {
    const interval$ = interval(500);
    let addedItemsCount = 0;
    interval$.pipe(
      tap(() => {
        if (this.pageSections.length && addedItemsCount >= this.pageWithSections?.sections?.length) {
          this.loading = false;
          this._builderInteractionsService.secondaryPageLoading.next(false);
          this.loadingChanged.emit(this.loading);
          this._cdr.markForCheck();
          this._getSectionTypes();
        }
      }),
      takeWhile(() => this.loading)
    ).subscribe(() => {
      const currentIndex = addedItemsCount;
      const item = this.pageWithSections?.sections[currentIndex];
      if (item) {
        item.title_control = this._sectionField(item.section_title);
        item.description_control = this._sectionField(item.section_description);
        addedItemsCount++;
        this.pageSections.push(item);
        if (currentIndex === 0 || currentIndex === this.pageWithSections.sections.length - 1) {
          this.staticSections.push(item);
          return;
        }

        this.draggableSections.push(item);
        this._cdr.markForCheck();
      }
    });
  }

  onStructureChange(data) {
    this.draggableSections = this._updateIndex(data, 1);
    this.pageSections = [...this._updateIndex([this.staticSections[0], ...data, this.staticSections[1]])];
    this.sectionsListChanged.emit(this.pageSections);
    this.resetSelection();
  }

  private _updateIndex(data, prefix = 0) {
    return data.map((page, index) => {
      page.index = index + prefix;
      return page;
    });
  }

  private _listenStateChange() {
    this.builderHistoryService.currentStateIndex
      .pipe(
        skip(1),
        takeUntilDestroyed(this._destroyRef),
      ).subscribe(index => {
      const {secondaryPages} = this.builderHistoryService.history.value[index];
      if (secondaryPages) {
        const pageWithSections = secondaryPages.find(({page}) => page.id === this.page.id);
        if (pageWithSections) {
          const sections = pageWithSections.sections;
          this.page = {...pageWithSections.page};
          this.pageSections = this._builderInteractionsService.addFormControls(sections);
          this.staticSections = [sections.at(0), sections.at(-1)];
          this.draggableSections = sections.slice(1, -1);
          this._cdr.markForCheck();
        }
      }
    });
  }

  onAddSection(section: BuilderGeneratedPageSectionI, index: number) {
    this.openTemplatesForSection = section.id;
    this.selectSection(section || this.draggableSections[index], index);
  }

  selectSection(section, index = null) {
    this.selectedSection = section;
    this.selectedSectionIndex = index;
    this.sectionSelected.emit();
  }

  onCloseRightClick() {
    this.showActions = false;
  }

  addSection(index: number, elementToAdd?, skipAddHistory: boolean = false) {
    if (!elementToAdd) {
      elementToAdd = {
        id: new Date().getTime(),
        index,
        section_title: "",
        section_description: "",
        section_type: null,
        title_control: this._sectionField(),
        description_control: this._sectionField(),
      };
    }
    this.draggableSections.splice(index, 0, elementToAdd);
    this.pageSections.splice(index + 1, 0, elementToAdd);
    this.draggableSections = this._dragHelperService.updateSectionIndexes(this.draggableSections);
    this.pageSections = this._dragHelperService.updateSectionIndexes(this.pageSections);
    if (!skipAddHistory) {
      this.sectionsListChanged.emit(this.pageSections);
    }
    this.selectedSection = elementToAdd;
    this.selectedSectionIndex = index;
  }

  removeSection(index) {
    this.draggableSections.splice(index, 1);
    this.pageSections.splice(index + 1, 1);
    this.sectionsListChanged.emit(this.pageSections);
    if (this.draggableSections[index]) {
      this.selectSection(this.draggableSections[index], 0);
    }
    if (!this.draggableSections.length) {
      this.selectSection(this.staticSections[0], 0);
    }
  }

  duplicateSection(index) {
    const {description_control, title_control, ...exampleSection} = this.pageSections[index + 1];
    const duplicate = structuredClone(exampleSection);
    duplicate.id = new Date().getTime();
    duplicate['title_control'] = this._sectionField(duplicate.section_title);
    duplicate['description_control'] = this._sectionField(duplicate.section_description);

    this.draggableSections.splice(index + 1, 0, duplicate);
    this.pageSections.splice(index + 2, 0, duplicate);
    this.sectionsListChanged.emit(this.pageSections);
    this.selectedSection = duplicate;
  }

  onGenerate(index: number, type: 'new' | 'enhance' | 'title' | 'description') {
    const section = this.draggableSections[index];
    section.section_title = section.title_control.value;
    section.section_description = section.description_control.value;
    section.loading = true;
    this.draggableSections[index] = {...section};
    this.pageSections[index + 1] = {...section};
    this._cdr.detectChanges();
    this.sectionsListChanged.emit(this.pageSections);
    this.enhance.next({type, index: index + 1, id: section.id, sections: this.pageSections});
  }

  resetSelection() {
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

  private _getSectionTypes(index?: number) {
    const sectionObj = this._builderInteractionsService.getModifiedSectionStructure(this.pageSections, index);
    sectionObj.page_outline.sections = this._builderInteractionsService.removeExtraKeysFromSections(sectionObj.page_outline.sections);
    const {domainId, uniqueId} = this._builderCommonDataService;
    this._builderService.aiModifySectionTypes(sectionObj, domainId, uniqueId, false)
      .pipe(
        filter(resp => {
          return !!resp?.body?.data;
        }),
        map(resp => resp?.body.data)
      )
      .subscribe(
        sections => {
          for (let section of sections) {
            const changedSectionIndex = this.pageSections.findIndex(sec => sec.id === section.id);

            if (changedSectionIndex !== -1) {
              this.pageSections[changedSectionIndex] = {
                ...this.pageSections[changedSectionIndex],
                section_type: section.section_type
              };
              if (changedSectionIndex !== 0 && this.pageSections.length - 1 !== changedSectionIndex) {
                this.draggableSections[changedSectionIndex - 1] = {
                  ...this.draggableSections[changedSectionIndex - 1],
                  section_type: section.section_type
                };
              }
            }
          }
          this.sectionTypeChange.emit(this.pageSections);
        }
      );
  }

  elementClassChanged() {
    this._dragHelperService.recalculateDraggableElementPosition(this._canvasZoomService.scale.value, this._renderer);
  }

  private _sectionField(value = '', disabled = false): FormControl {
    return new FormControl({value, disabled}, {updateOn: 'blur'});
  }

  ngOnDestroy() {
    this._dragulaService.destroy(this.page.id.toString());
  }
}
