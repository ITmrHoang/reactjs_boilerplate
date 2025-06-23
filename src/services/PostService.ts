import { BaseApiService } from './BaseService';
import type { Post } from '@/types/post';

type CreatePostDto = Omit<Post, 'id'>;

class PostService extends BaseApiService<Post, any, CreatePostDto> {
  constructor() {
    super('posts');
  }
}

export const postService = new PostService();