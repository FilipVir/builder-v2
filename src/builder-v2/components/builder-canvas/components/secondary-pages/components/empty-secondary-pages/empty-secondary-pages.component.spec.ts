import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptySecondaryPagesComponent } from './empty-secondary-pages.component';

describe('EmptySecondaryPagesComponent', () => {
  let component: EmptySecondaryPagesComponent;
  let fixture: ComponentFixture<EmptySecondaryPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmptySecondaryPagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmptySecondaryPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
