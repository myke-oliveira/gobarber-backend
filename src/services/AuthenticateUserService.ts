import { getRepository } from 'typeorm';
import { compare } from 'bcryptjs';
import { sign } from "jsonwebtoken";
import User from '../models/User';
import authConfig from '../config/auth';
import AppError from "../errors/AppError";

interface RequestDTO {
  email: string;
  password: string;
}

class AuthenticateUserService {
  /**
   * execute
   */
  public async execute({ email, password }: RequestDTO): Promise<{user: User, token: string}> {
    const userRepository = getRepository(User);

    const user = await userRepository.findOne({
      where: { email }
    });

    if (!user) {
      throw new AppError ('Incorret email/password combination.', 401);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError('Incorret email/password combination.', 401);
    }

    delete user.password;

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    return { user, token };
  }
}

export default AuthenticateUserService;