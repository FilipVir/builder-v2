import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageConstructorComponent } from './page-constructor.component';

describe('PageConstructorComponent', () => {
  let component: PageConstructorComponent;
  let fixture: ComponentFixture<PageConstructorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageConstructorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PageConstructorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
