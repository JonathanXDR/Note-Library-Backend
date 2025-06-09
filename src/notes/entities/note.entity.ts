import { ApiProperty } from '@nestjs/swagger';
import { Note } from 'generated/prisma';

export class NoteEntity implements Note {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'My Important Note', required: false })
  title: string | null;

  @ApiProperty({ example: 'This is the content of my note' })
  description: string;

  @ApiProperty({ example: 'user-uuid' })
  userId: string;

  @ApiProperty({ example: 'collection-uuid', required: false })
  noteCollectionId: string | null;

  constructor(partial: Partial<NoteEntity>) {
    Object.assign(this, partial);
  }
}
