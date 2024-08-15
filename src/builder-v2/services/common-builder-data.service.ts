import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonBuilderDataService {
  uniqueId: string;
  domainId: number;
  popupMode: boolean;

  constructor() {
  }
}
