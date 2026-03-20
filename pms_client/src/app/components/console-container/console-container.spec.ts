import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleContainer } from './console-container';

describe('ConsoleContainer', () => {
  let component: ConsoleContainer;
  let fixture: ComponentFixture<ConsoleContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsoleContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
