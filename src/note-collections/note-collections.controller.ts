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
import { CreateNoteCollectionDto } from './dto/create-note-collection.dto';
import { UpdateNoteCollectionDto } from './dto/update-note-collection.dto';
import { NoteCollectionEntity } from './entities/note-collection.entity';
import { NoteCollectionsService } from './note-collections.service';

@ApiTags('note-collections')
@ApiBearerAuth()
@Controller('note-collections')
export class NoteCollectionsController {
  constructor(
    private readonly noteCollectionsService: NoteCollectionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note collection' })
  @ApiResponse({
    status: 201,
    description: 'Note collection created successfully',
    type: NoteCollectionEntity,
  })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createNoteCollectionDto: CreateNoteCollectionDto,
  ): Promise<NoteCollectionEntity> {
    const collection = await this.noteCollectionsService.create(
      userId,
      createNoteCollectionDto,
    );
    return new NoteCollectionEntity(collection);
  }

  @Get()
  @ApiOperation({ summary: 'Get all note collections for current user' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of note collections',
    type: [NoteCollectionEntity],
  })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
  ): Promise<NoteCollectionEntity[]> {
    const collections = await this.noteCollectionsService.findAll(userId, {
      skip,
      take,
    });
    return collections.map(
      (collection) => new NoteCollectionEntity(collection),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note collection by ID' })
  @ApiResponse({
    status: 200,
    description: 'Note collection found',
    type: NoteCollectionEntity,
  })
  @ApiResponse({ status: 404, description: 'Note collection not found' })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteCollectionEntity> {
    const collection = await this.noteCollectionsService.findOne(id, userId);
    return new NoteCollectionEntity(collection);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update note collection' })
  @ApiResponse({
    status: 200,
    description: 'Note collection updated successfully',
    type: NoteCollectionEntity,
  })
  @ApiResponse({ status: 404, description: 'Note collection not found' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteCollectionDto: UpdateNoteCollectionDto,
  ): Promise<NoteCollectionEntity> {
    const collection = await this.noteCollectionsService.update(
      id,
      userId,
      updateNoteCollectionDto,
    );
    return new NoteCollectionEntity(collection);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete note collection' })
  @ApiResponse({
    status: 200,
    description: 'Note collection deleted successfully',
    type: NoteCollectionEntity,
  })
  @ApiResponse({ status: 404, description: 'Note collection not found' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteCollectionEntity> {
    const collection = await this.noteCollectionsService.remove(id, userId);
    return new NoteCollectionEntity(collection);
  }
}
