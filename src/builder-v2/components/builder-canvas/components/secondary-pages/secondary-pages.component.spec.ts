import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondaryPagesComponent } from './secondary-pages.component';

describe('SecondaryPagesComponent', () => {
  let component: SecondaryPagesComponent;
  let fixture: ComponentFixture<SecondaryPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecondaryPagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SecondaryPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
