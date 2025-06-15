import { Module } from '@nestjs/common';
import { NoteCollectionsController } from './note-collections.controller';
import { NoteCollectionsService } from './note-collections.service';

@Module({
  controllers: [NoteCollectionsController],
  providers: [NoteCollectionsService],
  exports: [NoteCollectionsService],
})
export class NoteCollectionsModule {}
