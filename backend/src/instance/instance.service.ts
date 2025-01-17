import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

enum InstanceState {
    NOT_EXIST = 'NOT_EXIST',
    NOT_REGISTERED = 'NOT_REGISTERED',
    SUBMIT_REGISTER = 'SUBMIT_REGISTER',
    OFFLINE = 'OFFLINE',
    PREPARING = 'PREPARING',
    RUNNING = 'RUNNING',
}

@Injectable()
export class InstanceService {
    constructor(private prisma: PrismaService) {}

    /**
     * 리소스 아이피를 업데이트 (인스턴스가 생성되고 아이디/비번 등록안된 상황)
     * @param user
     * @param resource_ip
     */
    async updateResourceIpByUserId(
        user: User,
        resource_ip: string,
        adb_port_number: number,
    ) {
        await this.prisma.instance.update({
            where: {
                user_pk: user.id,
            },
            data: {
                resource_ip: resource_ip,
                adb_port_number: adb_port_number,
                state: InstanceState.NOT_REGISTERED,
            },
        });
    }

    /**
     * User의 로그인 정보를 업데이트(수동으로 해줘야하는 부분)
     * @param user
     * @param login_id
     * @param login_pw
     */
    async updateLoginData(user: User, login_id: string, login_pw: string) {
        await this.prisma.instance.update({
            where: {
                user_pk: user.id,
            },
            data: {
                login_id: login_id,
                login_pw: login_pw,
                state: InstanceState.SUBMIT_REGISTER,
            },
        });
    }
}
