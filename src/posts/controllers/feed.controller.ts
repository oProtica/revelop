import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Request,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { DeleteResult, UpdateResult } from 'typeorm';
import { createPostDto } from '../dto/createPost.dto';
import { UpdatePostDto } from '../dto/updatePost.dto';
import { FeedPost } from '../models/post.interface';
import { FeedService } from '../services/feed.service';

@Controller('posts')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() post: createPostDto, @Request() req): Observable<FeedPost> {
    return this.feedService.createPost(req.user, post);
  }

  @Get()
  findAll(): Observable<FeedPost[]> {
    return this.feedService.findAllPosts();
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  update(
    @Param('id') id: number,
    @Body()
    post: UpdatePostDto,
  ): Observable<UpdateResult> {
    return this.feedService.updatePost(id, post);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  delete(@Param('id') id: number): Observable<DeleteResult> {
    return this.feedService.deletePost(id);
  }
}
