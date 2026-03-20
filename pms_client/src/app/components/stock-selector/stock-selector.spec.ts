import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockSelector } from './stock-selector';

describe('StockSelector', () => {
  let component: StockSelector;
  let fixture: ComponentFixture<StockSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockSelector],
    }).compileComponents();

    fixture = TestBed.createComponent(StockSelector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
