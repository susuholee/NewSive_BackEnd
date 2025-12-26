import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "./dto/create_users_dto";


@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.user.findMany();
    }

    async create(dto : CreateUserDto) {
        const { username, password} = dto
 

        // 중복 체크 검증
        const dupliCate_Check = await this.prisma.user.findUnique({ where : {username}})

        if (dupliCate_Check) {
            throw new ConflictException("이미 존재하는 아이디 입니다")
        }

        const hashedPwd = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data : {
                username, 
                password : hashedPwd,
            }
        })

        return {
            id : user.id,
            username : user.username,
            nickname: user.nickname,
            createdAt: user.createdAt,
        }
    }
}