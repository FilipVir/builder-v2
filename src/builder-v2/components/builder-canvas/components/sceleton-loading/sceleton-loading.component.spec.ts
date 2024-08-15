import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceletonLoadingComponent } from './sceleton-loading.component';

describe('SceletonLoadingComponent', () => {
  let component: SceletonLoadingComponent;
  let fixture: ComponentFixture<SceletonLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SceletonLoadingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SceletonLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
