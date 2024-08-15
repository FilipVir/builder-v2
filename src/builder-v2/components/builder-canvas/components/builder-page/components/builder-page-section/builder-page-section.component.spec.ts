import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderPageSectionComponent } from './builder-page-section.component';

describe('BuilderPageSectionComponent', () => {
  let component: BuilderPageSectionComponent;
  let fixture: ComponentFixture<BuilderPageSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuilderPageSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuilderPageSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
