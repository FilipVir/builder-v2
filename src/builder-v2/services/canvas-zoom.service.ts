import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";

@Injectable({
  providedIn: 'root'
})
export class CanvasZoomService {
  minZoom: BehaviorSubject<number> = new BehaviorSubject<number>(30);
  maxZoom: BehaviorSubject<number> = new BehaviorSubject<number>(250);
  scale: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  constructor() {
  }
}
