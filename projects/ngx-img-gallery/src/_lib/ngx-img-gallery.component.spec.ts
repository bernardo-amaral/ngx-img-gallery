import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxImgGalleryComponent } from './ngx-img-gallery.component';

describe('NgxImgGalleryComponent', () => {
  let component: NgxImgGalleryComponent;
  let fixture: ComponentFixture<NgxImgGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxImgGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxImgGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
