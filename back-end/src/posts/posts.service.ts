import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export interface Post {
  id: number;
  userId: number;
  title: string;
}

@Injectable()
export class PostsService {
  private posts: Post[] = Array.from({ length: 100 }).map((_, i) => ({
    id: i + 1,
    userId: (i % 100) + 1, // her kullanıcıya bir post
    title: `Post Başlığı ${i + 1}`,
  }));

  create(createPostDto: CreatePostDto): Post {
    const newPost: Post = {
      id: this.posts.length > 0 ? Math.max(...this.posts.map(p => p.id)) + 1 : 1,
      userId: createPostDto.userId,
      title: createPostDto.title,
    };
    this.posts.push(newPost);
    return newPost;
  }

  findAll(): Post[] {
    return this.posts;
  }

  findOne(id: number): Post | undefined {
    return this.posts.find(post => post.id === id);
  }

  update(id: number, updatePostDto: UpdatePostDto): Post | undefined {
    const post = this.findOne(id);
    if (post) Object.assign(post, updatePostDto);
    return post;
  }

  remove(id: number): { deleted: boolean } {
    const initialLength = this.posts.length;
    this.posts = this.posts.filter(post => post.id !== id);
    return { deleted: this.posts.length < initialLength };
  }
}
