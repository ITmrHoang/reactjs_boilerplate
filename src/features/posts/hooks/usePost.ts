import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/PostService';
import type { Post } from '@/types/post';

const POSTS_QUERY_KEY = 'posts';

export const useGetPosts = () => useQuery({
  queryKey: [POSTS_QUERY_KEY],
  queryFn: postService.getAll,
});

export const useGetPostById = (id: number | undefined) => useQuery({
  queryKey: [POSTS_QUERY_KEY, id],
  queryFn: () => postService.getOne(id!),
  enabled: !!id, // Chỉ chạy khi có id
});

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPost: Omit<Post, 'id'>) => postService.create(newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedPost: Post) => postService.update(updatedPost.id, updatedPost),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY, variables.id] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY] });
    },
  });
};