import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSectionBtnComponent } from './add-section-btn.component';

describe('AddSectionBtnComponent', () => {
  let component: AddSectionBtnComponent;
  let fixture: ComponentFixture<AddSectionBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddSectionBtnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSectionBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
