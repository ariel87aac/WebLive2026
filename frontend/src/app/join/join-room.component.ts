import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { Room } from '../core/models';
import { RoomsService } from '../rooms/rooms.service';

@Component({
  selector: 'app-join-room',
  imports: [FormsModule],
  templateUrl: './join-room.component.html',
  styleUrl: './join-room.component.scss',
})
export class JoinRoomComponent implements OnInit {
  protected room = signal<Room | null>(null);
  protected displayName = '';
  protected loading = signal(false);
  protected error = signal<string | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly roomsService: RoomsService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.error.set('Invitacion no valida.');
      return;
    }

    this.roomsService.getInviteRoom(slug).subscribe({
      next: (room) => this.room.set(room),
      error: () => this.error.set('La sala no existe o ya finalizo.'),
    });
  }

  protected join(): void {
    const room = this.room();

    if (!room || this.displayName.trim().length < 2) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.guestLogin({ displayName: this.displayName.trim() }).subscribe({
      next: () => void this.router.navigate(['/conference', room.slug]),
      error: () => {
        this.error.set('No se pudo entrar como invitado.');
        this.loading.set(false);
      },
    });
  }
}
