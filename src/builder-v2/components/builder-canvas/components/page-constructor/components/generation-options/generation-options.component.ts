import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'db-generation-options',
  templateUrl: './generation-options.component.html',
  styleUrl: './generation-options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerationOptionsComponent {
  @Input() options = [];
  @Input() disableAll = false;
  @Output() onGenerate: EventEmitter<'new' | 'enhance' | 'title' | 'description'> =
    new EventEmitter<'new' | 'enhance' | 'title' | 'description'>();

}
