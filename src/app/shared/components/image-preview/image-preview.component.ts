import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.scss'],
  imports: [CommonModule, IconDirective]
})
export class ImagePreviewComponent implements OnChanges {
  @Input() src: string | null = null;
  @Input() fallbackIcon: string = 'cil-image';
  @Input() fallbackText: string | null = null;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() alt: string = 'Preview';

  imageFailed = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) {
      this.imageFailed = false;
    }
  }

  onImageError(): void {
    this.imageFailed = true;
    this.cdr.detectChanges();
  }

  get showImage(): boolean {
    return !!this.src && !this.imageFailed;
  }

  get showTextFallback(): boolean {
    return !this.showImage && !!this.fallbackText;
  }
}
