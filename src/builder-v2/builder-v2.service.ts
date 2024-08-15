import {Injectable} from "@angular/core";
import {RequesterService} from "../shared/services/requester/requester.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Store} from "@ngrx/store";
import {DbStoreState} from "../store";
import {combineLatest, Observable} from "rxjs";
import * as fromStore from '../store';
import {map, tap} from "rxjs/operators";
import {
  BuilderGeneratedPageI,
  PageThemeI,
  SecondaryPageReqI,
  SecondaryPageTypeReqI,
  SiteGenerationI
} from "./builder-v2.interface";
import {Config} from "../config/config";
import {BuilderSectionsInteractionService} from "./builder-sections-interaction.service";
import {ActivityAction} from "../activities/activity";

@Injectable({
  providedIn: 'root'
})
export class BuilderV2Service {
  private _ownerWorkspaceId: number;
  private _currentWorkspaceId: number;
  private authorizationKey = 'MdRze9DcdD2iwe';

  constructor(private _requester: RequesterService,
              private _httpClient: HttpClient,
              private _sectionsInteractionsService: BuilderSectionsInteractionService,
              private _store: Store<DbStoreState>) {
    this._getWorkspaceEntities();
  }

  getBuilderUniqueId(): Observable<any> {
    let url = `ai2/start_generation_session`;

    return this._requester.aiAssistant
      .post(url);
  }

  aiGenerateOutline(data, domainId: number, uniqueId?: string): Observable<{ data: BuilderGeneratedPageI }> {
    domainId === Config.demoDomainId && (domainId = null);
    const url = this._currentWorkspaceId ? `ai2/workspaces/${this._currentWorkspaceId}/outline` : `ai2/outline`;
    const _data = {params: JSON.stringify(data)};
    domainId && (_data['domainId'] = domainId);
    uniqueId && (_data['uniqueId'] = uniqueId);
    return this._requester.aiAssistant
      .post(url, null, _data)
      .pipe(tap((response) => {
        this._sectionsInteractionsService.requestSubject.next({action: ActivityAction.BUILDER_GET_OUTLINE, response});
      }));
  }

  aiGenerateStyles(data, domainId: number, uniqueId?: string): Observable<{ data: PageThemeI }> {
    domainId === Config.demoDomainId && (domainId = null);
    const _data = {params: JSON.stringify(data)};
    domainId && (_data['domainId'] = domainId);
    uniqueId && (_data['uniqueId'] = uniqueId);
    const url = this._currentWorkspaceId ? `ai2/workspaces/${this._currentWorkspaceId}/styles` : `ai2/styles`;
    return this._requester.aiAssistant
      .post(url, null, _data)
      .pipe(tap((response) => {
        this._sectionsInteractionsService.requestSubject.next({action: ActivityAction.BUILDER_STYLES, response});
      }));
  }

  aiModifySectionTypes(data, domainId: number, uniqueId?: string, useService = true): Observable<any> {
    domainId === Config.demoDomainId && (domainId = null);
    const _data = {params: JSON.stringify(data)};
    domainId && (_data['domainId'] = domainId);
    uniqueId && (_data['uniqueId'] = uniqueId);
    const url = this._currentWorkspaceId ? `ai2/workspaces/${this._currentWorkspaceId}/section_types` : `ai2/section_types`;
    return this._requester.aiAssistant
      .post(url, null, _data).pipe(tap((response) => {
        if (!response || !useService) {
          return;
        }
        this._sectionsInteractionsService.requestSubject.next({
          action: ActivityAction.BUILDER_SECTION_TYPES,
          response: response.body
        });
      }));
  }

  aiModifyColors(data, uniqueId?: string): Observable<any> {
    const url = this._currentWorkspaceId ? `ai2/workspaces/${this._currentWorkspaceId}/colors_modify` : `ai2/colors_modify`;
    return this._requester.aiAssistant
      .post(url, null, {params: JSON.stringify(data), uniqueId: uniqueId});
  }

  aiGenerateSite(data: SiteGenerationI, domainId: number, uniqueId?: string): Observable<any> {
    domainId === Config.demoDomainId && (domainId = null);
    const _data = {params: JSON.stringify(data)};
    domainId && (_data['domainId'] = domainId);
    uniqueId && (_data['uniqueId'] = uniqueId);
    const url = `ai2/workspaces/${this._currentWorkspaceId}/build_site_from_outline`;
    return this._requester.aiAssistant
      .post(url, null, _data);
  }

  getBuilderActionData(action: string, domainId: number, uniqueId?: string) {
    domainId === Config.demoDomainId && (domainId = null);
    let url =  this._currentWorkspaceId ? `ai2/workspaces/${this._currentWorkspaceId}/get-data` : `ai2/get-data`;
    if (domainId) {
      url += `?domainId=${domainId}`;
    }

    return this._requester.aiAssistant
      .get(url, {action, uniqueId: uniqueId}, true).pipe(
        map(response => ({action, response}))
      );
  }

