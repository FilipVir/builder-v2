import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'db-sections-loading',
  templateUrl: './sections-loading.component.html',
  styleUrl: './sections-loading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeOut', [
      transition(':enter', [
        animate('.5s', style({opacity: 1}))
      ]), // No animation on enter
      transition(':leave', [
        animate('.1s', style({opacity: 0}))
      ])
    ])
  ]
})
export class SectionsLoadingComponent {
  loading = false;
  hideAll = false;
  @Input() hideTooltip = false;
  @Output() loadingEnded: EventEmitter<void> = new EventEmitter<void>();

  constructor(private _cdr: ChangeDetectorRef) {
  }

  @Input('loading') set loadingState(loading: boolean) {
    if (this.loading && !loading) {
      this._removeCheckOnDisappear();
    }
    this.loading = loading;
  }

  private _removeCheckOnDisappear() {
    setTimeout(() => {
      this.hideAll = true;
      this._cdr.markForCheck();
      this.hideLoading();
    }, 2000);
  }

  private hideLoading() {
    setTimeout(() => {
      this.loadingEnded.emit();
    }, 500);
  }

}
