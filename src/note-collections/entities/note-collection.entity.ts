import { ApiProperty } from '@nestjs/swagger';
import { NoteCollection } from 'generated/prisma';
import { NoteEntity } from '../../notes/entities/note.entity';

export class NoteCollectionEntity implements NoteCollection {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'My Important Collection' })
  title: string;

  @ApiProperty({ example: 'user-uuid' })
  userId: string;

  @ApiProperty({ type: [NoteEntity], required: false })
  notes?: NoteEntity[];

  constructor(partial: Partial<NoteCollectionEntity>) {
    Object.assign(this, partial);
  }
}
