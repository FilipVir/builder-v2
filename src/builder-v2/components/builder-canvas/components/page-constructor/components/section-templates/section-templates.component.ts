import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {BuilderSectionsInteractionService} from "../../../../../../builder-sections-interaction.service";
import {SectionTemplateI} from "../../../../../../builder-v2.interface";

interface ChangeOutlineI {
  action: 'add' | 'remove';
  template: SectionTemplateI;
  tempo: boolean;
  index?: number;
}

@Component({
  selector: 'db-section-templates',
  templateUrl: './section-templates.component.html',
  styleUrl: './section-templates.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionTemplatesComponent {
  @Input() sectionTemplatesOpened;
  @Output() sectionTemplatesOpenedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() templates: SectionTemplateI[] = [];
  @Input() index: number = null;
  @Input() secondary: boolean = false;
  @Output() sectionOutlineChange: EventEmitter<ChangeOutlineI> = new EventEmitter<ChangeOutlineI>();
  private _sectionInteractionsService: BuilderSectionsInteractionService = inject(BuilderSectionsInteractionService);
  private _itemSelected = false;

  onMouseOver(template) {
    const data: ChangeOutlineI = {
      tempo: true,
      action: 'add',
      template,
      index: this.index
    };
    if (!this.secondary) {
      this._sectionInteractionsService.changePageOutline.next(data);
    } else {
      this.sectionOutlineChange.next(data);
    }
  }

  onMouseOut(template) {
    if (this._itemSelected) {
      this._itemSelected = false;
      return;
    }
    const data: ChangeOutlineI = {
      tempo: true,
      action: 'remove',
      template,
      index: this.index
    };
    if (!this.secondary) {
      this._sectionInteractionsService.changePageOutline.next(data);
    } else {
      this.sectionOutlineChange.next(data);
    }
  }

  onTemplateSelect(template) {
    const data: ChangeOutlineI = {
      tempo: false,
      action: 'add',
      template,
      index: this.index
    };
    if (!this.secondary) {
      this._sectionInteractionsService.changePageOutline.next(data);
    } else {
      this.sectionOutlineChange.next(data);
    }
    this._itemSelected = true;
    this.sectionTemplatesOpenedChange.emit(false);
  }

}
