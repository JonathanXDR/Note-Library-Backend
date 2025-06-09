import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NoteCollectionsController } from './note-collections.controller';
import { NoteCollectionsService } from './note-collections.service';

@Module({
  controllers: [NoteCollectionsController],
  providers: [NoteCollectionsService, PrismaService],
  exports: [NoteCollectionsService],
})
export class NoteCollectionsModule {}
