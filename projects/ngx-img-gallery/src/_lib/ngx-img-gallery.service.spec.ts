import { TestBed } from '@angular/core/testing';

import { NgxImgGalleryService } from './ngx-img-gallery.service';

describe('NgxImgGalleryService', () => {
  let service: NgxImgGalleryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxImgGalleryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
