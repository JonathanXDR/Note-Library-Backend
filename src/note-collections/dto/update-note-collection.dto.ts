import { PartialType } from '@nestjs/swagger';
import { CreateNoteCollectionDto } from './create-note-collection.dto';

export class UpdateNoteCollectionDto extends PartialType(
  CreateNoteCollectionDto,
) {}
