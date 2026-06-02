export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    pagination?: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    }
}
