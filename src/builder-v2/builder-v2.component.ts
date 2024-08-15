import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit, SimpleChanges
} from '@angular/core';
import {BuilderHistoryService} from "./builder-history.service";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {DbModalService} from "../modules/modal/modal";
import {
  OutlineGenerationComponent
} from "./components/outline-generation/outline-generation.component";
import {BuilderStepsEnum, BuilderTourEnum} from "./builder-tour.enum";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SUPPORTED_FONTS_LIST} from "./components/website-customizer/supported-fonts-list.constants";
import {filter, map, mergeMap, switchMap, take} from "rxjs/operators";
import {combineLatest} from "rxjs";
import {ActivityAction} from "../activities/activity";
import {ActivityNotificationService} from "../activity-notifications/activity-notification.service";
import {BuilderV2Service} from "./builder-v2.service";
import {
  BuilderGeneratedPageI,
  BuilderGeneratedPageSectionI,
  PageThemeI,
  SiteGenerationI,
  StorageSiteStateI
} from "./builder-v2.interface";
import {WEBSITE_CUSTOMIZATIONS} from "./components/website-customizer/wesite-customization-options.constants";
import {BuilderSectionsInteractionService} from "./builder-sections-interaction.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import * as fromStore from '../store';
import {DbStoreState} from '../store';
import {Store} from "@ngrx/store";
import {DialogService} from "../../ng2-bootstrap-modal/dialog.service";
import {
  NotificationDialogComponent
} from "../shared/components/dialogs/notification-dialog/notification-dialog.component";
import {NotifierComponent} from "../shared/components/notifier/notifier.component";
import {Notification} from "../shared/components/notifier/notification";
import {NotificationType} from "../shared/components/notifier/notification-type";
import {showConfetti} from "../shared/utils/confetti";
import {DbActiveModal, DbModalRef} from "../modules/modal/modal-ref";
import {GoogleAnalyticsService} from "../shared/services/google-analytics/google-analytics.service";
import {Config} from "../config/config";
import {User} from "../user/user";
import {ActivatedRoute, Router} from "@angular/router";
import {CookieService} from "ngx-cookie";
import {
  CreateAiAssistantSignUpComponent
} from "../components/pages/setup/create-ai/create-ai-assistant/create-ai-assistant-sign-up/create-ai-assistant-sign-up.component";
import {TextUtils} from "../shared/utils/text-utils";
import aiSteps from "./builder-steps.json";
import {merge} from "rxjs/internal/observable/merge";
import {Observable} from "rxjs/internal/Observable";
import {of} from "rxjs/internal/observable/of";
import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";
import {CanvasZoomService} from "./services/canvas-zoom.service";
import {CommonBuilderDataService} from "./services/common-builder-data.service";
import {TriggersService} from "./services/triggers.service";

