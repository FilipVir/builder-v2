import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPageTooltipComponent } from './edit-page-tooltip.component';

describe('EditPageTooltipComponent', () => {
  let component: EditPageTooltipComponent;
  let fixture: ComponentFixture<EditPageTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPageTooltipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditPageTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
