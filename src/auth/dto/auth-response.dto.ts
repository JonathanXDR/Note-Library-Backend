import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../users/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ example: 10800 })
  expiresIn: number;

  @ApiProperty({ type: UserEntity })
  user: UserEntity;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
