import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";
import {BuilderStepsEnum, BuilderTourEnum} from "./builder-tour.enum";
import {SecondaryPageWithSectionsI, SiteGenerationI, StorageSiteStateI} from "./builder-v2.interface";
import * as fromStore from '../store';
import {Store} from "@ngrx/store";
import {DbStoreState} from "../store";
import {filter, first, switchMap, take} from "rxjs/operators";
import {UserService} from "../user/user.service";
import {Config} from "../config/config";
import {Observable} from "rxjs/internal/Observable";

@Injectable({
  providedIn: 'root'
})
export class BuilderHistoryService {
  canRedo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  canUndo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currentStateIndex: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  latestStateIndex: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  canvasScale: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  history: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  tourStep: BehaviorSubject<number> = new BehaviorSubject<number>(BuilderTourEnum.OUTLINE_POPUP);
  builderStep: BehaviorSubject<number> = new BehaviorSubject<number>(BuilderStepsEnum.CHOOSE_BUSINESS_TYPE);
  private uniqueIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  private _history = [];
  private _currentStateIndex = -1;
  private _localStorage = {};


  constructor(private _store: Store<DbStoreState>,
              private _userService: UserService) {
  }

  addStateInHistory(state) {
    if (this._currentStateIndex < this._history.length - 1) {
      this._history.length = this._currentStateIndex + 1;
    }
    this._history.push(state);
    this._currentStateIndex++;
    this.latestStateIndex.next(this._currentStateIndex);
    this.history.next(this._history);
    this._checkActions();
  }

  addSecondaryPageInHistory(secondaryPages: SecondaryPageWithSectionsI[], isFirst: boolean = false) {
    if (isFirst) {
      this._currentStateIndex = -1;
    }
    const history = this.history.value[this.currentStateIndex.value];
    this.addStateInHistory({...history, secondaryPages, id: new Date().getTime()});
  }

  changeCurrentState(direction: number) {
    this._currentStateIndex += direction;
    this.currentStateIndex.next(this._currentStateIndex);
    this._checkActions();
  }

  private _checkActions() {
    this.canRedo.next((this._history.length - 1 > this._currentStateIndex));
    this.canUndo.next((this._currentStateIndex > 0));
  }

  saveStateInStorage(data: StorageSiteStateI) {
    data.page_outline.sections = data.page_outline.sections.map(({
                                                                   title_control,
                                                                   description_control,
                                                                   ...rest
                                                                 }) => rest);
    localStorage.setItem('builder_history', JSON.stringify(data));
  }

  getStateFromStorage(): StorageSiteStateI | null {
    return JSON.parse(localStorage.getItem('builder_history'));
  }

  removeStateFromStorage() {
    localStorage.removeItem('builder_history');
  }

  getLocalStorage() {
    this._store.select(fromStore.getUserLoaded)
      .pipe(
        filter((loaded: boolean) => loaded),
        switchMap(() => this._store.select(fromStore.getUserLocalStorage)),
        first()
      )
      .subscribe((userLocalStorage: any) => {
        this._localStorage = userLocalStorage;
      });
  }

  setToUserLocalStorage(isOnboardingFlow: boolean) {
    this._localStorage['isBuilderV2'] = true;
    if (isOnboardingFlow) {
      this._localStorage[`seenNewAiFlow ${Config.demoDomainId}`] = true;
    }
    this._userService.setToLocal(this._localStorage).pipe(
      first(response => !!response, null),
    ).subscribe(response => {
      if (response.success) {
        this._store.dispatch(new fromStore.LoadUserLocalStorage());
      }
    });
  }

  resetSubjects() {
    this.canRedo.next(false);
    this.canUndo.next(false);
    this.currentStateIndex.next(0);
    this.canvasScale.next(1);
    this.history.next([]);
    this.latestStateIndex.next(0);
    this.tourStep.next(BuilderTourEnum.OUTLINE_POPUP);
    this._history = [];
    this._currentStateIndex = -1;
    this._localStorage = {};
  }


  setSessionId(uniqueId: string): void {
    this.uniqueIdSubject.next(uniqueId);
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', uniqueId);
    }
  }

  getUniqueId(): any {
    let sessionId = localStorage.getItem('sessionId');

    return sessionId;
  }

}
