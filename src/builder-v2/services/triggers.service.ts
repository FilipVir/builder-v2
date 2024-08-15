import {Injectable} from '@angular/core';
import {Subject} from "rxjs/internal/Subject";

@Injectable({
  providedIn: 'root'
})
export class TriggersService {
  fitToScreen: Subject<void> = new Subject<void>();
  calculateMinZoom: Subject<void> = new Subject<void>();
  scrollToSection: Subject<string> = new Subject<string>();

  constructor() {
  }
}
