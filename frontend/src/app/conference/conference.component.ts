import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Participant, Room } from '../core/models';
import { ChatService } from '../chat/chat.service';
import { ParticipantsApiService } from '../participants/participants-api.service';
import { RoomsService } from '../rooms/rooms.service';
import { MediaDevicesService } from './media-devices.service';
import { RealtimeService } from './realtime.service';
import { LocalVideoComponent } from './local-video.component';
import { RemoteVideoComponent } from './remote-video.component';
import { WebrtcService } from './webrtc.service';

type StageLayout = 'fullscreen' | 'mainGuests' | 'grid';
type ScenePreset = 'midnight' | 'studioBlue' | 'emerald' | 'sunset' | 'custom';
type BannerStyle = 'lowerThird' | 'ticker' | 'headline';

interface ScenePresetOption {
  label: string;
  value: ScenePreset;
  background: string;
  accent: string;
}

@Component({
  selector: 'app-conference',
  imports: [FormsModule, RouterLink, LocalVideoComponent, RemoteVideoComponent],
  templateUrl: './conference.component.html',
  styleUrl: './conference.component.scss',
})
export class ConferenceComponent implements OnInit, OnDestroy {
  protected room = signal<Room | null>(null);
  protected error = signal<string | null>(null);
  protected mediaError = computed(() => this.mediaDevicesService.mediaError());
  protected mediaReady = computed(() => this.mediaDevicesService.mediaReady());
  protected localStream = computed(() => this.mediaDevicesService.localStream());
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
  protected activeSidePanel = signal<'participants' | 'chat' | 'scene'>(
    'participants',
  );
  protected sendingMessage = signal(false);
  protected stageLayout = signal<StageLayout>('mainGuests');
  protected selectedMainParticipantId = signal<string | null>(null);
  protected scenePreset = signal<ScenePreset>('studioBlue');
  protected sceneBackground = signal('#07111f');
  protected sceneAccent = signal('#38bdf8');
  protected bannerVisible = signal(true);
  protected bannerText = signal('Bienvenidos a nuestra transmision en vivo');
  protected bannerStyle = signal<BannerStyle>('lowerThird');
  protected bannerBackground = signal('#0f172a');
  protected bannerTextColor = signal('#ffffff');
  protected scenePresetOptions: ScenePresetOption[] = [
    {
      label: 'Studio blue',
      value: 'studioBlue',
      background: '#07111f',
      accent: '#38bdf8',
    },
    {
      label: 'Midnight',
      value: 'midnight',
      background: '#050816',
      accent: '#a78bfa',
    },
    {
      label: 'Emerald',
      value: 'emerald',
      background: '#052e2b',
      accent: '#34d399',
    },
    {
      label: 'Sunset',
      value: 'sunset',
      background: '#21110b',
      accent: '#fb923c',
    },
  ];
  protected mainParticipantId = computed(
    () =>
      this.selectedMainParticipantId() ??
      this.me()?.id ??
      this.participants()[0]?.id ??
      null,
  );
  protected isLocalMain = computed(() => this.mainParticipantId() === this.me()?.id);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly chatService: ChatService,
    private readonly roomsService: RoomsService,
    private readonly participantsApiService: ParticipantsApiService,
    private readonly realtimeService: RealtimeService,
    private readonly mediaDevicesService: MediaDevicesService,
    private readonly webrtcService: WebrtcService,
  ) {
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

  protected showScenePanel(): void {
    this.activeSidePanel.set('scene');
  }

  protected setStageLayout(layout: StageLayout): void {
    this.stageLayout.set(layout);
  }

  protected setScenePreset(preset: ScenePreset): void {
    const selectedPreset = this.scenePresetOptions.find(
      (option) => option.value === preset,
    );

    this.scenePreset.set(preset);

    if (selectedPreset) {
      this.sceneBackground.set(selectedPreset.background);
      this.sceneAccent.set(selectedPreset.accent);
    }
  }

  protected setSceneBackground(color: string): void {
    this.scenePreset.set('custom');
    this.sceneBackground.set(color);
  }

  protected setSceneAccent(color: string): void {
    this.scenePreset.set('custom');
    this.sceneAccent.set(color);
  }

  protected setBannerText(text: string): void {
    this.bannerText.set(text);
  }

  protected setBannerStyle(style: BannerStyle): void {
    this.bannerStyle.set(style);
  }

  protected setBannerBackground(color: string): void {
    this.bannerBackground.set(color);
  }

  protected setBannerTextColor(color: string): void {
    this.bannerTextColor.set(color);
  }

  protected toggleBanner(): void {
    this.bannerVisible.update((visible) => !visible);
  }

  protected featureLocal(): void {
    const participant = this.me();

    if (participant) {
      this.selectedMainParticipantId.set(participant.id);
    }
  }

  protected featureParticipant(participant: Participant): void {
    this.selectedMainParticipantId.set(participant.id);
  }

  protected isFeatured(participant: Participant): boolean {
    return this.mainParticipantId() === participant.id;
  }

  protected leaveConference(): void {
    void this.router.navigateByUrl('/dashboard');
  }

  protected isSelf(participant: Participant): boolean {
    return this.me()?.id === participant.id;
  }

  protected participantBySocket(socketId: string): Participant | null {
    return (
      this.participants().find((participant) => participant.socketId === socketId) ??
      null
    );
  }

  protected isRemoteFeatured(socketId: string): boolean {
    const participant = this.participantBySocket(socketId);

    return Boolean(participant && this.mainParticipantId() === participant.id);
  }

  protected hasMainRemote(): boolean {
    return this.remoteStreams().some((remote) =>
      this.isRemoteFeatured(remote.socketId),
    );
  }

  protected participantNameBySocket(socketId: string): string {
    return (
      this.participants().find((participant) => participant.socketId === socketId)
        ?.displayName ?? 'Participante remoto'
    );
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
