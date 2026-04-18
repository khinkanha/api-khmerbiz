export interface ApiResponse<T = unknown> {
  status: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface JwtPayload {
  sub: number;
  username: string;
  domainId: number;
  userLevel: number;
  sitebuilder: boolean;
  type: 'access' | 'refresh';
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    userid: number;
    username: string;
    full_name: string;
    domain_id: number;
    user_level: number;
    sitebuilder: boolean;
  };
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
  thumbnailKey: string;
}
