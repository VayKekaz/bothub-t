import { Injectable, UnauthorizedException } from '@nestjs/common';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';


@Injectable()
export class CryptoService {
    private readonly saltRounds: number;

    constructor(config: ConfigService) {
        this.saltRounds = parseInt(config.get('PWHASH_SALT_ROUNDS', '10'));
    }

    hash(string: string): Promise<string> {
        return hash(string, this.saltRounds);
    }

    doMatch(input: string, hash: string): Promise<boolean> {
        return compare(input, hash);
    }

    async throwIfNoMatch(
        input: string, hash: string,
        error: any | (() => any) = () => new UnauthorizedException('Passwords do not match'),
    ) {
        if (await this.doMatch(input, hash))
            return;

        if (isFunction(error))
            throw error();
        else
            throw error;
    }
}
