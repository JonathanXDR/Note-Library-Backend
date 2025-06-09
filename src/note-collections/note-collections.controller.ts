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
import { CreateNoteCollectionDto } from './dto/create-note-collection.dto';
import { UpdateNoteCollectionDto } from './dto/update-note-collection.dto';
import { NoteCollectionEntity } from './entities/note-collection.entity';
import { NoteCollectionsService } from './note-collections.service';

@ApiTags('note-collections')
@Controller('note-collections')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
export class NoteCollectionsController {
  constructor(
    private readonly noteCollectionsService: NoteCollectionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all note collections for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of user note collections',
    type: [NoteCollectionEntity],
  })
  async findAll(@CurrentUser() user: User): Promise<NoteCollectionEntity[]> {
    const collections = await this.noteCollectionsService.findAllByUserId(
      user.id,
    );
    return collections.map(
      (collection) => new NoteCollectionEntity(collection),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note collection by ID' })
  @ApiParam({ name: 'id', description: 'Note Collection UUID' })
  @ApiResponse({
    status: 200,
    description: 'Note collection found',
    type: NoteCollectionEntity,
  })
  @ApiResponse({ status: 404, description: 'Note collection not found' })
  async findById(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteCollectionEntity> {
    const collection = await this.noteCollectionsService.findByIdAndUserId(
      id,
      user.id,
    );
    return new NoteCollectionEntity(collection);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new note collection' })
  @ApiResponse({
    status: 201,
    description: 'Note collection created successfully',
    type: NoteCollectionEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @CurrentUser() user: User,
    @Body() createNoteCollectionDto: CreateNoteCollectionDto,
  ): Promise<NoteCollectionEntity> {
    const collection = await this.noteCollectionsService.create(
      user.id,
      createNoteCollectionDto,
    );
    return new NoteCollectionEntity(collection);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update note collection by ID' })
  @ApiParam({ name: 'id', description: 'Note Collection UUID' })
  @ApiResponse({
    status: 200,
    description: 'Note collection updated successfully',
    type: NoteCollectionEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Note collection not found' })
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteCollectionDto: UpdateNoteCollectionDto,
  ): Promise<NoteCollectionEntity> {
    const collection = await this.noteCollectionsService.update(
      id,
      user.id,
      updateNoteCollectionDto,
    );
    return new NoteCollectionEntity(collection);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete note collection by ID' })
  @ApiParam({ name: 'id', description: 'Note Collection UUID' })
  @ApiResponse({
    status: 200,
    description: 'Note collection deleted successfully',
    type: NoteCollectionEntity,
  })
  @ApiResponse({ status: 404, description: 'Note collection not found' })
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteCollectionEntity> {
    const collection = await this.noteCollectionsService.remove(id, user.id);
    return new NoteCollectionEntity(collection);
  }
}
