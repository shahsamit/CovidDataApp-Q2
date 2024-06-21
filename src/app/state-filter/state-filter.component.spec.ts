import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateFilterComponent } from './state-filter.component';

describe('StateFilterComponent', () => {
  let component: StateFilterComponent;
  let fixture: ComponentFixture<StateFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StateFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
