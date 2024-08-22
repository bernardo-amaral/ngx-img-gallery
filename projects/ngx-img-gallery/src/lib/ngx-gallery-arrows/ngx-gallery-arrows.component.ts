import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'ngx-gallery-arrows',
  templateUrl: './ngx-gallery-arrows.component.html',
  styleUrls: ['./ngx-gallery-arrows.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxGalleryArrowsComponent {
  @Input() prevDisabled: boolean = false;
  @Input() nextDisabled: boolean = false;
  @Input() arrowPrevIcon?: string = '';
  @Input() arrowNextIcon?: string = '';

  @Output() prevClick = new EventEmitter();
  @Output() nextClick = new EventEmitter();

  constructor() {}

  handlePrevClick(): void {
    this.prevClick.emit();
  }

  handleNextClick(): void {
    this.nextClick.emit();
  }
}
