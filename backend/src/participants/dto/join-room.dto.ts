import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const participantRoles = ['participant', 'spectator'];

export class JoinRoomDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  socketId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  accessCode?: string;

  @IsOptional()
  @IsIn(participantRoles)
  participantRole?: 'participant' | 'spectator';
}
