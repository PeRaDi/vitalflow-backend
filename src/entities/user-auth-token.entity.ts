import { User } from "./user.entity";

export interface UserAuthToken {
    id: number;
    user: User;
    token: string;
    ip: string;
    createdAt: Date;
    updatedAt: Date;
}