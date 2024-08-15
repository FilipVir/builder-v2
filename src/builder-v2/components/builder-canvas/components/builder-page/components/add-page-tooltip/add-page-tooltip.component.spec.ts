import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPageTooltipComponent } from './add-page-tooltip.component';

describe('AddPageTooltipComponent', () => {
  let component: AddPageTooltipComponent;
  let fixture: ComponentFixture<AddPageTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddPageTooltipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPageTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
