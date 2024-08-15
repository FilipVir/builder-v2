import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BuilderGeneratedPageSectionI} from "../../../../../../builder-v2.interface";

@Component({
  selector: 'db-section-notifs',
  templateUrl: './section-notifs.component.html',
  styleUrl: './section-notifs.component.scss'
})
export class SectionNotifsComponent {
  @Input() section: BuilderGeneratedPageSectionI;
  @Input() hasError = false;
  @Input() index: number;
  @Output() onGenerate: EventEmitter<"new" | "enhance" | "title" | "description"> =
    new EventEmitter<"new" | "enhance" | "title" | "description">();
}
