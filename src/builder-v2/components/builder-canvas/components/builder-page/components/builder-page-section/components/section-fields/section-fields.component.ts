import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BuilderGeneratedPageSectionI} from "../../../../../../../../builder-v2.interface";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'db-section-fields',
  templateUrl: './section-fields.component.html',
  styleUrl: './section-fields.component.scss'
})
export class SectionFieldsComponent {
  @Input() section: BuilderGeneratedPageSectionI;
  @Input() static: boolean;
  @Input('selected') set onSelected(selected: boolean) {
    this.selected = selected;
  }

  selected: boolean = false;
  @Input() titleForm: FormControl = new FormControl();
  @Input() descriptionForm: FormControl = new FormControl();
  @Output() isEdit: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() valueChange: EventEmitter<{
    section_title: string;
    section_description: string;
  }> = new EventEmitter<{
    section_title: string;
    section_description: string;
  }>();

  onBlur() {
    this.isEdit.emit(false);
    if (this.titleForm?.dirty || this.descriptionForm?.dirty) {
      this.valueChange.emit({
        section_title: this.titleForm.value,
        section_description: this.descriptionForm.value
      });
    }
  }

  selectText() {
    if (!this.selected) {
      return;
    }
    this.isEdit.emit(true);
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault(); // Prevent the default paste behavior

    const clipboardData = event.clipboardData || window['clipboardData'];
    const pastedText = clipboardData.getData('Text');
    const planeText = pastedText.replace(/(<([^>]+)>)/g, "");

    // Insert the plain text content into the editable div without any HTML
    document.execCommand('inserttext', false, planeText);
  }
}
