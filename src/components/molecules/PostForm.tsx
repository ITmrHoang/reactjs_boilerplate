import React, { useState, useEffect } from 'react';
import type { Post } from '@/types/post';
import { Button } from '@/components/atoms/Button/Button';

type PostFormData = Omit<Post, 'id' | 'userId'>;

interface PostFormProps {
  initialData?: Post | null;
  onSubmit: (data: PostFormData) => void;
  isLoading?: boolean;
}

export const PostForm: React.FC<PostFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<PostFormData>({ title: '', body: '' });

  useEffect(() => {
    if (initialData) {
      setFormData({ title: initialData.title, body: initialData.body });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block font-medium">Tiêu đề</label>
        <input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border rounded p-2 mt-1"
          required
        />
      </div>
      <div>
        <label htmlFor="body" className="block font-medium">Nội dung</label>
        <textarea
          id="body"
          name="body"
          value={formData.body}
          onChange={handleChange}
          className="w-full border rounded p-2 mt-1 h-32"
          required
        />
      </div>
      <Button type="submit" isLoading={isLoading}>
        {initialData ? 'Cập nhật' : 'Tạo mới'}
      </Button>
    </form>
  );
};