import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'generated/prisma';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteEntity } from './entities/note.entity';
import { NotesService } from './notes.service';

@ApiTags('notes')
@Controller('notes')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notes for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of user notes',
    type: [NoteEntity],
  })
  async findAll(@CurrentUser() user: User): Promise<NoteEntity[]> {
    const notes = await this.notesService.findAllByUserId(user.id);
    return notes.map((note) => new NoteEntity(note));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note by ID' })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiResponse({
    status: 200,
    description: 'Note found',
    type: NoteEntity,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async findById(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteEntity> {
    const note = await this.notesService.findByIdAndUserId(id, user.id);
    return new NoteEntity(note);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new note' })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
    type: NoteEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @CurrentUser() user: User,
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<NoteEntity> {
    const note = await this.notesService.create(user.id, createNoteDto);
    return new NoteEntity(note);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update note by ID' })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
    type: NoteEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<NoteEntity> {
    const note = await this.notesService.update(id, user.id, updateNoteDto);
    return new NoteEntity(note);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete note by ID' })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiResponse({
    status: 200,
    description: 'Note deleted successfully',
    type: NoteEntity,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteEntity> {
    const note = await this.notesService.remove(id, user.id);
    return new NoteEntity(note);
  }
}
