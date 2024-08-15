import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';
import {DragulaService} from "ng2-dragula";
import {DragHelperService} from "../../../../services/drag-helper.service";
import {CanvasZoomService} from "../../../../services/canvas-zoom.service";
import {
  BuilderGeneratedPageSectionI,
  PageMetaI,
  SecondaryPageReqI, SecondaryPageTypeReqI,
  SecondaryPageWithSectionsI,
  SectionTemplateI
} from "../../../../builder-v2.interface";
import {BuilderV2Service} from "../../../../builder-v2.service";
import {CommonBuilderDataService} from "../../../../services/common-builder-data.service";
import {BuilderSectionsInteractionService} from "../../../../builder-sections-interaction.service";
import {filter, map, switchMap} from "rxjs/operators";
import {combineLatest} from "rxjs/internal/observable/combineLatest";
import value from "*.json";
import {skip} from "rxjs/internal/operators/skip";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {BuilderHistoryService} from "../../../../builder-history.service";
import * as _ from 'lodash';
import {TriggersService} from "../../../../services/triggers.service";

@Component({
  selector: 'db-secondary-pages',
  templateUrl: './secondary-pages.component.html',
  styleUrl: './secondary-pages.component.scss',
})
export class SecondaryPagesComponent implements OnInit, OnDestroy {
  @Input('pageMeta') set pageList([first, ...rest]) {
    this.pageMeta = rest;
    this.alreadyHasSections = rest.length && !!rest[0].sections?.length;
  }

  alreadyHasSections = false;
  pageMeta: PageMetaI[] = [];
  @Input() sectionTemplates: SectionTemplateI[] = [];
  pagesWithSections: SecondaryPageWithSectionsI[] = [];
  selectedPageId = null;
  addPageTooltipOpened = false;
  readonly pagesLimit = 5;
  newPageLoading = false;
  loadingPageIds = null;
  pageRegenerating = null;

  constructor(private _dragulaService: DragulaService,
              private _canvasZoomService: CanvasZoomService,
              private _dragHelperService: DragHelperService,
              private _builderService: BuilderV2Service,
              private _renderer: Renderer2,
              private _commonDataService: CommonBuilderDataService,
              private _builderInteractionsService: BuilderSectionsInteractionService,
              private builderHistoryService: BuilderHistoryService,
              private _destroyRef: DestroyRef,
              private _triggerService: TriggersService,
              private cdr: ChangeDetectorRef) {
    this._dragulaService.createGroup('secondaryPages', {
      revertOnSpill: true,
      direction: 'horizontal',
      moves: (el, container, handle) => {
        return handle.classList.contains('page-handle');
      }
    });
    this._dragulaService.shadow('secondaryPages')
      .subscribe(value => {
        this._getPagesSortedIds();
      });

  }

  getSectionsByPageId(id: number): SecondaryPageWithSectionsI {
    return this.pagesWithSections.find(page => page.page.id === id);
  }

  ngOnInit() {
    if (this.alreadyHasSections) {
      this._setPagesFromLocalStorage();
    } else {
      this._getSecondaryPages();
    }
    this._listenStateChange();
  }

  private _listenStateChange() {
    this.builderHistoryService.currentStateIndex
      .pipe(
        skip(1),
        takeUntilDestroyed(this._destroyRef),
      ).subscribe(index => {
      let {secondaryPages} = this.builderHistoryService.history.value[index];
      if (secondaryPages) {
        secondaryPages = _.cloneDeep(secondaryPages);
        this.pagesWithSections = secondaryPages;
        this.pageMeta = secondaryPages.map(secondary => secondary.page);
        console.log(this.pageMeta, this.pagesWithSections, '_listenStateChange');
        this._updateSecondaryPagesSubject();
        this.cdr.detectChanges();
      }
    });
  }

  private _setPagesFromLocalStorage() {
    const pagesWithSections = this.pageMeta.map((resp, index) => {
      return {
        page: this.pageMeta[index],
        sections: resp.sections
      };
    });
    this._setPagesWithSections(pagesWithSections);
  }

  private _getSecondaryPages() {
    const pagesRequests = this.pageMeta.map(page => this._getPage(page));
    combineLatest(pagesRequests).pipe(
      filter(value => !!value?.every(resp => !!resp?.data)),
      map(value => value.map((resp, index) => {
        this.pageMeta[index].page_type = resp.data.page_type;
        return {
          page: this.pageMeta[index],
          sections: resp.data.page_outline.sections
        };
      }))
    ).subscribe(value => {
      this._setPagesWithSections(value);
    });
  }

