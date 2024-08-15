import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';

import {BuilderV2RoutingModule} from './builder-v2-routing.module';
import {BuilderV2Component} from "./builder-v2.component";
import {BuilderHeaderComponent} from "./components/builder-header/builder-header.component";
import {DsTooltipDirective} from "../shared/directives/ds-tooltip/ds-tooltip.directive";
import {BuilderCanvasComponent} from './components/builder-canvas/builder-canvas.component';
import {
  PageConstructorComponent
} from './components/builder-canvas/components/page-constructor/page-constructor.component';
import {ZoomControllerComponent} from './components/zoom-controller/zoom-controller.component';
import {DragulaModule} from "ng2-dragula";
import {DbTextPipe} from "../shared/pipes/db-text.pipe";
import {ReactiveFormsModule} from "@angular/forms";
import {
  OutlineGenerationComponent
} from './components/outline-generation/outline-generation.component';
import {ClickOutsideDirective} from "../shared/directives/click-outside/click-outside.directive";
import {PageSectionComponent} from './components/builder-canvas/components/page-section/page-section.component';
import {ClassChangeObserverDirective} from "../shared/directives/class-change-observer/class-change-observer.directive";
import {ZoomTooltipComponent} from './components/zoom-controller/components/zoom-tooltip/zoom-tooltip.component';
import {TooltipOptionComponent} from './components/tooltip-option/tooltip-option.component';
import {
  SectionActionTooltipComponent
} from './components/builder-canvas/components/section-action-tooltip/section-action-tooltip.component';
import {
  SceletonLoadingComponent
} from './components/builder-canvas/components/sceleton-loading/sceleton-loading.component';
import {
  LoadingCircularSpinnerComponent
} from "../shared/components/loading-circular-spinner/loading-circular-spinner.component";
import {LoadingScreenComponent} from "../shared/components/loading-screen/loading-screen.component";
import {
  CreateCompanyInfoComponent
} from "./components/outline-generation/components/create-company-info/create-company-info.component";
import {DbReplaceTextPipe} from "../shared/pipes/db-replace-text.pipe";
import {DbSafePipe} from "../shared/pipes/db-set-safe.pipe";
import {
  SectionsLoadingComponent
} from './components/builder-canvas/components/page-constructor/components/sections-loading/sections-loading.component';
import {
  SectionTemplatesComponent
} from './components/builder-canvas/components/page-constructor/components/section-templates/section-templates.component';
import {
  SectionOptionsComponent
} from './components/builder-canvas/components/page-constructor/components/section-options/section-options.component';
import {
  GenerationOptionsComponent
} from './components/builder-canvas/components/page-constructor/components/generation-options/generation-options.component';
import {
  PageTitleComponent
} from './components/builder-canvas/components/page-constructor/components/page-title/page-title.component';
import {
  SectionNotifsComponent
} from './components/builder-canvas/components/page-constructor/components/section-notifs/section-notifs.component';
import {MainSidebarEmptyComponent} from "../main-sidebar-empty/main-sidebar-empty.component";
import {CheckoutHeaderComponent} from "../auth/checkout/checkout-header/checkout-header.component";
import {StopPinchEventDirective} from "../shared/directives/stop-pinch-event/stop-pinch-event.directive";
import {SitemapMobileDialogComponent} from "./components/sitemap-mobile-dialog/sitemap-mobile-dialog.component";
import {LowerCaseSpecificWordsPipe} from "../shared/pipes/lowerCaseSpecificWords.pipe";
import {ClipboardModule} from "ngx-clipboard";
import {FeedbackFormComponent} from "../shared/components/dialogs/feedback-form/feedback-form.component";
import {
  OutlineGenerationFinalizeComponent
} from "./components/outline-generation/components/outline-generation-finalize/outline-generation-finalize.component";
import {BuilderOutlineComponent} from "./components/builder-outline/builder-outline.component";
import {DraggableCanvasComponent} from "./components/draggable-canvas/draggable-canvas.component";
import { SecondaryPagesComponent } from './components/builder-canvas/components/secondary-pages/secondary-pages.component';
import { BuilderPageComponent } from './components/builder-canvas/components/builder-page/builder-page.component';
import { BuilderPageSectionComponent } from './components/builder-canvas/components/builder-page/components/builder-page-section/builder-page-section.component';
import { BuilderPageBodyComponent } from './components/builder-canvas/components/builder-page/components/builder-page-body/builder-page-body.component';
import { BuilderPageTitleComponent } from './components/builder-canvas/components/builder-page/components/builder-page-title/builder-page-title.component';
import { SectionFieldsComponent } from './components/builder-canvas/components/builder-page/components/builder-page-section/components/section-fields/section-fields.component';
import {ContenteditableValueAccessor} from "../shared/directives/content-editable/contenteditable.directive";
import { AddPageBtnComponent } from './components/builder-canvas/components/builder-page/components/add-page-btn/add-page-btn.component';
import { EditPageTooltipComponent } from './components/builder-canvas/components/builder-page/components/edit-page-tooltip/edit-page-tooltip.component';
import { AddPageTooltipComponent } from './components/builder-canvas/components/builder-page/components/add-page-tooltip/add-page-tooltip.component';
import { ChangePageTypeTooltipComponent } from './components/builder-canvas/components/builder-page/components/builder-page-title/components/change-page-type-tooltip/change-page-type-tooltip.component';
import { EmptySecondaryPagesComponent } from './components/builder-canvas/components/secondary-pages/components/empty-secondary-pages/empty-secondary-pages.component';
import { AddSectionBtnComponent } from './components/builder-canvas/components/builder-page/components/builder-page-section/components/add-section-btn/add-section-btn.component';

@NgModule({
  declarations: [
    BuilderV2Component,
    BuilderHeaderComponent,
    BuilderCanvasComponent,
    SitemapMobileDialogComponent,
    PageConstructorComponent,
    ZoomControllerComponent,
    OutlineGenerationComponent,
    PageSectionComponent,
    ZoomTooltipComponent,
    TooltipOptionComponent,
    SectionActionTooltipComponent,
    SceletonLoadingComponent,
    CreateCompanyInfoComponent,
    OutlineGenerationFinalizeComponent,
    SectionsLoadingComponent,
    SectionTemplatesComponent,
    SectionOptionsComponent,
    GenerationOptionsComponent,
    PageTitleComponent,
    SectionNotifsComponent,
    BuilderOutlineComponent,
    DraggableCanvasComponent,
    SecondaryPagesComponent,
    BuilderPageComponent,
    BuilderPageSectionComponent,
    BuilderPageBodyComponent,
    BuilderPageTitleComponent,
    SectionFieldsComponent,
    AddPageBtnComponent,
    EditPageTooltipComponent,
    AddPageTooltipComponent,
    ChangePageTypeTooltipComponent,
    EmptySecondaryPagesComponent,
    AddSectionBtnComponent
  ],
  imports: [
    CommonModule,
    BuilderV2RoutingModule,
    DsTooltipDirective,
    DragulaModule,
    DbTextPipe,
    ReactiveFormsModule,
    NgOptimizedImage,
    ClickOutsideDirective,
    ClassChangeObserverDirective,
    LoadingCircularSpinnerComponent,
    LoadingScreenComponent,
    DbReplaceTextPipe,
    DbSafePipe,
    MainSidebarEmptyComponent,
    CheckoutHeaderComponent,
    StopPinchEventDirective,
    LowerCaseSpecificWordsPipe,
    ClipboardModule,
    FeedbackFormComponent,
    ContenteditableValueAccessor,
  ],
  exports: [
    BuilderV2Component
  ]
})
export class BuilderV2Module {
}
