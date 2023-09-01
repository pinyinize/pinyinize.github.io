import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontpageComponent } from './frontpage.component';

describe('FrontpageComponent', () => {
  let component: FrontpageComponent;
  let fixture: ComponentFixture<FrontpageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FrontpageComponent]
    });
    fixture = TestBed.createComponent(FrontpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
