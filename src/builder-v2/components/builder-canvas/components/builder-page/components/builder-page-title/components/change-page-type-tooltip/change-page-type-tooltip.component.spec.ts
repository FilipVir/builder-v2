import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePageTypeTooltipComponent } from './change-page-type-tooltip.component';

describe('ChangePageTypeTooltipComponent', () => {
  let component: ChangePageTypeTooltipComponent;
  let fixture: ComponentFixture<ChangePageTypeTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangePageTypeTooltipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangePageTypeTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
