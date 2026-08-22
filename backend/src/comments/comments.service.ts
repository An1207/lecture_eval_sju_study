import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../users/user.entity';
import { Role } from '../common/enums/role.enum';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly postsService: PostsService,
  ) {}

  async create(postId: number, dto: CreateCommentDto, user: User) {
    await this.postsService.findOne(postId);

    const content = dto.content.startsWith('댓글 :')
      ? dto.content
      : `댓글 : ${dto.content}`;

    const comment = this.commentsRepository.create({
      content: "댓글 : " + dto.content,
      postId,
      authorId: user.id,
    });

    return this.commentsRepository.save(comment);
  }

  async remove(id: number, user: User) {
    const comment = await this.commentsRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (user.role !== Role.ADMIN && comment.authorId !== user.id) {
      throw new ForbiddenException('댓글 삭제 권한이 없습니다.');
    }

    await this.commentsRepository.delete(id);
  }
}
