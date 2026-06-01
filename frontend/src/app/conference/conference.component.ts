import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Participant, Room } from '../core/models';
import { ChatService } from '../chat/chat.service';
import { ParticipantsApiService } from '../participants/participants-api.service';
import { RoomsService } from '../rooms/rooms.service';
import { MediaDevicesService } from './media-devices.service';
import { RealtimeService } from './realtime.service';
import { RemoteVideoComponent } from './remote-video.component';
import { WebrtcService } from './webrtc.service';

@Component({
  selector: 'app-conference',
  imports: [FormsModule, RouterLink, RemoteVideoComponent],
  templateUrl: './conference.component.html',
  styleUrl: './conference.component.scss',
})
export class ConferenceComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo')
  private localVideo?: ElementRef<HTMLVideoElement>;

  protected room = signal<Room | null>(null);
  protected error = signal<string | null>(null);
  protected mediaError = computed(() => this.mediaDevicesService.mediaError());
  protected mediaReady = computed(() => this.mediaDevicesService.mediaReady());
  protected joining = signal(false);
  protected micEnabled = signal(true);
  protected cameraEnabled = signal(true);
  protected participants = computed(() => this.realtimeService.participants());
  protected messages = computed(() => this.realtimeService.messages());
  protected remoteStreams = computed(() => this.webrtcService.remoteStreams());
  protected connected = computed(() => this.realtimeService.connected());
  protected me = computed(() => this.realtimeService.participant());
  protected kicked = computed(() => this.realtimeService.kicked());
  protected isHost = computed(() => this.room()?.hostId === this.me()?.userId);
  protected lastSignal = computed(() => this.realtimeService.lastSignal());
  protected chatMessage = '';
  protected activeSidePanel = signal<'participants' | 'chat'>('participants');
  protected sendingMessage = signal(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly chatService: ChatService,
    private readonly roomsService: RoomsService,
    private readonly participantsApiService: ParticipantsApiService,
    private readonly realtimeService: RealtimeService,
    private readonly mediaDevicesService: MediaDevicesService,
    private readonly webrtcService: WebrtcService,
  ) {
    effect(() => {
      this.attachLocalStream(this.mediaDevicesService.localStream());
    });
    effect(() => {
      const participant = this.me();

      if (participant) {
        this.syncLocalState(participant);
      }
    });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.error.set('Sala no encontrada.');
      return;
    }

    this.roomsService.getInviteRoom(slug).subscribe({
      next: (room) => {
        this.room.set(room);
        void this.join(room.slug);
      },
      error: () => this.error.set('No se pudo cargar la sala.'),
    });
  }

  ngOnDestroy(): void {
    this.realtimeService.leaveRoom();
    this.webrtcService.dispose();
    this.mediaDevicesService.stopLocalMedia();
  }

  protected async toggleMic(): Promise<void> {
    const nextValue = !this.micEnabled();
    this.mediaDevicesService.setMicEnabled(nextValue);
    const participant = await this.realtimeService.toggleMic(nextValue);
    this.syncLocalState(participant);
  }

  protected async toggleCamera(): Promise<void> {
    const nextValue = !this.cameraEnabled();
    this.mediaDevicesService.setCameraEnabled(nextValue);
    const participant = await this.realtimeService.toggleCamera(nextValue);
    this.syncLocalState(participant);
  }

  protected async toggleHand(): Promise<void> {
    const participant = this.me();

    if (!participant) {
      return;
    }

    await this.realtimeService.raiseHand(!participant.handRaised);
  }

  protected async toggleParticipantMic(participant: Participant): Promise<void> {
    await this.realtimeService.moderateParticipant(participant.id, {
      micEnabled: !participant.micEnabled,
    });
  }

  protected async toggleParticipantCamera(participant: Participant): Promise<void> {
    await this.realtimeService.moderateParticipant(participant.id, {
      cameraEnabled: !participant.cameraEnabled,
    });
  }

  protected async lowerHand(participant: Participant): Promise<void> {
    await this.realtimeService.moderateParticipant(participant.id, {
      handRaised: false,
    });
  }

  protected async kickParticipant(participant: Participant): Promise<void> {
    await this.realtimeService.kickParticipant(participant.id);
  }

  protected async sendChatMessage(): Promise<void> {
    const content = this.chatMessage.trim();

    if (!content) {
      return;
    }

    this.sendingMessage.set(true);

    try {
      await this.realtimeService.sendChatMessage(content);
      this.chatMessage = '';
    } finally {
      this.sendingMessage.set(false);
    }
  }

  protected showParticipantsPanel(): void {
    this.activeSidePanel.set('participants');
  }

  protected showChatPanel(): void {
    this.activeSidePanel.set('chat');
  }

  protected isSelf(participant: Participant): boolean {
    return this.me()?.id === participant.id;
  }

  private async join(slug: string): Promise<void> {
    this.joining.set(true);
    this.error.set(null);

    try {
      const localMediaPromise = this.mediaDevicesService
        .startLocalMedia()
        .catch(() => null);
      const participant = await this.realtimeService.joinRoom(slug);
      this.syncLocalState(participant);
      this.loadChatHistory(slug);
      this.loadParticipantsAndConnect(slug, participant, localMediaPromise);
    } catch {
      this.error.set('No se pudo conectar a la sala en tiempo real.');
    } finally {
      this.joining.set(false);
    }
  }

  private syncLocalState(participant: Participant): void {
    this.micEnabled.set(participant.micEnabled);
    this.cameraEnabled.set(participant.cameraEnabled);
    this.mediaDevicesService.setMicEnabled(participant.micEnabled);
    this.mediaDevicesService.setCameraEnabled(participant.cameraEnabled);
  }

  private attachLocalStream(stream: MediaStream | null): void {
    const video = this.localVideo?.nativeElement;

    if (!video || video.srcObject === stream) {
      return;
    }

    video.srcObject = stream;
  }

  private loadParticipantsAndConnect(
    slug: string,
    currentParticipant: Participant,
    localMedia: Promise<MediaStream | null>,
  ): void {
    this.participantsApiService.getActiveParticipants(slug).subscribe({
      next: (participants) => {
        this.realtimeService.setParticipants(participants);
        void localMedia.then((stream) => {
          if (!stream) {
            return;
          }

          this.webrtcService.initialize(slug, stream);
          void this.webrtcService.connectToExistingParticipants(
            participants,
            currentParticipant,
          );
        });
      },
      error: () => this.error.set('No se pudieron cargar participantes.'),
    });
  }

  private loadChatHistory(slug: string): void {
    this.chatService.getRecentMessages(slug).subscribe({
      next: (messages) => this.realtimeService.setMessages(messages),
      error: () => this.error.set('No se pudo cargar el historial del chat.'),
    });
  }
}
