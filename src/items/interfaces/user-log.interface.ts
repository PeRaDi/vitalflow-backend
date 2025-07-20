import { TransactionType } from '../types/transaction-type.enum';

export interface UserLog {
    userId: number;
    username: string;
    transactionType: TransactionType;
    quantity: number;
    date: Date;
}
