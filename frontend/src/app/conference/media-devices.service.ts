import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MediaDevicesService {
  private stream: MediaStream | null = null;
  readonly localStream = signal<MediaStream | null>(null);
  readonly mediaReady = signal(false);
  readonly mediaError = signal<string | null>(null);

  async startLocalMedia(): Promise<MediaStream> {
    if (this.stream) {
      return this.stream;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      this.mediaError.set('Este navegador no soporta captura de camara/microfono.');
      throw new Error('getUserMedia not supported');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      this.localStream.set(this.stream);
      this.mediaReady.set(true);
      this.mediaError.set(null);

      return this.stream;
    } catch (error) {
      this.mediaReady.set(false);
      this.mediaError.set('No se pudo acceder a camara o microfono.');
      throw error;
    }
  }

  setMicEnabled(enabled: boolean): void {
    this.stream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  setCameraEnabled(enabled: boolean): void {
    this.stream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  stopLocalMedia(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.localStream.set(null);
    this.mediaReady.set(false);
  }
}
