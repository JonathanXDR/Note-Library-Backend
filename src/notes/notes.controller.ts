import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteEntity } from './entities/note.entity';
import { NotesService } from './notes.service';

@ApiTags('notes')
@ApiBearerAuth()
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
    type: NoteEntity,
  })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<NoteEntity> {
    const note = await this.notesService.create(userId, createNoteDto);
    return new NoteEntity(note);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes for current user' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'collectionId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of notes',
    type: [NoteEntity],
  })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('collectionId') collectionId?: string,
  ): Promise<NoteEntity[]> {
    const notes = await this.notesService.findAll(userId, {
      skip,
      take,
      where: collectionId ? { noteCollectionId: collectionId } : undefined,
    });
    return notes.map((note) => new NoteEntity(note));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note by ID' })
  @ApiResponse({
    status: 200,
    description: 'Note found',
    type: NoteEntity,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteEntity> {
    const note = await this.notesService.findOne(id, userId);
    return new NoteEntity(note);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update note' })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
    type: NoteEntity,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<NoteEntity> {
    const note = await this.notesService.update(id, userId, updateNoteDto);
    return new NoteEntity(note);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete note' })
  @ApiResponse({
    status: 200,
    description: 'Note deleted successfully',
    type: NoteEntity,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteEntity> {
    const note = await this.notesService.remove(id, userId);
    return new NoteEntity(note);
  }
}
