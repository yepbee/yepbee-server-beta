import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}
  findUserByPubkey(pubkey: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        pubkey,
      },
      relations: ['createdBanners', 'ownedBanners', 'transactions'],
    });
  }
}
