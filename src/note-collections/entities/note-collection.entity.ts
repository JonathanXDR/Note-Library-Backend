import { ApiProperty } from '@nestjs/swagger';
import { NoteCollection } from 'generated/prisma';
import { NoteEntity } from '../../notes/entities/note.entity';

export class NoteCollectionEntity implements NoteCollection {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: [NoteEntity], required: false })
  notes?: NoteEntity[];

  constructor(partial: Partial<NoteCollectionEntity>) {
    Object.assign(this, partial);
    if (partial.notes) {
      this.notes = partial.notes.map((note) => new NoteEntity(note));
    }
  }
}
