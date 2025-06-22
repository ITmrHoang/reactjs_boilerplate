// src/api/baseApiService.ts

import api from '../utils/api';

// Dùng abstract class để định nghĩa một lớp cơ sở không thể khởi tạo trực tiếp
export abstract class BaseApiService<
  T,
  TParams = Record<string, any>,
  CreateDto = T,
  UpdateDto = Partial<T>
> {
  protected readonly resourceName: string;

  // Constructor nhận vào tên của tài nguyên từ lớp con
  constructor(resourceName: string) {
    this.resourceName = resourceName;
  }

  protected get API_ENDPOINT(): string {
    return `/${this.resourceName}`;
  }

  getAll = (params?: TParams): Promise<T[]> => api.get(this.API_ENDPOINT, { params })

  getOne = (id: number | string): Promise<T> =>  api.get(`${this.API_ENDPOINT}/${id}`)

  create = (data: CreateDto): Promise<T> =>  api.post(this.API_ENDPOINT, data)

  update = (id: number | string, data: UpdateDto): Promise<T> => api.put(`${this.API_ENDPOINT}/${id}`, data)

  remove = (id: number | string): Promise<void> => {
    return api.delete(`${this.API_ENDPOINT}/${id}`);
  };
}