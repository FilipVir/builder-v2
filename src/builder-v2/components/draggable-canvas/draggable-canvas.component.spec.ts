import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableCanvasComponent } from './draggable-canvas.component';

describe('DraggableCanvasComponent', () => {
  let component: DraggableCanvasComponent;
  let fixture: ComponentFixture<DraggableCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DraggableCanvasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DraggableCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
