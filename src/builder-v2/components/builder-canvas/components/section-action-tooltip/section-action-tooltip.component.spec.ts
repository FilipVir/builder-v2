import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionActionTooltipComponent } from './section-action-tooltip.component';

describe('SectionActionTooltipComponent', () => {
  let component: SectionActionTooltipComponent;
  let fixture: ComponentFixture<SectionActionTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SectionActionTooltipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SectionActionTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
