import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { WSGateWay } from 'src/websockets/websockets.gateway';

enum LogsGrade {
    INFO = 'INFO',
    DEBUG = 'DEBUG',
    ERROR = 'ERROR',
}

@Injectable()
export class LogsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly usersService: UsersService,
        private readonly ws: WSGateWay,
    ) {}

    /**
     * user_id의 progress log 조회.
     */
    async getProgressLogs(user_id: string) {
        const user = await this.usersService.getUserByUserId(user_id);
        if (!user) {
            return {
                statusCode: 400,
                message: 'User not found',
            };
        }
        const logs = await this.prisma.progressLog.findMany({
            where: {
                user: {
                    id: user.id,
                },
                created_at: {
                    gte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
                },
            },
        });
        const filtered_list = logs.map((log) => {
            return {
                message: log.message,
                created_at: log.created_at,
            };
        });
        return filtered_list;
    }

    /**
     * user_id의 general log 조회.
     * @param user_id
     * @returns
     */
    async getGeneralLogs(user_id: string) {
        const user = await this.usersService.getUserByUserId(user_id);
        if (!user) {
            return {
                statusCode: 400,
                message: 'User not found',
            };
        }
        const logs = await this.prisma.generalLog.findMany({
            where: {
                user: {
                    id: user.id,
                },
                created_at: {
                    gte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
                },
            },
        });
        const filtered_list = logs.map((log) => {
            return {
                name: log.name,
                created_at: log.created_at,
            };
        });
        return filtered_list;
    }

    /**
     * progress log 입력
     * @param user_id
     * @param message
     * @param grade
     * @returns
     */
    async inputProgressLogs(user_id: string, message: string, grade: string) {
        if (!Object.values(LogsGrade).includes(grade as LogsGrade)) {
            return {
                statusCode: 400,
                message: 'Invalid grade',
            };
        }
        const user = await this.usersService.getUserByUserId(user_id);
        if (!user) {
            return {
                statusCode: 400,
                message: 'User not found',
            };
        }
        await this.prisma.progressLog.create({
            data: {
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                message: message,
                grade: grade as LogsGrade,
            },
        });
        this.ws.sendEventByUserId(user.user_id, 'add-progress', {
            message: message,
        });

        return {
            statusCode: 200,
            message: 'Success',
        };
    }

    async generalLogs(user_id: string, name: string) {
        const user = await this.usersService.getUserByUserId(user_id);
        if (!user) {
            return {
                statusCode: 400,
                message: 'User not found',
            };
        }
        await this.prisma.generalLog.create({
            data: {
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                name: name,
            },
        });
        this.ws.sendEventByUserId(user.user_id, 'add-general', {
            name: name,
        });
        return {
            statusCode: 200,
            message: 'Success',
        };
    }
}
