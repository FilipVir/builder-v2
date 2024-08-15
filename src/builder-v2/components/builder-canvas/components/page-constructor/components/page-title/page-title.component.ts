import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {BuilderTourEnum} from "../../../../../../builder-tour.enum";
import {BuilderHistoryService} from "../../../../../../builder-history.service";
import {BuilderSectionsInteractionService} from "../../../../../../builder-sections-interaction.service";

@Component({
  selector: 'db-page-title',
  templateUrl: './page-title.component.html',
  styleUrl: './page-title.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTitleComponent {
  @Input() loading: boolean;
  @Input() generating: boolean;
  @Output() openSectionTemplates: EventEmitter<void> = new EventEmitter<void>();
  page = {
    title: 'Home page',
  };

  disabledLoadingSteps = [BuilderTourEnum.OUTLINE_POPUP];
  addTemplateSteps = [BuilderTourEnum.END];
  loadingEnded = false;

  constructor(public builderHistoryService: BuilderHistoryService,
              public sectionsInteractionsService: BuilderSectionsInteractionService) {
  }

  openTemplates() {
    if (!this.sectionsInteractionsService.canAddSection.value || this.generating) {
      return;
    }
    setTimeout(() => {
      this.openSectionTemplates.emit();
    });
  }
}