@Component({
  selector: 'db-builder-v2',
  templateUrl: './builder-v2.component.html',
  styleUrl: './builder-v2.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderV2Component implements OnInit, OnDestroy {
  @Input() popupMode = false;
  @Input() companyType: string;
  @Input() paramsForGeneration;
  @Input() dataForGeneration;
  @Input() domainId;
  @Input() demoUser: boolean = false;
  @Input() currentOutline = false;
  @Input() isOnboarding = true;
  @Input() isFromGenerate: boolean;
  @Input() forRecreateFirstTime: boolean;
  @Input() user: User;

  scale: number = 1;
  fontStyles: SafeHtml[] = [];
  tourEnum = BuilderTourEnum;
  tourStep = null;
  generationStarted: boolean = false;
  accentZIndex = 20;
  requestActions = {
    [ActivityAction.BUILDER_GET_OUTLINE]: this._handleOutlineResp.bind(this),
    [ActivityAction.BUILDER_STYLES]: this._handleStyleResp.bind(this),
    [ActivityAction.BUILDER_SECTION_TYPES]: this._handleModifySectionResp.bind(this),
    [ActivityAction.BUILDER_SECTION_ENHANCE]: this._handleEnhanceResp.bind(this),
    [ActivityAction.BUILDER_SECTION_GENERATE]: this._handleEnhanceResp.bind(this),
    [ActivityAction.BUILDER_SECTION_SUGGEST_TITLE]: this._handleEnhanceResp.bind(this),
    [ActivityAction.BUILDER_SECTION_SUGGEST_DESCRIPTION]: this._handleEnhanceResp.bind(this),
    [ActivityAction.BUILDER_COLORS]: this._handleModifyColorResp.bind(this),
    [ActivityAction.BUILDER_BUILD_SITE_OUTLINE]: this._handleBuildSite.bind(this),
  };
  outline: BuilderGeneratedPageI;
  pageTheme: PageThemeI;
  fromStartAIPage: boolean;
  aiSteps: string[] = aiSteps;
  uniqueId: string;
  builderStep = BuilderStepsEnum;
  fromInnerAIPage: boolean;
  isMobile: boolean;
  openMagicLink: boolean;
  showSiteMap: boolean = false;
  fromGoogleSignup: any;
  userLocalStorage: any;

  private _generationModalRef: DbModalRef;
  private _destroyRef = inject(DestroyRef);


  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('back-generation-step') && this.popupMode) {
      this._activeModal.close();
      this._generationModalRef.close();
    }
    if (target.classList.contains('modal-close-outside')) {
      this._modalService.dismissAll();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.which === 9 && event.shiftKey) {
      event.preventDefault();
    }
  }

  constructor(public builderHistoryService: BuilderHistoryService,
              private _modalService: DbModalService,
              private _activeModal: DbActiveModal,
              private _builderService: BuilderV2Service,
              private _route: ActivatedRoute,
              private _store: Store<DbStoreState>,
              private _activityNotificationService: ActivityNotificationService,
              public builderInteractionsService: BuilderSectionsInteractionService,
              private sanitizer: DomSanitizer,
              private _dialogService: DialogService,
              private _cookieService: CookieService,
              private _activeRoute: ActivatedRoute,
              private _googleAnalyticsService: GoogleAnalyticsService,
              private _commonDataService: CommonBuilderDataService,
              private _builderTriggerService: TriggersService,
              private _cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    if (localStorage.getItem('loadingGoogle')) {
      localStorage.removeItem('dbStartAiParams');
      localStorage.removeItem('dbFromEcommerce');
      localStorage.removeItem('loadingGoogle');
    }
    this.isMobile = window.innerWidth <= 991;
    this.user = this._route.snapshot.parent?.parent?.data['user'];
    this.getUser();
    const fromGoogleSignup = window.location.href.indexOf("finalize") > -1 || localStorage.getItem('dbStartAiParams');
    this.fromStartAIPage = window.location.href.indexOf("v2-ai-website-building") > -1;
    this.fromInnerAIPage = window.location.href.indexOf("ai-builder") > -1;
    this.popupMode && this.builderHistoryService.builderStep.next(BuilderStepsEnum.FILL_COMPANY_INFO);
    if (localStorage.getItem('sessionId')) {
      this.uniqueId = localStorage.getItem('sessionId');
      this._commonDataService.uniqueId = this.uniqueId;
    } else {
      this._getUniqueId();
    }
    this._listenBuilderNotifications();
    this._listenSectionChange();
    this._listenChangeInState();
    this._initOutline();
    this._listenTour();
    this._listenEnhance();
    this.loadFontStyles();
    this.builderHistoryService.getLocalStorage();
    this.showFinalize(fromGoogleSignup);
    this._setBuilderStep();
    this._commonDataService.domainId = this.domainId;
  }

  private _listenEnhance() {
    this.builderInteractionsService.enhanceSection
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(value => {
        const requestObj = this.builderInteractionsService.getModifiedSectionStructure(this.builderInteractionsService.pageSections, value.index);
        requestObj.page_outline.sections = this.builderInteractionsService.removeExtraKeysFromSections(requestObj.page_outline.sections, true);
        switch (value.type) {
          case "enhance": {
            this._onEnhanceSection(requestObj);
            break;
          }
          case "description": {
            this._onEnhanceSectionDescription(requestObj);
            break;
          }
          case "title": {
            this._onEnhanceSectionTitle(requestObj);
            break;
          }
          case "new": {
            this._onGenerateSection(requestObj);
            break;
          }
        }
      });
  }

  private _onEnhanceSectionDescription(sectionObj) {
    this._enhanceSectionDescription(sectionObj);
  }

  private _onEnhanceSection(sectionObj) {
    this._enhanceSection(sectionObj);
  }

  private _onEnhanceSectionTitle(sectionObj) {
    this._enhanceSectionTitle(sectionObj);
  }

  private _onGenerateSection(sectionObj) {
    this._generateSection(sectionObj);
  }


  closeModal(): void {
    if (this._generationModalRef) {
      this._generationModalRef.close();
    }
  }

  loadFontStyles() {
    this.fontStyles = SUPPORTED_FONTS_LIST.map(font => {
      const fontStyle = `@import url('https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@400;600;700&display=swap');`;
      return this.sanitizer.bypassSecurityTrustHtml(`<style>${fontStyle}</style>`);
    });
  }

  generateWebsite(forGoogleSignup = false) {
    // console.log(this._getGenerationStructure());
    // return;
    this.builderInteractionsService.buildLoading.next(true);
    if (!this.user) {
      this._signUpUser();
    } else {
      this._generateWebsite(forGoogleSignup);
    }
  }

  public showFinalize(fromGoogleSignup): void {
    if (fromGoogleSignup) {
      if (this.user) {
        this.generateWebsite(true);
      } else {
        this._openOutlineGenerationDialog();
      }
    }
  }

  public getUser(): void {
    this._store.select(fromStore.getUserLoaded)
      .pipe(
        filter((loaded: boolean) => loaded),
        switchMap(() => combineLatest(
          this._store.select(fromStore.getUser),
          this._store.select(fromStore.getUserLocalStorage)),
        ))
      .subscribe(([user, userLocalStorage]) => {
        this.user = user;
        this.userLocalStorage = userLocalStorage;
      });
  }

  private _getUniqueId(): void {
    this._builderService.getBuilderUniqueId()
      .subscribe(
        (response) => {
          if (response && response.data) {
            !this.user && this.builderHistoryService.setSessionId(response.data.uniqueId);
            this.uniqueId = !this.user ? this.builderHistoryService.getUniqueId() : response.data.uniqueId;
            this._commonDataService.uniqueId = this.uniqueId;
          }
        });
  }

  private _initOutline() {
    const storageData = this.builderHistoryService.getStateFromStorage();
    if (storageData && (this.currentOutline || !this.popupMode)) {
      this._setStateFromStorage(storageData);
      return;
    }
  }

  private _listenChangeInState() {
    const urlInfo = (<any>this._activeRoute.queryParams).value;
    if (urlInfo && urlInfo?.magicLink) {
      const jsonString = atob(urlInfo?.magicLink);
      const dataFromUrl = JSON.parse(jsonString);
      localStorage.setItem('sessionId', dataFromUrl?.uniqueId);
      this.builderHistoryService.saveStateInStorage(dataFromUrl);
    } else {
      this.builderInteractionsService.saveLocalState
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(_ => {
          this.builderHistoryService.saveStateInStorage({
            ...this._getGenerationStructure(),
            active_color: this.builderInteractionsService.activeColor.value,
            generated_color: WEBSITE_CUSTOMIZATIONS.colors[0],
            tour_step: this.builderHistoryService.tourStep.value,
            siteInfo: this.builderInteractionsService.siteInfo.value,
            website_info: this.builderInteractionsService.websiteInfo
          });
          this._builderTriggerService.calculateMinZoom.next();
        });
    }
  }

  private _listenSectionChange() {
    this.builderInteractionsService.sectionChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((value) => {
        const sectionObj = this.builderInteractionsService.getModifiedSectionStructure(value.sections, value.changedIndex);
        sectionObj.page_outline.sections = this.builderInteractionsService.removeExtraKeysFromSections(sectionObj.page_outline.sections);
        this._getModifiedSectionType(sectionObj);
      });
  }

  private _listenTour() {
    this.builderHistoryService.tourStep
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(value => {
        this.tourStep = value;
        if (this.tourEnum.OUTLINE_POPUP !== value) {
          this.builderInteractionsService.saveLocalState.next();
        }
      });
  }

  private _openOutlineGenerationDialog(): void {
    this._generationModalRef = this._modalService.open(OutlineGenerationComponent, {
      height: 544,
      width: 1000,
      hasCloseBtn: false,
      backdrop: 'static',
      backdropClass: 'generation-backdrop'
    });
    if (this.popupMode) {
      this._generationModalRef.componentInstance.step = this.popupMode ? 'companyInfo' : 'chooseWebsiteType';
      this._generationModalRef.componentInstance.companyType = this.companyType;
      this._generationModalRef.componentInstance.data = this.dataForGeneration;
      this._generationModalRef.componentInstance.params = this.paramsForGeneration;
      this._generationModalRef.componentInstance.domainId = this.domainId;
    }
  }


  private _listenBuilderNotifications() {
    this._subscribeToNotifs();
    this.builderInteractionsService.requestSubject.pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(({action, response}) => {
      if (!response) {
        return;
      }
      if (!response.success && !response.data) {
        this._showErrorNotif();
      }
      this.requestActions[action](response.data, this.uniqueId);
    });
  }

  private _handleStyleResp(styleResponse: PageThemeI) {
    const newColor = {
      title: 'AI suggested',
      primaryColor: styleResponse.colors.primary_color,
      secondaryColor: styleResponse.colors.secondary_color,
    };
    WEBSITE_CUSTOMIZATIONS.colors.unshift(newColor);
    this.builderInteractionsService.aiGeneratedStyle = styleResponse;
    this.builderInteractionsService.activeFont.next(styleResponse.fonts.primary_font);
    this.builderInteractionsService.defaultColor.next(newColor);
    this.builderInteractionsService.activeColor.next(newColor);
    this.pageTheme = styleResponse;
  }

  private _handleOutlineResp(outlineResponse: BuilderGeneratedPageI) {
    this.builderInteractionsService.loading.next(false);
    const nextStep = this.popupMode || !!this.isMobile ? BuilderTourEnum.END : BuilderTourEnum.INTRO;
    this.builderHistoryService.tourStep.next(nextStep);
    this.outline = outlineResponse as any;
    this.builderInteractionsService.websiteInfo = {
      website_description: outlineResponse.website_description,
      website_keyphrase: outlineResponse.website_keyphrase,
      website_title: outlineResponse.website_title,
      website_design_type_level: outlineResponse.website_design_type_level
    };
    this.builderInteractionsService.pageSections = outlineResponse.page_outline.sections.map((section, i) => {
      section.id = new Date().getTime() + i;
      section.section_type = null;
      return section;
    });
    const sectionObj = this.builderInteractionsService.getModifiedSectionStructure(this.builderInteractionsService.pageSections);
    this._getModifiedSectionType(sectionObj);
  }

  private _setStateFromStorage(state: StorageSiteStateI) {
    this.outline = {pages_meta: state.pages_meta, page_outline: state.page_outline} as any;
    this.pageTheme = {colors: state.colors, fonts: state.fonts} as any;
    this.builderInteractionsService.activeTheme.next(state.theme);
    this.builderInteractionsService.defaultColor.next(state.active_color);
    this.builderInteractionsService.activeColor.next(state.active_color);
    this.builderInteractionsService.activeFont.next(state.fonts.primary_font);
    this.builderHistoryService.tourStep.next(state.tour_step);
    this.builderInteractionsService.pageSections = state.page_outline.sections;
    this.builderInteractionsService.siteInfo.next(state.siteInfo);
    this.builderInteractionsService.websiteInfo = {
      website_description: state?.website_info?.website_description,
      website_keyphrase: state?.website_info?.website_keyphrase,
      website_title: state?.website_info?.website_title,
      website_design_type_level: state?.website_info?.website_design_type_level,
    };
    const [home, ...secondaryMetas] = state.pages_meta;
    this.builderInteractionsService.secondaryPages.next(this.builderInteractionsService.convertToSecondaryPages(secondaryMetas));
    !!this.isMobile && !!state?.page_outline?.sections?.length && (this.showSiteMap = true);
    const existingColorIndex = WEBSITE_CUSTOMIZATIONS.colors.findIndex(color =>
      color.primaryColor === state.generated_color.primaryColor &&
      color.secondaryColor === state.generated_color.secondaryColor);

    if (existingColorIndex === -1) { // Check if the color doesn't exist
      WEBSITE_CUSTOMIZATIONS.colors.unshift(state.generated_color);
    }
  }

  private _handleModifySectionResp(sectionTypes: BuilderGeneratedPageSectionI[]) {
    this.builderInteractionsService.updateSectionTypes.next(sectionTypes);
  }

  private _handleEnhanceResp(enhancedSection) {
    this.builderInteractionsService.updateEnhancedSection.next(enhancedSection);
  }

  private _handleModifyColorResp(color: any) {
    this.pageTheme.colors = {...color};
  }

  private _sendEvent(category: string, action: string, label: string): void {
    const analyticsData = {
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      uniqueId: this.uniqueId
    };

    if (!this.user) {
      this._googleAnalyticsService.sendAnalyticsEventWithCoreWithoutUserData(analyticsData);
    } else {
      this._googleAnalyticsService.sendAnalyticsEventWithCore(analyticsData);
    }
  }

  private _handleBuildSite(resp: any) {
    const dbTesting = !!this._cookieService.get('db-testing');
    this.builderInteractionsService.buildLoading.next(false);

    if (!resp || !resp?.action_id) {
      NotifierComponent.notify(new Notification("Something went wrong...", NotificationType.DANGER));
      localStorage.removeItem('showBuilderV2Finalize');
      return;
    }
    this._store.dispatch(new fromStore.LoadWebsites());
    this._sendEvent(this.popupMode ? 'Dashboard Action' : 'Onboarding', 'Section-based AI Flow - Success pop-up opened', '-');

    this._modalService.dismissAll();
    // this._removeSavedState();
    if (this.popupMode) {
      return;
    }
    this.builderHistoryService.getLocalStorage();
    this._dialogService.addDialog(NotificationDialogComponent, {
      header: 'Congrats!',
      message: 'Your website was successfully created with AI',
      buttonText: 'Preview & Edit',
      buttonColor: 'black',
      hasGradientBorder: true,
      gradientBorder: 'purple-blue',
      hasAdminLink: false,
      action: 'preview',
      hasCloseButton: false,
      withBlur: true
    }).subscribe((confirmed: string): void => {
      if (confirmed === 'preview') {
        this._sendEvent(this.popupMode ? 'Dashboard Action' : 'Onboarding', 'Section-based AI Flow - Preview and Edit', '-');
        window.open(`${resp.action_id.page_link}?from=onboarding&domain_id=${this.domainId || Config.demoDomainId}&client_id=${this.user?.id}&first_time&client_email=${this.user?.email}` + (dbTesting ? `&db-testing` : ``), '_blank');
        this.builderHistoryService.setToUserLocalStorage(!this.popupMode);
        setTimeout(() => {
          window.location.href = window.location.origin + "/websites?showUpgradePopup=1&afterOnboarding=1";
          localStorage.removeItem("dbStartAiParams");
          localStorage.removeItem("sessionId");
          localStorage.removeItem("showBuilderV2Finalize");
        }, 500);
      }
    });
    showConfetti();
  }

  private _removeSavedState() {
    this.builderHistoryService.resetSubjects();
    this.builderInteractionsService.resetSubjects();
    this.builderHistoryService.removeStateFromStorage();
  }

  private _showErrorNotif() {
    NotifierComponent.notify(new Notification("Something went wrong...", NotificationType.DANGER));
  }

  private _getModifiedSectionType(data) {
    this._builderService.aiModifySectionTypes(data, this.domainId, this.uniqueId).subscribe();
  }

  private _enhanceSection(data) {
    this._builderService.enhanceSection(data, this.domainId, this.uniqueId).subscribe();
  }

  private _enhanceSectionTitle(data) {
    this._builderService.enhanceSectionTitle(data, this.domainId, this.uniqueId).subscribe();
  }

  private _enhanceSectionDescription(data) {
    this._builderService.enhanceSectionDescription(data, this.uniqueId).subscribe();
  }

  private _generateSection(data) {
    this._builderService.generateSection(data, this.domainId, this.uniqueId).subscribe();
  }

  private _getGenerationStructure(dataFromUrl?): SiteGenerationI {
    const sections = this.builderInteractionsService.removeFormControls(this.builderInteractionsService.pageSections
      .filter(section => section.section_title || section.section_description)
      .map(({loading, is_tempo, ...section}, index) => {
        return {...section, index};
      }));
    const activeColor = this.builderInteractionsService.activeColor.value;
    const colors = {
      primary_color: activeColor.primaryColor,
      secondary_color: activeColor.secondaryColor,
    };
    const siteInfo = dataFromUrl ? dataFromUrl : this.builderInteractionsService.siteInfo.value;
    const getDomainInfo = localStorage.getItem('dbOnboardingDomainInfo');
    const additional = !this.popupMode || this.demoUser ? {ai_type: 'ai_builder_demo', domain_name: getDomainInfo} : {};
    !!this.isMobile && !!sections?.length && (this.showSiteMap = true);
    return {
      business_type: siteInfo.business_type,
      business_name: siteInfo.business_name,
      business_description: siteInfo.business_description,
      website_title: this.builderInteractionsService.websiteInfo?.website_title,
      website_description: this.builderInteractionsService.websiteInfo?.website_description,
      website_keyphrase: this.builderInteractionsService.websiteInfo?.website_keyphrase,
      website_design_type_level: this.builderInteractionsService.websiteInfo?.website_design_type_level,
      page_outline: {sections},
      fonts: {primary_font: this.builderInteractionsService.activeFont.value},
      colors: activeColor.title === "Ai suggested" ? this.pageTheme.colors : colors,
      theme: this.builderInteractionsService.activeTheme.value.toLowerCase(),
      pages_meta: [this.outline?.pages_meta[0], ...this.builderInteractionsService.getPagesMeta()],
      post_status: 'publish',
      ...additional
    };
  }

  private _signUpUser(): void {
    this._showSignUpComponent();
  }

  private _generateWebsite(forGoogleSignup = false): void {
    this._cdr.markForCheck();
    this.generationStarted = true;
    this.builderHistoryService.builderStep.next(BuilderStepsEnum.SHOW_FINALIZE);
    if (forGoogleSignup) {
      localStorage.setItem('showBuilderV2Finalize', '1');
      this._builderService.aiGenerateSite(this._getGenerationStructure(), this.domainId, this.uniqueId).subscribe();
    } else {
      this._builderService.aiGenerateSite(this._getGenerationStructure(), this.domainId, this.uniqueId).subscribe();
    }
  }

  private _showSignUpComponent(): void {
    const storageData = this.builderHistoryService.getStateFromStorage();
    const modal = this._modalService.open(CreateAiAssistantSignUpComponent, {hasCloseBtn: true, overflowHidden: false});
    modal.componentInstance.title = TextUtils.getText('text_signUpTitleStartAi');
    modal.componentInstance.desc = TextUtils.getText('text_signUpDescStartAi');
    modal.componentInstance.steps = this.aiSteps;
    modal.componentInstance.params = storageData;
    modal.closed.subscribe(() => {
      this._subscribeToNotifs();
      this._generateWebsite();
    });
    modal.dismissed.subscribe(() => {
      this.builderInteractionsService.buildLoading.next(false);
      this._sendGaEvent('pop-up closed');
    });
  }

  private _subscribeToNotifs() {
    this._activityNotificationService.subscribeToActivities()
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        filter((data: any) => {
          return data && [ActivityAction.BUILDER_BUILD_SITE_OUTLINE].includes(data.action) &&
            data.progress === 100;
        }),
        map((data) => data.action),
        mergeMap((action: string) => this._builderService.getBuilderActionData(action, this.domainId, this.uniqueId))
      ).subscribe(({action, response}) => {
      if (!response) {
        return;
      }
      this.requestActions[action](response.data, this.uniqueId);
    });
  }


  private _setBuilderStep() {
    if (localStorage.getItem('showBuilderV2Finalize')) {
      this.builderHistoryService.builderStep.next(BuilderStepsEnum.SHOW_FINALIZE);
    } else if (this.outline) {
      this.builderHistoryService.builderStep.next(BuilderStepsEnum.SHOW_CANVAS);
    } else if (this.companyType) {
      this.builderHistoryService.builderStep.next(BuilderStepsEnum.FILL_COMPANY_INFO);
    } else {
      this.builderHistoryService.builderStep.next(BuilderStepsEnum.CHOOSE_BUSINESS_TYPE);
    }
  }

  ngOnDestroy() {
    this.closeModal();
    if (this.popupMode && !this.demoUser) {
      this._removeSavedState();
    }
  }

  private _sendGaEvent(label): void {
    const analyticsData = {
      eventCategory: 'Onboarding',
      eventAction: 'Sign-up form',
      eventLabel: label,
      uniqueId: this.uniqueId
    };
    this._googleAnalyticsService.sendAnalyticsEventWithCoreWithoutUserData(analyticsData);
  }

}
