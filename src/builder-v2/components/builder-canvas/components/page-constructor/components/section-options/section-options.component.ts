import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BuilderGeneratedPageSectionI} from "../../../../../../builder-v2.interface";
import {combineLatest} from "rxjs";
import {startWith} from "rxjs/operators";

@Component({
  selector: 'db-section-options',
  templateUrl: './section-options.component.html',
  styleUrl: './section-options.component.scss'
})
export class SectionOptionsComponent implements OnInit {
  @Input() activeOption;
  @Input() limitPassed;
  @Input() sectionLoading = false;
  hideTooltip = false;
  options = [
    {
      title: 'Suggest a new section',
      icon: 'db-icon db-icon-ds-ai-generate',
      disabled: true,
      action: 'new'
    },
    {
      title: 'Enhance',
      icon: 'db-icon db-icon-ds-enhance',
      disabled: true,
      action: 'enhance'
    },
    {
      title: 'Suggest title',
      icon: 'db-icon db-icon-ds-booster-main-active',
      disabled: true,
      action: 'title'
    },
    {
      title: 'Suggest description',
      icon: 'db-icon db-icon-ds-booster-main-active',
      disabled: true,
      action: 'description'
    }
  ];

  @Input() section: BuilderGeneratedPageSectionI;

  @Output() duplicate: EventEmitter<void> = new EventEmitter<void>();
  @Output() clickOutside: EventEmitter<void> = new EventEmitter<void>();
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  @Output() addSection: EventEmitter<number> = new EventEmitter<number>();
  @Output() onGenerate: EventEmitter<'new' | 'enhance' | 'title' | 'description'> =
    new EventEmitter<'new' | 'enhance' | 'title' | 'description'>();

  ngOnInit() {
    this._listenSectionInputChanges();
  }

  private _listenSectionInputChanges() {
    const titleChanges$ = this.section.title_control.valueChanges.pipe(startWith(this.section.section_title));
    const descriptionChanges$ = this.section.description_control.valueChanges.pipe(startWith(this.section.section_description));

    combineLatest([titleChanges$, descriptionChanges$])
      .subscribe(([section_title, section_description]) => {
        this._setOptions({section_title, section_description});
      });
  }

  private _setOptions(section) {
    this.options = this.options.map(option => {
      option.disabled = true;
      return option;
    });
    const newSection = this.options[0];
    const enhanceSection = this.options[1];
    const suggestTitle = this.options[2];
    const suggestDesc = this.options[3];

    if (!section.section_description && !section.section_title) {
      newSection.disabled = false;
    }

    if (!section.section_description && section.section_title) {
      suggestDesc.disabled = false;
    }

    if (section.section_description) {
      enhanceSection.disabled = false;
    }

    if (!section.section_title && section.section_description) {
      suggestTitle.disabled = false;
    }

    this.options = [newSection, enhanceSection, suggestTitle, suggestDesc];
  }

  onOutsideClick() {
    this.activeOption = null;
    this.hideTooltip = false;
    this.clickOutside.emit();
  }
}
