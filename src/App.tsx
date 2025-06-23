import { Routes, Route, BrowserRouter } from "react-router-dom";
import { PrivateLayout } from "@/components/layouts/PrivateLayout";
import PostList from "@/pages/PostList";
import NotFoundPage from "@/pages/NotFoundPage"; // Tạo một file NotFound đơn giản
import { lazy, Suspense } from "react";
const Home = lazy(() => import("@/pages/Home"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route> */}
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/posts"
            element={<PrivateLayout />}
          >
            <Route
              index
              element={<PostList />}
            />
            {/* <Route path="create" element={<PostCreate />} /> */}
          </Route>
          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
