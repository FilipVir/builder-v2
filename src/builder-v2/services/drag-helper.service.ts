import {Injectable, Renderer2} from '@angular/core';
import {BuilderGeneratedPageSectionI} from "../builder-v2.interface";

@Injectable({
  providedIn: 'root'
})
export class DragHelperService {

  recalculateDraggableElementPosition(scale: number, _renderer: Renderer2, changeY = false) {
    const elements = document.getElementsByClassName('gu-mirror');
    if (elements[0]) {
      const diffX = elements[0].clientWidth * scale;
      const diffY = elements[0].clientHeight * scale;

      const x = elements[0].clientWidth - diffX;
      let y = 0;
      if (changeY && scale < 1) {
        const top = parseInt(elements[0]['style'].top, null);
        y = -((top - (top * scale)) + elements[0].clientHeight - diffY) / 2;
        if (scale < 0.5) {
          y = y * 2;
        }
      }
      _renderer.setStyle(elements[0], 'width', `262.4px`);
      if (scale >= 1) {
        _renderer.setStyle(elements[0], 'scale', scale);
        return;
      }
      _renderer.setStyle(elements[0], 'transform', `scale(${scale}) translate(${-x}px, ${y}px)`);
    }
  }

  updateSectionIndexes(sections: BuilderGeneratedPageSectionI[]): BuilderGeneratedPageSectionI[] {
    return sections.map((section, index) => {
      section.index = index;
      return section;
    });
  }

  constructor() {
  }
}
