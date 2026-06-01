import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-remote-video',
  template: `
    <article class="remote-card">
      <video #video autoplay playsinline></video>
      <strong>Participante remoto</strong>
    </article>
  `,
  styles: [`
    .remote-card {
      position: relative;
      overflow: hidden;
      min-height: 180px;
      border: 1px solid rgb(255 255 255 / 0.1);
      border-radius: 8px;
      background: #1f2937;
    }

    video {
      width: 100%;
      height: 100%;
      min-height: 180px;
      object-fit: cover;
    }

    strong {
      position: absolute;
      left: 12px;
      bottom: 12px;
      color: #ffffff;
      text-shadow: 0 1px 8px rgb(0 0 0 / 0.45);
    }
  `],
})
export class RemoteVideoComponent implements AfterViewInit, OnChanges {
  @Input({ required: true })
  stream!: MediaStream;

  @ViewChild('video')
  private video?: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    this.attachStream();
  }

  ngOnChanges(): void {
    queueMicrotask(() => this.attachStream());
  }

  private attachStream(): void {
    const video = this.video?.nativeElement;

    if (video && video.srcObject !== this.stream) {
      video.srcObject = this.stream;
    }
  }
}
