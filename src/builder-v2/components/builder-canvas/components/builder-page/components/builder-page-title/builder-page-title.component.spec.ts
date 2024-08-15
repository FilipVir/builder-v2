import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderPageTitleComponent } from './builder-page-title.component';

describe('BuilderPageTitleComponent', () => {
  let component: BuilderPageTitleComponent;
  let fixture: ComponentFixture<BuilderPageTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuilderPageTitleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuilderPageTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