  getTemplatesList(uniqueId: string) {
    const url = this._currentWorkspaceId ? `proxy/workspaces/${this._currentWorkspaceId}/sections/description` : `proxy/sections/description`;
    const data = {
      uniqueId: uniqueId,
    };
    return this._requester.aiAssistant
      .get(url, data, true);
  }

  enhanceSection(data, domainId: number, uniqueId: string, useService = true) {
    domainId === Config.demoDomainId && (domainId = null);
    const _data = {params: JSON.stringify(data)};
    domainId && (_data['domainId'] = domainId);
    uniqueId && (_data['uniqueId'] = uniqueId);
    const url = this._currentWorkspaceId ? `ai2/workspaces/${this._currentWorkspaceId}/outline/section/enhance` : `ai2/outline/section/enhance`;
    return this._requester.aiAssistant
      .post(url, null, _data).pipe(tap((response) => {
        if (!useService) {
          return;
        }
        this._sectionsInteractionsService.requestSubject.next({
          action: ActivityAction.BUILDER_SECTION_ENHANCE,
          response
        });
      }));
  }

  enhanceSectionTitle(data, domainId: number, uniqueId: string, useService = true) {
    domainId === Config.demoDomainId && (domainId = null);
    const _data = {params: JSON.stringify(data)};
    domainId && (_data['domainId'] = domainId);
    uniqueId && (_data['uniqueId'] = uniqueId);
    const url = this._currentWorkspaceId ? `ai2/workspaces/${this._currentWorkspaceId}/outline/section/suggest_title` : `ai2/outline/section/suggest_title`;
    return this._requester.aiAssistant
      .post(url, null, _data).pipe(tap((response) => {
        if (!useService) {
          return;
        }
        this._sectionsInteractionsService.requestSubject.next({
          action: ActivityAction.BUILDER_SECTION_SUGGEST_TITLE,
          response
        });
      }));
  }

  enhanceSectionDescription(data, uniqueId: string, useService = true) {
    const url = this._currentWorkspaceId ? `ai2/workspaces/${this._currentWorkspaceId}/outline/section/suggest_description` : `ai2/outline/section/suggest_description`;
    const _data = {params: JSON.stringify(data)};
    uniqueId && (_data['uniqueId'] = uniqueId);
    return this._requester.aiAssistant
      .post(url, null, _data).pipe(tap((response) => {
        if (!useService) {
          return;
        }
        this._sectionsInteractionsService.requestSubject.next({
          action: ActivityAction.BUILDER_SECTION_SUGGEST_DESCRIPTION,
          response
        });
      }));
  }

  generateSection(data, domainId: number, uniqueId: string, useService: boolean = true) {
    domainId === Config.demoDomainId && (domainId = null);
    const _data = {params: JSON.stringify(data)};
    domainId && (_data['domainId'] = domainId);
    uniqueId && (_data['uniqueId'] = uniqueId);
    const url = this._currentWorkspaceId ? `ai2/workspaces/${this._currentWorkspaceId}/outline/section/generate` : `ai2/outline/section/generate`;
    return this._requester.aiAssistant
      .post(url, null, _data).pipe(tap((response) => {
        if (!useService) {
          return;
        }
        this._sectionsInteractionsService.requestSubject.next({
          action: ActivityAction.BUILDER_SECTION_GENERATE,
          response
        });
      }));
  }

  getSecondaryPage(data: SecondaryPageReqI, domainId: number, uniqueId: string) {
    domainId === Config.demoDomainId && (domainId = null);
    const _data = {params: JSON.stringify(data)};
    domainId && (_data['domainId'] = domainId);
    uniqueId && (_data['uniqueId'] = uniqueId);
    const url = `ai2/secondary_page_outline`;
    return this._requester.aiAssistant
      .post(url, null, _data);
  }

  getSecondaryPageType(data: SecondaryPageTypeReqI, domainId: number, uniqueId: string) {
    domainId === Config.demoDomainId && (domainId = null);
    const _data = {params: JSON.stringify(data)};
    domainId && (_data['domainId'] = domainId);
    uniqueId && (_data['uniqueId'] = uniqueId);
    const url = `ai2/pages_types`;
    return this._requester.aiAssistant
      .post(url, null, _data);
  }

  private _getWorkspaceEntities(): void {
    combineLatest(
      this._store.select(fromStore.getUserSubscription),
      this._store.select(fromStore.getWorkspaceIdEntities)
    ).subscribe(([userSubscription, workspaceIdEntities]) => {
      this._ownerWorkspaceId = workspaceIdEntities.ownerWorkspaceId;
      this._currentWorkspaceId = workspaceIdEntities.currentWorkspaceId || this._ownerWorkspaceId;
    });
  }
}
