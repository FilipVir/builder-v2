import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderPageBodyComponent } from './builder-page-body.component';

describe('BuilderPageBodyComponent', () => {
  let component: BuilderPageBodyComponent;
  let fixture: ComponentFixture<BuilderPageBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuilderPageBodyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuilderPageBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
