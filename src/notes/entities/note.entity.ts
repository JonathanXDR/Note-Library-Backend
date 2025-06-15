import { ApiProperty } from '@nestjs/swagger';
import { Note } from 'generated/prisma';

export class NoteEntity implements Note {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  title: string | null;

  @ApiProperty()
  description: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false, nullable: true })
  noteCollectionId: string | null;

  constructor(partial: Partial<NoteEntity>) {
    Object.assign(this, partial);
  }
}
