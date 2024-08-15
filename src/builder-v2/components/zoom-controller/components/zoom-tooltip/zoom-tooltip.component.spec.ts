import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomTooltipComponent } from './zoom-tooltip.component';

describe('ZoomTooltipComponent', () => {
  let component: ZoomTooltipComponent;
  let fixture: ComponentFixture<ZoomTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZoomTooltipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ZoomTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
