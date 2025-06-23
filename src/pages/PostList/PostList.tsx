import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetPosts, useDeletePost } from '@/features/posts/hooks/usePost';
import { Button } from '@/components/atoms/Button';

export const PostList: React.FC = () => {
  const navigate = useNavigate();
  const { data: posts, isLoading, isError } = useGetPosts();
  const deletePostMutation = useDeletePost();

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      deletePostMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading posts...</div>;
  if (isError) return <div>Error loading posts.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Danh sách Bài viết</h1>
        <Button onClick={() => navigate('/posts/new')}>Tạo Bài viết mới</Button>
      </div>
      <div className="bg-white shadow rounded-lg">
        <ul className="divide-y divide-gray-200">
          {posts?.map(post => (
            <li key={post.id} className="p-4 flex justify-between items-center">
              <span className="font-medium">{post.title}</span>
              <div className="space-x-2">
                <Button variant="secondary" onClick={() => navigate(`/posts/${post.id}/edit`)}>Sửa</Button>
                <Button variant="danger" onClick={() => handleDelete(post.id)} isLoading={deletePostMutation.isPending}>Xóa</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};