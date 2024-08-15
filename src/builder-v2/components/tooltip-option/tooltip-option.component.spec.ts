import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipOptionComponent } from './tooltip-option.component';

describe('TooltipOptionComponent', () => {
  let component: TooltipOptionComponent;
  let fixture: ComponentFixture<TooltipOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TooltipOptionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TooltipOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
