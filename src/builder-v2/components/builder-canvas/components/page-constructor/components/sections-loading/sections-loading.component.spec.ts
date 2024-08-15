import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionsLoadingComponent } from './sections-loading.component';

describe('SectionsLoadingComponent', () => {
  let component: SectionsLoadingComponent;
  let fixture: ComponentFixture<SectionsLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SectionsLoadingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SectionsLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
