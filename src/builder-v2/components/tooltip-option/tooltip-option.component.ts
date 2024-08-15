import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input} from '@angular/core';
import {BuilderSectionsInteractionService} from "../../builder-sections-interaction.service";

@Component({
  selector: 'db-tooltip-option',
  templateUrl: './tooltip-option.component.html',
  styleUrl: './tooltip-option.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipOptionComponent {
  @Input() options;
  @Input() limitPassed;
  system = navigator.platform.indexOf('Mac') > -1 ? 'mac' : 'win';

  constructor(public sectionInteractions: BuilderSectionsInteractionService) {
  }
}
