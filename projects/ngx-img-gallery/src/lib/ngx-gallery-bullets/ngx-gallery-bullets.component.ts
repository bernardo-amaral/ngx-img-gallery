import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'ngx-gallery-bullets',
  templateUrl: './ngx-gallery-bullets.component.html',
  styleUrls: ['./ngx-gallery-bullets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxGalleryBulletsComponent {
  @Input() count: number = 0;
  @Input() active = 0;

  @Output() bulletChange = new EventEmitter();

  constructor() {}

  getBullets(): number[] {
    return Array(this.count);
  }

  handleChange(_event: Event, index: number): void {
    this.bulletChange.emit(index);
  }
}