  private _setPagesWithSections(value: SecondaryPageWithSectionsI[]) {
    this.pagesWithSections = value;
    this.saveInHistory(true);
    this._updateSecondaryPagesSubject();
    this._builderInteractionsService.saveLocalState.next();
    // this._getPageType();
    this.cdr.markForCheck();
    this._recalculateMinZoom();
  }

  private _recalculateMinZoom() {
    setTimeout(() => {
      this._triggerService.calculateMinZoom.next();
    }, 1000);
  }

  private _getPage(page) {
    const data = this._getPagesRequestData(page);
    const {domainId, uniqueId} = this._commonDataService;
    return this._builderService.getSecondaryPage(data, domainId, uniqueId);
  }

  private _getPagesRequestData(page: PageMetaI): SecondaryPageReqI {
    const {business_type, business_name, business_description} = this._builderInteractionsService.siteInfo.value;
    const sections = this._builderInteractionsService.removeFormControls(this._builderInteractionsService.pageSections
      .filter(section => section.section_title || section.section_description)
      .map(({loading, is_tempo, ...section}, index) => {
        return {...section, index};
      }));

    return {
      business_type,
      business_name,
      business_description,
      page_description: page.description,
      page_title: page.title,
      page_type: page.page_type,
      slug: page.slug,
      id: page.id,
      homepage_outline: {sections}
    };
  }

  onStructureChange(data: any[]) {
    this._builderInteractionsService.saveLocalState.next();
    this.saveInHistory();
  }

  private saveInHistory(isFirst = false) {
    const pagesWithSections = this.pagesWithSections.map(({page, sections}) => {
      if (!sections.length && this.newPageLoading && page.id === this.pageRegenerating?.page?.id) {
        sections = this.pageRegenerating.sections;
      }
      sections = sections.map(section => {
        section.section_description = section.description_control?.value || section.section_description;
        section.section_title = section.title_control?.value || section.section_title;
        return section;
      });
      return {
        page,
        sections: structuredClone(this._builderInteractionsService.removeExtraKeysFromSections(sections))
      };
    });
    this.builderHistoryService.addSecondaryPageInHistory(_.cloneDeep(pagesWithSections), isFirst);
  }

  resetSelect() {
    this.selectedPageId = null;
  }

  dragClassChanged() {
    this._dragHelperService.recalculateDraggableElementPosition(this._canvasZoomService.scale.value, this._renderer, true);
  }

  private _updateIndex(data) {
    this.pageMeta = data.map((page, index) => {
      page.index = index + 1;
      return page;
    });
    this.cdr.detectChanges();
  }

  private _getPagesSortedIds() {
    this._changePageStructure();
    this.pagesWithSections = this.pagesWithSections.sort((a, b) => {
      return this.pageMeta.findIndex(page => page.id === a.page.id) - this.pageMeta.findIndex(page => page.id === b.page.id);
    });
    this._updateSecondaryPagesSubject();
  }

  private _changePageStructure() {
    let containers = document.querySelectorAll('.secondary-pages-list-container');
    let childIds = [];

    containers.forEach(container => {
      let children = container.children;

      Array.from(children).forEach(child => {
        if (child.id) {
          childIds.push(+child.id);
        }
      });
    });

    let sortedObjectsArray = this.pageMeta.sort((a, b) => {
      return childIds.indexOf(a.id) - childIds.indexOf(b.id);
    });
    this._updateIndex(sortedObjectsArray);
  }

  addPage(name) {
    this.newPageLoading = true;
    const indexToAdd = this.pageMeta.length;
    const page: PageMetaI = {
      id: new Date().getTime(),
      index: indexToAdd + 1,
      page_type: null,
      title: name,
      description: '',
      slug: null
    };
    this.pageMeta.splice(indexToAdd, 0, page);
    this.pagesWithSections.splice(indexToAdd, 0, {
      page,
      sections: []
    });
    this.pagesWithSections[indexToAdd].sections = [];
    this.cdr.detectChanges();

    this._getPage(page)
      .subscribe(resp => {
        if (resp?.data) {
          const {id, slug, page_description, title, page_type, index} = resp.data;
          let newPageIndex = this.pageMeta.findIndex(p => p.id === id);
          this.pageMeta[newPageIndex] = {
            id,
            slug,
            description: page_description,
            title: page.title,
            page_type,
            index: newPageIndex + 1
          };
          this.pagesWithSections[newPageIndex] = {
            page: this.pageMeta[newPageIndex],
            sections: resp.data.page_outline.sections
          };
          this._updateSecondaryPagesSubject();
          this._builderInteractionsService.saveLocalState.next();
          console.log('addPage');
          this.newPageLoading = false;
          this.saveInHistory();
          this.cdr.detectChanges();
          this._getPagesSortedIds();
        } else if (resp && !resp.success) {
          this.newPageLoading = false;
        }
      }, error => {
        console.log(error);
      });
  }

