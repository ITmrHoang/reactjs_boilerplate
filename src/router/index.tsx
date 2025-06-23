import { createBrowserRouter } from 'react-router-dom';

// Layouts
import PrivateLayout from '@/components/layouts/PrivateLayout';

// Pages
import HomePage from '@/pages/Home';
import NotFoundPage from '../pages/NotFoundPage';
import { PostList } from '@/pages/PostList/PostList';

export const router = createBrowserRouter([
  {
    // Route cha, sử dụng PrivateLayout
    path: '/',
    element: <PrivateLayout />,
    children: [
      {
        // Route con cho trang chủ
        index: true, // Đánh dấu đây là route mặc định của cha
        element: <HomePage />,
      },
      {
        // Route con cho trang giới thiệu
        path: 'posts',
        element: <PostList />,
      },
    ],
  },
  {
    // Route cho trang không tìm thấy (404)
    path: '*',
    element: <NotFoundPage />,
  },
]);