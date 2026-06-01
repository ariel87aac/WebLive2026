import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { Room, User } from '../core/models';
import { RoomsService } from '../rooms/rooms.service';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  protected user = signal<User | null>(null);
  protected rooms = signal<Room[]>([]);
  protected title = '';
  protected error = signal<string | null>(null);
  protected loading = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly roomsService: RoomsService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.loadProfile().subscribe({
      next: (user) => this.user.set(user),
      error: () => void this.router.navigateByUrl('/auth'),
    });
    this.loadRooms();
  }

  protected createRoom(): void {
    if (!this.title.trim()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.roomsService.createRoom(this.title.trim()).subscribe({
      next: (room) => {
        this.title = '';
        this.rooms.set([room, ...this.rooms()]);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo crear la sala.');
        this.loading.set(false);
      },
    });
  }

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/auth');
  }

  protected inviteUrl(room: Room): string {
    return `${window.location.origin}${room.invitationPath}`;
  }

  private loadRooms(): void {
    this.roomsService.getRooms().subscribe({
      next: (rooms) => this.rooms.set(rooms),
      error: () => this.error.set('No se pudieron cargar las salas.'),
    });
  }
}
