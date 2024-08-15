import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionNotifsComponent } from './section-notifs.component';

describe('SectionNotifsComponent', () => {
  let component: SectionNotifsComponent;
  let fixture: ComponentFixture<SectionNotifsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SectionNotifsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SectionNotifsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
