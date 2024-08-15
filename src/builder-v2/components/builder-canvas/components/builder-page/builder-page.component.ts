import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  BuilderGeneratedPageSectionI,
  PageMetaI,
  SecondaryPageReqI, SecondaryPageTypeReqI,
  SecondaryPageWithSectionsI,
  SectionTemplateI
} from "../../../../builder-v2.interface";
import {BuilderSectionsInteractionService} from "../../../../builder-sections-interaction.service";
import {BuilderV2Service} from "../../../../builder-v2.service";
import {CommonBuilderDataService} from "../../../../services/common-builder-data.service";
import {Subject} from "rxjs/internal/Subject";

@Component({
  selector: 'db-builder-page',
  templateUrl: './builder-page.component.html',
  styleUrl: './builder-page.component.scss'
})
export class BuilderPageComponent implements OnInit {
  @Input() page: PageMetaI;
  @Input() pagesCount: number;
  @Input() index: number;
  @Input() selected: boolean;
  @Input() pageWithSections: SecondaryPageWithSectionsI;
  @Input() sectionTemplates: SectionTemplateI[];
  @Output() onAddPage: EventEmitter<{ isLast: boolean; name: string }> = new EventEmitter<{
    isLast: boolean;
    name: string
  }>();
  @Output() pageEdited: EventEmitter<string> = new EventEmitter<string>();
  @Output() selectPage: EventEmitter<number> = new EventEmitter<number>();
  @Output() onRegeneratePage: EventEmitter<PageMetaI> = new EventEmitter<PageMetaI>();
  @Output() onSectionListChange: EventEmitter<BuilderGeneratedPageSectionI[]> = new EventEmitter<BuilderGeneratedPageSectionI[]>();
  @Output() sectionTypeChange: EventEmitter<BuilderGeneratedPageSectionI[]> = new EventEmitter<BuilderGeneratedPageSectionI[]>();
  @Output() onPageChange: EventEmitter<PageMetaI> = new EventEmitter<PageMetaI>();
  @Output() onDeletePage: EventEmitter<PageMetaI> = new EventEmitter<PageMetaI>();

  @Input('needRegeneration') set regeneration(value: boolean) {
    if (value) {

      this.pageEditData = {
        loading: false,
        pageTypeChanged: false
      };
      this.loading = true;
      this.pageEditMode = false;
      this.showEditTooltip = false;
    }
    this.needRegeneration = !!value;
  }

  needRegeneration = false;

  pageEditData = {
    loading: false,
    pageTypeChanged: false
  };
  loading = true;
  showEditTooltip: boolean;
  pageEditMode = false;
  enhanceResponse: Subject<any> = new Subject<any>();
  changePage: PageMetaI;


  constructor(private _builderInteractionsService: BuilderSectionsInteractionService,
              private _commonBuilderService: CommonBuilderDataService,
              private _cdr: ChangeDetectorRef,
              private _builderService: BuilderV2Service) {
  }

  ngOnInit() {
    // this._getPageType();
  }

  onPageEdit(value: string) {
    this.page.title = value;
    this._getPageType();
  }

  private _getPageType() {
    const data = this._getPagesRequestData();
    this._builderService.getSecondaryPageType(data, this._commonBuilderService.domainId, this._commonBuilderService.uniqueId)
      .subscribe(value => {
        if (value?.data) {
          const page = value.data[0];
          this.changePage = page;
          this.pageEditData = {
            loading: page.page_type !== this.page.page_type,
            pageTypeChanged: page.page_type !== this.page.page_type
          };
          this.page.page_type = page.page_type;
          if (page.page_type === 'unparseable') {
            this.pageEditData = {
              loading: false,
              pageTypeChanged: false
            };
          }
          this.onPageChange.emit(page);
          this._cdr.detectChanges();
        }
      });
  }

  resetTitleEdit() {
    this.pageEditData = {
      loading: false,
      pageTypeChanged: false
    };
  }

  private _getPagesRequestData(): SecondaryPageTypeReqI {
    const {business_type, business_name, business_description} = this._builderInteractionsService.siteInfo.value;
    const pages = this._builderInteractionsService.getPagesMeta();
    const page = pages.find(page => page.id === this.page.id);
    const realIndex = this.index + 1;
    pages[this.index] = {...page, title: this.page.title};
    pages[this.index].description = null;
    pages[this.index].page_type = null;
    pages[this.index].slug = null;

    return {
      business_type,
      business_name,
      business_description,
      page_index: realIndex,
      pages_meta: pages
    };
  }

  enhanceSection(value: { type: string; id: number; index: number; sections: BuilderGeneratedPageSectionI[] }) {
    const requestObj = this._builderInteractionsService.getModifiedSectionStructure(value.sections, value.index, true);
    requestObj.page_outline.sections = this._builderInteractionsService.removeExtraKeysFromSections(requestObj.page_outline.sections, true);
    switch (value.type) {
      case "enhance": {
        this._enhanceSection(requestObj);
        break;
      }
      case "description": {
        this._enhanceSectionDescription(requestObj);
        break;
      }
      case "title": {
        this._enhanceSectionTitle(requestObj);
        break;
      }
      case "new": {
        this._generateSection(requestObj);
        break;
      }
    }
  }

  private _enhanceSection(data) {
    this._builderService.enhanceSection(data, this._commonBuilderService.domainId, this._commonBuilderService.uniqueId, false)
      .subscribe(request => {
        if (request?.data) {
          this.enhanceResponse.next({id: data.index, data: request.data});
        }
      });
  }

  clickOutside() {
    this.selected && this.selectPage.emit(null);
  }

  private _enhanceSectionTitle(data) {
    this._builderService.enhanceSectionTitle(data, this._commonBuilderService.domainId, this._commonBuilderService.uniqueId, false)
      .subscribe(request => {
        if (request?.data) {
          this.enhanceResponse.next({id: data.index, data: request.data});
        }
      });
  }

  private _enhanceSectionDescription(data) {
    this._builderService.enhanceSectionDescription(data, this._commonBuilderService.uniqueId, false)
      .subscribe(request => {
        if (request?.data) {
          this.enhanceResponse.next({id: data.index, data: request.data});
        }
      });
  }

  private _generateSection(data) {
    this._builderService.generateSection(data, this._commonBuilderService.domainId, this._commonBuilderService.uniqueId, false)
      .subscribe(request => {
        if (request?.data) {
          this.enhanceResponse.next({id: data.index, data: request.data});
        }
      });
  }

  cancelPageEdit(title: string) {
    this.pageEditData = {
      loading: false,
      pageTypeChanged: false
    };
    this.selected = false;
    this.page.title = title;
    // this.onPageChange.emit(this.page);
    this._cdr.detectChanges();
  }

  regeneratePage() {
    this.onRegeneratePage.emit(this.changePage);
  }

  onSectionsListChange(sections: BuilderGeneratedPageSectionI[]) {
    this.onSectionListChange.emit(sections);
  }

  onSelectPage() {
    if (this.loading) {
      return;
    }
    this.selectPage.emit(this.page.id);
  }
}
