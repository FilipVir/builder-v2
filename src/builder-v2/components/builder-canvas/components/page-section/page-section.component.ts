import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {FormControl} from "@angular/forms";
import {BuilderGeneratedPageSectionI} from "../../../../builder-v2.interface";

@Component({
  selector: 'db-page-section',
  templateUrl: './page-section.component.html',
  styleUrl: './page-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageSectionComponent implements OnInit {
  @Input() section: BuilderGeneratedPageSectionI;
  @Input() static: boolean;
  @Input() title: string;
  @Input() builderStep: boolean;
  @Input() selected: boolean;
  @Output() onAddSectionBelow: EventEmitter<void> = new EventEmitter<void>();
  @Output() isEdit: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() inputChange: EventEmitter<{ section_title: string; section_description: string }> = new EventEmitter<{
    section_title: string;
    section_description: string
  }>();
  @Output() valueChange: EventEmitter<{ section_title: string; section_description: string }> = new EventEmitter<{
    section_title: string;
    section_description: string
  }>();
  @Input() titleControl: FormControl<string> = new FormControl<string>('');
  @Input() descriptionControl: FormControl<string> = new FormControl<string>('');


  constructor() {}

  ngOnInit() {
  }

  selectText(event: FocusEvent) {
    if (!this.selected) {
      return;
    }
    this.isEdit.emit(true);
  }

  inputBlur() {
    this.isEdit.emit(false);
    if (this.titleControl?.dirty || this.descriptionControl?.dirty) {
      this.valueChange.emit({
        section_title: this.titleControl.value,
        section_description: this.descriptionControl.value
      });
      this.descriptionControl?.markAsPristine();
      this.titleControl?.markAsPristine();
    }
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
