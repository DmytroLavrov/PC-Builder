import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildsManagerComponent } from './builds-manager.component';

describe('BuildsManagerComponent', () => {
  let component: BuildsManagerComponent;
  let fixture: ComponentFixture<BuildsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildsManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildsManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
