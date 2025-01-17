import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { InstanceService } from 'src/instance/instance.service';
import { WSGateWay } from 'src/websockets/websockets.gateway';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private instanceService: InstanceService,
        @Inject(forwardRef(() => WSGateWay))
        private ws: WSGateWay,
    ) {}

    /**
     * user_id, user_pw와 일치하는 유저 검색. 없다면 Exception
     * @param user_id
     * @param user_pw
     * @returns
     */
    async find(user_id: string, user_pw: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                user_id: user_id,
            },
        });
        if (!user) throw new HttpException('존재하지 않는 아이디입니다.', 404);

        const isMatch = await bcrypt.compare(user_pw, user.user_pw);
        if (!isMatch) {
            // await this.logService.logError(
            //     'FrontEnd',
            //     '로그인 - 비밀번호 불일치',
            //     {
            //         user_id: user_id,
            //         user_pw_: user_pw,
            //     },
            // );
            throw new HttpException('비밀번호가 일치하지 않습니다.', 401);
        }
        return user;
    }

    /**
     * user_id로 검색. 존재하지 않는다면 null 반환
     * @param user_id
     * @returns
     */
    async findByUserId(user_id: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                user_id: user_id,
            },
        });
        if (!user) return null;
        return user;
    }

    /**
     * 유저 생성
     * @param user_id 아이디
     * @param pw 비밀번호
     * @returns
     */
    async createUser(user_id: string, pw: string, resource_ip: string = '') {
        let user = await this.prisma.user.findFirst({
            where: {
                user_id: user_id,
            },
        });
        if (user) throw new HttpException('이미 존재하는 아이디입니다.', 400);

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(pw, salt);
        const currentDate = new Date();
        const kstOffset = 7 * 24 * 60 * 60 * 1000; // UTC+9 시간 차이를 밀리초로 계산
        const kstDate = new Date(currentDate.getTime() + kstOffset);
        const formattedDateTime = new Date(
            kstDate.getFullYear(),
            kstDate.getMonth(),
            kstDate.getDate(),
            0,
            0,
            0,
        )
            .toISOString()
            .replace('Z', '-09:00');
        user = await this.prisma.user.create({
            data: {
                user_id: user_id,
                user_pw: hash,
                expired_at: formattedDateTime,
            },
        });
        await this.prisma.macroData.create({
            data: {
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });
        await this.prisma.instance.create({
            data: {
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                resource_ip: resource_ip,
            },
        });
        user.user_pw = undefined;
        return user;
    }

    /**
     * User에 대한 정보를 include 쿼리를 통해서 조회한 후 반납하는 함수
     * @param user_id
     * @param include
     * include 쿼리가 있을 경우 포함할 형태
     * 'none' | 'all' | 'macro' | 'instance'
     * @returns
     */
    async getUserByUserId(user_id: string, include: string = 'none') {
        let user = null;
        if (include == 'all') {
            user = await this.prisma.user.findFirst({
                where: {
                    user_id: user_id,
                },
                include: {
                    macro_data: true,
                    instance: true,
                },
            });
        } else if (include == 'macro') {
            user = await this.prisma.user.findFirst({
                where: {
                    user_id: user_id,
                },
                include: {
                    macro_data: true,
                },
            });
        } else if (include == 'instance') {
            user = await this.prisma.user.findFirst({
                where: {
                    user_id: user_id,
                },
                include: {
                    instance: true,
                },
            });
        } else {
            user = await this.prisma.user.findFirst({
                where: {
                    user_id: user_id,
                },
            });
        }
        return user;
    }

    /**
     * user_id의 instance 정보를 조회
     * @param user_id
     * @returns
     */
    async getInstanceByUserId(user_pk: number) {
        const instance = await this.prisma.instance.findFirst({
            where: {
                user_pk: user_pk,
            },
        });
        return instance;
    }

    /**
     * create instance에 대한 콜백.
     * 해당 user_id의 instance 정보를 업데이트
     * 웹소켓으로 알려줌
     * @param user_id
     * @param resource_ip
     * @param adb_port_number
     */
    async callbackCreateInstance(
        user_id: string,
        resource_ip: string,
        adb_port_number: number,
    ) {
        const user = await this.findByUserId(user_id);
        await this.instanceService.updateResourceIpByUserId(
            user,
            resource_ip,
            adb_port_number,
        );
        this.ws.sendEventByUserId(user_id, 'create-instance', {});
    }

    /**
     * 아직 자동화가 되지 않아서 수동으로 등록해야하는데 등록요청을 보낸 정보
     * @param user_id
     * @param login_id
     * @param login_pw
     * @param kinds
     */
    async notRegisteredYet(
        user_id: string,
        login_id: string,
        login_pw: string,
        kinds: string,
    ) {
        const user = await this.findByUserId(user_id);
        await this.prisma.notRegisteredYet.create({
            data: {
                user_id: user.user_id,
                login_id: login_id,
                login_pw: login_pw,
                kinds: kinds,
            },
        });
        await this.instanceService.updateLoginData(user, login_id, login_pw);
        this.ws.sendEventByUserId(user_id, 'not-registered-yet', {});
        return;
    }

    /**
     * 매크로를 실행해야할 유저들을 조회
     * @returns
     */
    async getWantedExecuteUser() {
        const nextExecuteTime = new Date();
        nextExecuteTime.setHours(nextExecuteTime.getHours() + 9);
        const users = await this.prisma.user.findMany({
            where: {
                macro_data: {
                    next_execute_time: {
                        not: null,
                        lte: nextExecuteTime,
                    },
                },
                is_expired: false,
            },
            include: {
                instance: true,
            },
        });
        return users;
    }

    /**
     * 현재 시간을 다음 남은 실행시간으로 덮어씌우는 함수
     * 이 함수가 동작하면 다음 스케쥴러에서 1분안에 MQ로 전달됨
     * @param user_id
     */
    async setCurrentTime(user_id: string) {
        const user = await this.findByUserId(user_id);
        const nextExecuteTime = new Date();
        nextExecuteTime.setHours(nextExecuteTime.getHours() + 9);
        return await this.prisma.macroData.update({
            where: {
                user_pk: user.id,
            },
            data: {
                next_execute_time: nextExecuteTime,
            },
        });
    }

    /**
     * 현재 시간을 null로 업데이트하는 함수
     * @param user_id
     */
    async deleteCurrentTime(user_id: string) {
        const user = await this.findByUserId(user_id);
        return await this.prisma.macroData.update({
            where: {
                user_pk: user.id,
            },
            data: {
                next_execute_time: null,
            },
        });
    }

    /**
     * 콜백을 받아서 다음 실행시간을 입력하는 함수
     * @param user_id
     * @param hour
     * @param minute
     * @param second
     */
    async callbackExecuteTime(
        user_id: string,
        hour: number,
        minute: number,
        second: number,
    ) {
        const user = await this.findByUserId(user_id);
        const nextExecuteTime = new Date();
        nextExecuteTime.setHours(nextExecuteTime.getHours() + 9);
        nextExecuteTime.setHours(nextExecuteTime.getHours() + hour);
        nextExecuteTime.setMinutes(nextExecuteTime.getMinutes() + minute);
        nextExecuteTime.setSeconds(nextExecuteTime.getSeconds() + second);
        await this.prisma.macroData.update({
            where: {
                user_pk: user.id,
            },
            data: {
                next_execute_time: nextExecuteTime,
            },
        });
    }

    /**
     * user_pk를 가진 macrodata의 next_execute_time을 null로 업데이트
     * @param user_pk
     */
    async updateExecuteNull(user_pk: number) {
        await this.prisma.macroData.update({
            where: {
                user_pk: user_pk,
            },
            data: {
                next_execute_time: null,
            },
        });
    }

    /**
     * user_id의 시간을 현재로 설정하여 다음번 큐 작업에 넣음
     * @param user_id
     */
    async getExpiredUser2(user_id: string) {
        const user = await this.findByUserId(user_id);
        const nextExecuteTime = new Date();
        nextExecuteTime.setHours(nextExecuteTime.getHours() + 9);
        await this.prisma.macroData.update({
            where: {
                user_pk: user.id,
            },
            data: {
                next_execute_time: nextExecuteTime,
            },
        });
    }

    /**
     * Dashboard용 매크로 실행 남은 시간 조회
     * @returns
     */
    async getMacroTime() {
        const users = await this.prisma.user.findMany({
            include: {
                macro_data: true,
            },
            where: {
                macro_data: {
                    next_execute_time: {
                        not: null,
                    },
                },
            },
        });
        const macroTimes = users.map((user) => {
            return {
                user_id: user.user_id,
                time: user.macro_data.next_execute_time,
            };
        });
        return macroTimes;
    }

    /**
     * user_id에 해당하는 유저의 매크로 데이터를 조회
     * @param user_id
     * @returns
     */
    async getMacroData(user_id: string) {
        const user = await this.findByUserId(user_id);
        if (!user) throw new HttpException('존재하지 않는 아이디입니다.', 404);
        const macroData = await this.prisma.macroData.findFirst({
            where: {
                user_pk: user.id,
            },
        });
        return {
            subscribe: macroData.subscribe,
            tax: macroData.tax,
            recruit: macroData.recruit,
            trial: macroData.trial,
            exploration: macroData.exploration,
            next_execute_time: macroData.next_execute_time,
        };
    }

    /**
     * 매크로 데이터 업데이트
     * @param user_id
     * @param data
     */
    async setMacroData(user_id: string, data: any) {
        const user = await this.findByUserId(user_id);
        if (!user) throw new HttpException('존재하지 않는 아이디입니다.', 404);
        await this.prisma.macroData.update({
            where: {
                user_pk: user.id,
            },
            data: {
                subscribe: data.subscribe,
                tax: data.tax,
                recruit: data.recruit,
                trial: data.trial,
                exploration: data.exploration,
            },
        });
    }

    async test() {
        return this.ws.sendEventByUserId('egg1', 'add-progress-log', {});
    }
}
