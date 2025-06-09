import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { User } from 'generated/prisma';

export class UserEntity implements Omit<User, 'password'> {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @Exclude()
  password: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 25, required: false })
  age: number | null;

  @ApiProperty({ example: 'male', required: false })
  gender: string | null;

  @ApiProperty({ example: 'user', enum: ['user', 'admin'] })
  role: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