  deletePage(pageId: number) {
    let pageIndex = this.pageMeta.findIndex(p => p.id === pageId);
    this.pageMeta.splice(pageIndex, 1);
    this.pagesWithSections.splice(pageIndex, 1);
    this._updateSecondaryPagesSubject();
    this._builderInteractionsService.saveLocalState.next();
    this._updateIndex(this.pageMeta);
    console.log('deletePage');
    this.saveInHistory();
  }

  regeneratePage(page: PageMetaI) {
    let pageIndex = this.pageMeta.findIndex(p => p.id === page.id);
    page.index = pageIndex + 1;
    this.pageMeta[pageIndex] = page;
    this.pageRegenerating = _.cloneDeep(this.pagesWithSections[pageIndex]);
    this.pagesWithSections[pageIndex] = {
      page,
      sections: []
    };
    this.cdr.detectChanges();
    this.newPageLoading = true;
    this._getPage(page).subscribe(resp => {
      if (resp?.data) {
        let newPageIndex = this.pageMeta.findIndex(p => p.id === page.id);
        this.pageMeta[newPageIndex] = page;
        this.pagesWithSections[newPageIndex] = {
          page: this.pageMeta[newPageIndex],
          sections: resp.data.page_outline.sections
        };
        this._updateSecondaryPagesSubject();
        this.loadingPageIds = page.id;
        this._updateIndex(this.pageMeta);
        console.log('regeneratePage');
        this.saveInHistory();
        this.newPageLoading = false;

        setTimeout(() => {
          this.loadingPageIds = null;
        });
      } else if (resp && !resp?.success) {
        this.newPageLoading = false;
      }
    });
  }

  onSectionTypeChange(index: number, sections: BuilderGeneratedPageSectionI[]) {
    this.pagesWithSections[index].sections = sections;
    this._updateSecondaryPagesSubject();
    this._builderInteractionsService.saveLocalState.next();
  }

  onSectionListChange(index: number, sections: BuilderGeneratedPageSectionI[], pageId: number) {
    const realIndex = this.pagesWithSections.findIndex(data => data.page.id === pageId);
    this.pagesWithSections[realIndex].sections = sections;
    this._updateSecondaryPagesSubject();
    this._builderInteractionsService.saveLocalState.next();
    console.log('onSectionListChange');
    this.saveInHistory();
  }

  onPageChange(index: number, page: PageMetaI) {
    const realIndex = this.pagesWithSections.findIndex(data => data.page.id === page.id);
    this.pagesWithSections[realIndex].page = {...page, index: this.pagesWithSections[realIndex].page.index};
    this._updateSecondaryPagesSubject();
    this._builderInteractionsService.saveLocalState.next();
    console.log('onPageChange');
    this.saveInHistory();
  }

  private _getPageType(index?, page?) {
    const data = this._getPagesTypeRequestData(index, page);
    this._builderService.getSecondaryPageType(data, this._commonDataService.domainId, this._commonDataService.uniqueId)
      .subscribe(value => {
        if (value?.data) {
          value.data.map((page: PageMetaI) => {
            const index = this.pageMeta.findIndex((p: PageMetaI) => p.index === page.index);
            this.pageMeta[index] = page;
            this.pagesWithSections[index] = {...this.pagesWithSections[index], page};
          });
          this._updateSecondaryPagesSubject();
          this._builderInteractionsService.saveLocalState.next();
          this.cdr.detectChanges();
        }
      });
  }

  private _getPagesTypeRequestData(index = null, page = null): SecondaryPageTypeReqI {
    const {business_type, business_name, business_description} = this._builderInteractionsService.siteInfo.value;

    let meta = this._builderInteractionsService.getPagesMeta();
    if (page) {
      meta.splice(index, 0, page);
      meta = meta.map((page, index) => {
        page.index = index;
        return page;
      });
    }

    return {
      business_type,
      business_name,
      business_description,
      page_index: index,
      pages_meta: meta
    };
  }

  selectPage(pageId: number) {
    this.selectedPageId = pageId;
  }

  private _updateSecondaryPagesSubject() {
    this._builderInteractionsService.secondaryPages.next([...this.pagesWithSections]);
  }

  ngOnDestroy() {
    this._dragulaService.destroy('secondaryPages');
  }

}
