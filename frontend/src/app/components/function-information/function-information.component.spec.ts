import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionInformationComponent } from './function-information.component';

describe('FunctionInformationComponent', () => {
  let component: FunctionInformationComponent;
  let fixture: ComponentFixture<FunctionInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FunctionInformationComponent]
    });
    fixture = TestBed.createComponent(FunctionInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
