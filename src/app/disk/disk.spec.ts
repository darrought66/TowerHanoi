import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Disk } from './disk';

describe('Disk', () => {
  let component: Disk;
  let fixture: ComponentFixture<Disk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Disk],
    }).compileComponents();

    fixture = TestBed.createComponent(Disk);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
