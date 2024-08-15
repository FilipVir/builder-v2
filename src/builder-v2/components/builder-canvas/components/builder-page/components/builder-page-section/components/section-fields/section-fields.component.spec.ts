import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionFieldsComponent } from './section-fields.component';

describe('SectionFieldsComponent', () => {
  let component: SectionFieldsComponent;
  let fixture: ComponentFixture<SectionFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SectionFieldsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SectionFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
