import { BASE_URL } from "@/utils/config";
import { http, HttpResponse } from "msw";
const apiUrl = path => {
  return `${BASE_URL}${path}`;
};
export const handlers = [
  // Mock request GET tới /api/user
  http.get(apiUrl("/posts"), () => {
    // Trả về một response JSON giả
    return HttpResponse.json([
      {
        id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d",
        userId: "1",
        title: "title",
        body: "body",
      },
    ]);
  }),
  // use mock for all base url
  http.delete("*/posts/c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d", () => {
    // Trả về một response JSON giả
    return HttpResponse.json({
      id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d",
      status: 1,
    });
  }),
];
