export interface PaginatedUserLogs {
    data: {
        userId: number;
        username: string;
        transactionType: 'IN' | 'OUT';
        quantity: number;
        date: string;
    }[];
    pagination: {
        hasNext: boolean;
        nextCursor?: string;
        limit: number;
    };
}
