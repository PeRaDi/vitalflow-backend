import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(email: string, username: string, password: string): Promise<User> {
        return this.prisma.user.create({
            data: {
                email: email,
                username: username,
                password: password,
                changePasswordToken: null,
                changePasswordTokenExpiry: null
            }
        });        
    }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async findOne(userId: number): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                id: userId
            }
        });
    }
    
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                email: email
            }
        });
    }
    
    async findByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                username: username
            }
        });
    }

    async findMany(userIds: number[]): Promise<User[]> {
        return this.prisma.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            }
        });
    }

    async update(user: User): Promise<User> {
        return this.prisma.user.update({
            where: {
                id: user.id
            },
            data: user
        });
    }

    async remove(id: number): Promise<boolean> {
        const user = await this.prisma.user.delete({
            where: {
                id: id
            }
        });
        return user ? true : false;
    }
    
    async clearPasswordResetToken(user: User): Promise<User> {
        return this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                changePasswordToken: null,
                changePasswordTokenExpiry: null
            }
        });
    }
}
