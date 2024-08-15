import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BuilderGeneratedPageSectionI} from "../../../../../../builder-v2.interface";

@Component({
  selector: 'db-builder-page-section',
  templateUrl: './builder-page-section.component.html',
  styleUrl: './builder-page-section.component.scss'
})
export class BuilderPageSectionComponent {
  @Input() section: BuilderGeneratedPageSectionI;
  @Input() static: boolean;
  @Input() selected: boolean = false;
  @Input() isDragging: boolean = false;
  @Input() showPlus: boolean = true;
  @Input() canAddSection: boolean = true;
  @Output() onAddSection: EventEmitter<void> = new EventEmitter<void>();
  @Output() valueChange: EventEmitter<BuilderGeneratedPageSectionI> = new EventEmitter<BuilderGeneratedPageSectionI>();
  @Output() isEdit: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onGenerate: EventEmitter<"new" | "enhance" | "title" | "description"> =
    new EventEmitter<"new" | "enhance" | "title" | "description">();
  @Input() loading: boolean;

  onClickAddSection() {
    if (!this.canAddSection) {
      return;
    }
    this.onAddSection.emit();
  }

  onClickGenerate(value) {
    this.onGenerate.emit(value);
  }

  sectionValueChange({section_title, section_description}) {
    if (!section_title) {
      this.section.title_control.setErrors({req: true});
    } else {
      this.section.title_control.setErrors(null);
    }
    if (!section_description) {
      this.section.description_control.setErrors({req: true});
    } else {
      this.section.description_control.setErrors(null);
    }
    this.section = {...this.section, section_description, section_title};
    this.valueChange.emit(this.section);
  }
}
