import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnInit,
  Output
} from '@angular/core';
import {BuilderHistoryService} from "../../builder-history.service";
import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";
import {BuilderTourEnum} from "../../builder-tour.enum";
import {BuilderSectionsInteractionService} from "../../builder-sections-interaction.service";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {
  NotificationDialogComponent
} from "../../../shared/components/dialogs/notification-dialog/notification-dialog.component";
import {DialogService} from "../../../../ng2-bootstrap-modal/dialog.service";
import value from "*.json";
import {DbModalService} from "../../../modules/modal/modal";
import {Router} from "@angular/router";
import {PlatformLocation} from "@angular/common";
import {map} from "rxjs/operators";
import {merge} from "rxjs/internal/observable/merge";
import {CommonBuilderDataService} from "../../services/common-builder-data.service";

@Component({
  selector: 'db-builder-header',
  templateUrl: './builder-header.component.html',
  styleUrl: './builder-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuilderHeaderComponent implements OnInit {
  @Output() switchCustomization: EventEmitter<void> = new EventEmitter<void>();
  @Output() onGenerate: EventEmitter<void> = new EventEmitter<void>();
  @Input() showCover;
  @Input() popupMode: boolean;
  @Input() user;
  customizationOpened = false;
  isMobile = false;
  tourEnum = BuilderTourEnum;
  disabledBtnSteps = [
    BuilderTourEnum.START,
    BuilderTourEnum.OUTLINE_POPUP,
    BuilderTourEnum.INTRO];
  disabledGenerateBtnSteps = [
    BuilderTourEnum.START,
    BuilderTourEnum.OUTLINE_POPUP,
    BuilderTourEnum.CUSTOMIZER,
    BuilderTourEnum.INTRO];
  companyName: string;
  pageLoaded;

  isInvalid$ = this.builderHistoryService.history
    .asObservable()
    .pipe(map(state => {
      return this._checkInvalidity(state);
    }));

  private _checkInvalidity(state): boolean {
    const currentState = state[this.builderHistoryService.latestStateIndex.value];
    if (currentState) {
      return currentState.invalidSections.some(value => !!value) ||
        currentState.sections.filter(section => !!section.section_title).length < 3;
    }
    return false;
  }

  @HostListener('document:keydown.control.z', ['$event'])
  @HostListener('document:keydown.meta.z', ['$event'])
  undo(event: KeyboardEvent) {
    event.preventDefault();
    this.changeState(this.builderHistoryService.canUndo, -1);
  }

  @HostListener('document:keydown.control.shift.z', ['$event'])
  @HostListener('document:keydown.meta.shift.z', ['$event'])
  redo(event: KeyboardEvent) {
    event.preventDefault();
    this.changeState(this.builderHistoryService.canRedo, 1);
  }

  constructor(public builderHistoryService: BuilderHistoryService,
              public _builderSectionsInteractionsService: BuilderSectionsInteractionService,
              private _googleAnalyticsService: GoogleAnalyticsService,
              private _dialogService: DialogService,
              private _builderCommonDataService: CommonBuilderDataService,
              private _router: Router) {
  }

  ngOnInit() {
    this.isMobile = window.innerWidth <= 991;
    this._builderSectionsInteractionsService.siteInfo.subscribe(companyName => {
      this.companyName = companyName && companyName['business_name'];
    });
    window.history.pushState(null, "", window.location.href);
    this._builderSectionsInteractionsService.pageLoaded.subscribe((value) => {
      this.pageLoaded = value;
    });
  }

  back() {
    this._dialogService.addDialog(NotificationDialogComponent, {
      header: 'Are you sure you want to leave this page?',
      message: 'Changes you made may not be saved.',
      buttonText: 'Leave',
      showCancelButton: true,
      buttonColor: 'black',
      hasAdminLink: false,
      action: 'preview',
      hasCloseButton: false
    }).subscribe((confirmed: string): void => {
      if (confirmed) {
        this._router.navigate([!this.user ? '/setup-onboarding' : '../']);

        this.builderHistoryService.removeStateFromStorage();
        this.builderHistoryService.resetSubjects();
        this._builderSectionsInteractionsService.resetSubjects();
        this.sendEvent(this.popupMode ? 'Dashboard Action' : 'Onboarding', 'Section-based AI Flow - Leave Outline editor', '-');
      }
    });
  }

  getCompanyName() {
    const storageData = this.builderHistoryService.getStateFromStorage();
    this.companyName = storageData?.siteInfo?.business_name || this._builderSectionsInteractionsService.siteInfo['business_name'];
  }

  changeState(canMove: BehaviorSubject<boolean>, direction: number) {
    if (canMove.value && !this._builderSectionsInteractionsService.secondaryPageLoading.value) {
      this.builderHistoryService.changeCurrentState(direction);
    }
  }

  customizeWebsite() {
    if (this.showCover || this.builderHistoryService.tourStep.value === this.tourEnum.INTRO) {
      return;
    }
    this.sendEvent(this.popupMode ? 'Dashboard Action' : 'Onboarding', 'Section-based AI Flow - Customize Website', 'Open interface');
    this.customizationOpened = !this.customizationOpened;
    this.switchCustomization.emit();
  }

  generateWebsite() {
    if (this.showCover ||
      this.builderHistoryService.tourStep.value === this.tourEnum.INTRO ||
      this._builderSectionsInteractionsService.buildLoading.value) {
      return;
    }
    this.sendEvent(this.popupMode ? 'Dashboard Action' : 'Onboarding', 'Section-based AI Flow - Outline Submitted', '-');
    this._builderSectionsInteractionsService.saveCustomizationChanges.next();
    this.onGenerate.emit();
  }

  saveCustomization() {
    this.sendEvent(this.popupMode ? 'Dashboard Action' : 'Onboarding', 'Section-based AI Flow - Customize Website', 'Done');
    this.customizationOpened = !this.customizationOpened;
    this.switchCustomization.emit();
    this._builderSectionsInteractionsService.saveCustomizationChanges.next();
  }

  sendEvent(category: string, action: string, label: string): void {
    const analyticsData = {
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      uniqueId: this._builderCommonDataService.uniqueId
    };
    if (!this.user) {
      this._googleAnalyticsService.sendAnalyticsEventWithCoreWithoutUserData(analyticsData);
    } else {
      this._googleAnalyticsService.sendAnalyticsEventWithCore(analyticsData);
    }
  }

}
