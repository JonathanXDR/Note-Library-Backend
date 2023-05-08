import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { NoteCollectionsModule } from './noteCollection/noteCollections.module';
import { NotesModule } from './notes/notes.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, AuthModule, NotesModule, NoteCollectionsModule],
  controllers: [AppController],
})
export class AppModule {}
