import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {BuilderTourEnum} from "../../../../../../builder-tour.enum";
import {BuilderHistoryService} from "../../../../../../builder-history.service";
import {BuilderSectionsInteractionService} from "../../../../../../builder-sections-interaction.service";
import {PageMetaI} from "../../../../../../builder-v2.interface";

@Component({
  selector: 'db-builder-page-title',
  templateUrl: './builder-page-title.component.html',
  styleUrl: './builder-page-title.component.scss'
})
export class BuilderPageTitleComponent implements OnDestroy {
  @Input() set pageEditData({loading, pageTypeChanged}: { loading: boolean; pageTypeChanged: boolean }) {
    this.iconMode = loading ? 'loading' : 'pencil';
    this.showPageTypeChangeTooltip = pageTypeChanged;
    this.pageEditMode.emit(loading);
    this.editMode = loading;
  }

  @Input() hideActions = false;
  @Input() loading = false;
  @Input() generating = false;
  @Input() selected = false;

  @Input('page') set pageData(page: PageMetaI) {
    this.page = page;
    if (this.title) {
      this.title.nativeElement.innerText = this.page.title;
    }
  }

  page: PageMetaI;
  showEditTooltip = false;
  @Output() pageEditMode: EventEmitter<boolean | void> = new EventEmitter<boolean | void>();
  @Output() onPageEdit: EventEmitter<string> = new EventEmitter<string>();
  @Output() regeneratePage: EventEmitter<void> = new EventEmitter<void>();
  @Output() cancelEdit: EventEmitter<string> = new EventEmitter<string>();
  @Output() onDeletePage: EventEmitter<void> = new EventEmitter<void>();
  @Output() onAddPage: EventEmitter<void> = new EventEmitter<void>();
  @Output() selectPage: EventEmitter<void> = new EventEmitter<void>();
  iconMode = 'pencil';
  editMode = false;
  showPageTypeChangeTooltip = false;
  @ViewChild('title') title: ElementRef;

  disabledLoadingSteps = [BuilderTourEnum.OUTLINE_POPUP];
  addTemplateSteps = [BuilderTourEnum.END];
  loadingEnded = false;
  clickedEdit = false;

  @HostListener('document:keydown.backspace', ['$event'])
  onDeleteWhenEdit(event: KeyboardEvent) {
    if (this.editMode) {
      event.stopPropagation();
      return;
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  saveEditPage(event: KeyboardEvent) {
    if (!this.editMode && !this.title?.nativeElement) {
      return;
    }
    event.preventDefault();
    this.saveEdit(this.title?.nativeElement.innerText);
  }

  constructor(public builderHistoryService: BuilderHistoryService,
              private _cdr: ChangeDetectorRef,
              public sectionsInteractionsService: BuilderSectionsInteractionService) {
  }

  ngOnInit() {
  }

  onClickMore(event: MouseEvent) {
    this.showEditTooltip = !this.showEditTooltip;
  }

  saveEdit(value: string): void {

    if (value === this.page.title || !value?.trim()?.length) {
      this.iconMode = 'pencil';
      this.editMode = false;
      this.title.nativeElement.innerText = this.page.title;
      this.pageEditMode.emit(this.editMode = false);
      return;
    } else {
      this.clickedEdit = true;
      this.iconMode = 'loading';
    }
    this.onPageEdit.emit(value);
  }

  resetTitle() {
    if (this.clickedEdit) {
      this.clickedEdit = false;
      return;
    }
    this.iconMode = 'pencil';
    this.editMode = false;
    this.title.nativeElement.innerText = this.page.title;
    this.pageEditMode.emit(this.editMode);
  }

  titleKeydown($event) {
    if ($event.key === 'Delete' || $event.key === 'Backspace') {
      $event.stopPropagation();
    }
  }

  onEditMode() {
    this.iconMode = 'checkmark';
    this.editMode = true;
    this.pageEditMode.emit(true);
  }

  onClickEditIcon(titleField, event?: MouseEvent,) {
    event?.stopPropagation();
    setTimeout(() => {
      titleField.focus();
      this._moveCursorAtTheEnd();
    });
    this.onEditMode();
  }

  private _moveCursorAtTheEnd() {
    let selection = document.getSelection();
    let range = document.createRange();
    let contenteditable = this.title.nativeElement;

    if (contenteditable.lastChild.nodeType === 3) {
      range.setStart(contenteditable.lastChild, contenteditable.lastChild.length);
    } else {
      range.setStart(contenteditable, contenteditable.childNodes.length);
    }
    selection.removeAllRanges();
    selection.addRange(range);
  }

  ngOnDestroy() {
    this.showEditTooltip = false;
  }
}
