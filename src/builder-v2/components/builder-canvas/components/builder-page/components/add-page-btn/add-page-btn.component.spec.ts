import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPageBtnComponent } from './add-page-btn.component';

describe('AddPageBtnComponent', () => {
  let component: AddPageBtnComponent;
  let fixture: ComponentFixture<AddPageBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddPageBtnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPageBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
