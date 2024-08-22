import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeStyle,
} from '@angular/platform-browser';
import { NgxGalleryService } from '../ngx-gallery.service';
import { NgxGalleryAction } from '../ngx-gallery-action';
import { NgxGalleryOrder } from '../ngx-gallery-order';

@Component({
  selector: 'ngx-gallery-thumbnails',
  templateUrl: './ngx-gallery-thumbnails.component.html',
  styleUrls: ['./ngx-gallery-thumbnails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxGalleryThumbnailsComponent implements OnChanges {
  thumbnailsLeft: string = '';
  thumbnailsMarginLeft: string = '';
  mouseenter: boolean = false;
  remainingCountValue: number = 0;

  minStopIndex = 0;

  @Input() images: string[] | SafeResourceUrl[] = [];
  @Input() isAnimating?: boolean = false;
  @Input() links?: string[] = [];
  @Input() labels?: string[] = [];
  @Input() linkTarget?: string = '';
  @Input() columns?: number = 0;
  @Input() rows?: number = 0;
  @Input() arrows?: boolean = false;
  @Input() arrowsAutoHide?: boolean = false;
  @Input() margin?: number = 0;
  @Input() selectedIndex: number = 0;
  @Input() clickable?: boolean = false;
  @Input() swipe?: boolean = false;
  @Input() size?: string = '';
  @Input() arrowPrevIcon?: string = '';
  @Input() arrowNextIcon?: string = '';
  @Input() moveSize?: number = 0;
  @Input() order?: number = 0;
  @Input() remainingCount?: boolean = false;
  @Input() lazyLoading?: boolean = false;
  @Input() actions?: NgxGalleryAction[] = [];

  @Output() activeChange = new EventEmitter();

  private index = 0;

  constructor(
    private sanitization: DomSanitizer,
    private elementRef: ElementRef,
    private helperService: NgxGalleryService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedIndex']) {
      this.validateIndex();
    }

    if (changes['swipe']) {
      this.helperService.manageSwipe(
        this.swipe || false,
        this.elementRef,
        'thumbnails',
        () => this.moveRight(),
        () => this.moveLeft()
      );
    }

    if (this.images) {
      this.remainingCountValue =
        this.images.length - (this.rows || 0) * (this.columns || 0);
    }
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.mouseenter = true;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.mouseenter = false;
  }

  reset(index: number): void {
    this.selectedIndex = index;
    this.setDefaultPosition();

    this.index = 0;
    this.validateIndex();
  }

  getImages(): string[] | SafeResourceUrl[] {
    if (!this.images) {
      return [];
    }

    if (this.remainingCount) {
      return this.images.slice(0, (this.rows || 0) * (this.columns || 0));
    } else if (this.lazyLoading && this.order !== NgxGalleryOrder.Row) {
      let stopIndex = 0;

      if (this.order === NgxGalleryOrder.Column) {
        stopIndex =
          (this.index + (this.columns || 0) + (this.moveSize || 0)) *
          (this.rows || 0);
      } else if (this.order === NgxGalleryOrder.Page) {
        stopIndex = this.index + (this.columns || 0) * (this.rows || 0) * 2;
      }

      if (stopIndex <= this.minStopIndex) {
        stopIndex = this.minStopIndex;
      } else {
        this.minStopIndex = stopIndex;
      }

      return this.images.slice(0, stopIndex);
    } else {
      return this.images;
    }
  }

  handleClick(event: Event, index: number): void {
    if (!this.hasLink(index) && !this.isAnimating) {
      this.selectedIndex = index;
      this.activeChange.emit(index);
    }
    event.stopPropagation();
    event.preventDefault();
  }

  hasLink(index: number): boolean {
    return !!(this.links && this.links.length && this.links[index]);
  }

  moveRight(): void {
    if (this.canMoveRight()) {
      this.index += this.moveSize || 0;
      const maxIndex = this.getMaxIndex() - (this.columns || 0);

      if (this.index > maxIndex) {
        this.index = maxIndex;
      }

      this.setThumbnailsPosition();
    }
  }

  moveLeft(): void {
    if (this.canMoveLeft()) {
      this.index -= this.moveSize || 0;

      if (this.index < 0) {
        this.index = 0;
      }

      this.setThumbnailsPosition();
    }
  }

  canMoveRight(): boolean {
    return this.index + (this.columns || 0) < this.getMaxIndex();
  }

  canMoveLeft(): boolean {
    return this.index !== 0;
  }

  getThumbnailLeft(index: number): SafeStyle {
    let calculatedIndex;

    if (this.order === NgxGalleryOrder.Column) {
      calculatedIndex = Math.floor(index / (this.rows || 0));
    } else if (this.order === NgxGalleryOrder.Page) {
      calculatedIndex =
        (index % (this.columns || 0)) +
        Math.floor(index / ((this.rows || 0) * (this.columns || 0))) *
          (this.columns || 0);
    } else if (this.order === NgxGalleryOrder.Row && this.remainingCount) {
      calculatedIndex = index % (this.columns || 0);
    } else {
      calculatedIndex =
        index % Math.ceil(this.images.length / (this.rows || 0));
    }

    return this.getThumbnailPosition(calculatedIndex, this.columns || 0);
  }

  getThumbnailTop(index: number): SafeStyle {
    let calculatedIndex;

    if (this.order === NgxGalleryOrder.Column) {
      calculatedIndex = index % (this.rows || 0);
    } else if (this.order === NgxGalleryOrder.Page) {
      calculatedIndex =
        Math.floor(index / (this.columns || 0)) -
        Math.floor(index / ((this.rows || 0) * (this.columns || 0))) *
          (this.rows || 0);
    } else if (this.order === NgxGalleryOrder.Row && this.remainingCount) {
      calculatedIndex = Math.floor(index / (this.columns || 0));
    } else {
      calculatedIndex = Math.floor(
        index / Math.ceil(this.images.length / (this.rows || 0))
      );
    }

    return this.getThumbnailPosition(calculatedIndex, this.rows || 0);
  }

  getThumbnailWidth(): SafeStyle {
    return this.getThumbnailDimension(this.columns || 0);
  }

  getThumbnailHeight(): SafeStyle {
    return this.getThumbnailDimension(this.rows || 0);
  }

  setThumbnailsPosition(): void {
    this.thumbnailsLeft = -((100 / (this.columns || 0)) * this.index) + '%';

    this.thumbnailsMarginLeft =
      -(
        ((this.margin || 0) -
          (((this.columns || 0) - 1) * (this.margin || 0)) /
            (this.columns || 0)) *
        this.index
      ) + 'px';
  }

  setDefaultPosition(): void {
    this.thumbnailsLeft = '0px';
    this.thumbnailsMarginLeft = '0px';
  }

  canShowArrows(): boolean {
    if (this.remainingCount) {
      return false;
    }
    return (
      (this.arrows &&
        this.images &&
        this.images.length > this.getVisibleCount() &&
        (!this.arrowsAutoHide || this.mouseenter)) ||
      false
    );
  }

  validateIndex(): void {
    if (this.images) {
      let newIndex;

      if (this.order === NgxGalleryOrder.Column) {
        newIndex = Math.floor(this.selectedIndex / (this.rows || 0));
      } else {
        newIndex =
          this.selectedIndex % Math.ceil(this.images.length / (this.rows || 0));
      }

      if (this.remainingCount) {
        newIndex = 0;
      }

      if (
        newIndex < this.index ||
        newIndex >= this.index + (this.columns || 0)
      ) {
        const maxIndex = this.getMaxIndex() - (this.columns || 0);
        this.index = newIndex > maxIndex ? maxIndex : newIndex;

        this.setThumbnailsPosition();
      }
    }
  }

  getSafeUrl(image: string | SafeResourceUrl): SafeStyle {
    return this.sanitization.bypassSecurityTrustStyle(
      this.helperService.getBackgroundUrl(image.toString())
    );
  }

  getFileType(fileSource: string | SafeResourceUrl): string {
    return this.helperService.getFileType(fileSource.toString());
  }

  private getThumbnailPosition(index: number, count: number): SafeStyle {
    return this.getSafeStyle(
      'calc(' +
        (100 / count) * index +
        '% + ' +
        ((this.margin || 0) - ((count - 1) * (this.margin || 0)) / count) *
          index +
        'px)'
    );
  }

  private getThumbnailDimension(count: number): SafeStyle {
    if (this.margin !== 0) {
      return this.getSafeStyle(
        'calc(' +
          100 / count +
          '% - ' +
          ((count - 1) * (this.margin || 0)) / count +
          'px)'
      );
    } else {
      return this.getSafeStyle('calc(' + 100 / count + '% + 1px)');
    }
  }

  private getMaxIndex(): number {
    if (this.order === NgxGalleryOrder.Page) {
      let maxIndex =
        Math.floor(this.images.length / this.getVisibleCount()) *
        (this.columns || 0);

      if (this.images.length % this.getVisibleCount() > (this.columns || 0)) {
        maxIndex += this.columns || 0;
      } else {
        maxIndex += this.images.length % this.getVisibleCount();
      }

      return maxIndex;
    } else {
      return Math.ceil(this.images.length / (this.rows || 0));
    }
  }

  private getVisibleCount(): number {
    return (this.columns || 0) * (this.rows || 0);
  }

  private getSafeStyle(value: string): SafeStyle {
    return this.sanitization.bypassSecurityTrustStyle(value);
  }
}
