import {
  ChangeDetectionStrategy,
  Component, EventEmitter, Input, OnChanges,
  OnInit, Output, SimpleChanges
} from '@angular/core';
import {BuilderHistoryService} from "../../builder-history.service";
import {User} from "../../../user/user";

@Component({
  selector: 'db-sitemap-mobile-dialog',
  templateUrl: './sitemap-mobile-dialog.component.html',
  styleUrl: './sitemap-mobile-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SitemapMobileDialogComponent implements OnInit, OnChanges {
  public loading: boolean = false;
  public isCopiedHostNames: boolean;
  public showMagicLinkInfo: boolean;
  public visibleTooltip: boolean = false;
  public magicLinkUrl: string;
  @Input() user: User;
  @Input() openMagicLink: boolean = false;
  @Input() generationStarted: boolean = false;
  @Output() startGeneration: EventEmitter<boolean> = new EventEmitter<boolean>();


  constructor(
    public builderHistoryService: BuilderHistoryService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['openMagicLink'] ) {
      this.openMagicLink && (this.showMagicLinkInfo = true);
    }
    if (changes && changes['generationStarted'] ) {
      this.generationStarted = changes['generationStarted'].currentValue;
    }
  }

  public copyMagicLink(): void {
    this.isCopiedHostNames = true;
    this.visibleTooltip = true;
    setTimeout( () => this.visibleTooltip = false, 2000);
  }

  ngOnInit() {
    const storageData = this.builderHistoryService.getStateFromStorage();
    const sessionId = localStorage.getItem('sessionId');
    const storageDataWithUniqueId = {...storageData, uniqueId: sessionId};
    const oneLineData = JSON.stringify(storageDataWithUniqueId);
    const encodedData = btoa(oneLineData);
    this.magicLinkUrl = location.origin + (!!this.user ? '/setup' : '/setup-onboarding') + '/v2-ai-website-building?magicLink=' + encodedData;
  }
}
