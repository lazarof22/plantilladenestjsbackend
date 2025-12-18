import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: any }> {
    const user = await this.userModel.findOne({ username: loginDto.username }).select('+password');

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const payload = { username: user.username, sub: user._id, role: user.role };
    const { password, ...userWithoutPassword } = user.toObject();

    // Debug: log what we are about to return to the client
    console.log('[AuthService] login returning user:', userWithoutPassword);

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async register(registerDto: RegisterDto): Promise<{ access_token: string; user: any }> {
    const existingUser = await this.userModel.findOne({
      $or: [
        { username: registerDto.username },
        { email: registerDto.email }
      ]
    });

    if (existingUser) {
      throw new ConflictException('El usuario o email ya existe');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
      status: 'active',
      createdAt: new Date(),
    });

    await user.save();

    const payload = { username: user.username, sub: user._id, role: user.role };
    const { password, ...userWithoutPassword } = user.toObject();

    // Debug: log what we are about to return to the client (register)
    console.log('[AuthService] register returning user:', userWithoutPassword);

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ username }).select('+password');
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }
}
