import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationOptionsComponent } from './generation-options.component';

describe('GenerationOptionsComponent', () => {
  let component: GenerationOptionsComponent;
  let fixture: ComponentFixture<GenerationOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenerationOptionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenerationOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
