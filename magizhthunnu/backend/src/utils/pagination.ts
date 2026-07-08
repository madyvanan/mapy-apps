import { Request } from 'express';
import { Pagination } from '../types';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export const getPaginationOptions = (req: Request): PaginationOptions => {
  const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPagination = (page: number, limit: number, total: number): Pagination => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
