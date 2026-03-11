"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const registerUser = async (email, password) => {
    const hashed = await bcrypt_1.default.hash(password, 10);
    return prisma.user.create({ data: { email, password: hashed } });
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: { roles: { include: { role: true } } }
    });
    if (!user || !await bcrypt_1.default.compare(password, user.password))
        throw new Error('Invalid credentials');
    // Transform roles for frontend
    const roles = user.roles.map((ur) => ur.role.name);
    return { ...user, roles };
};
exports.loginUser = loginUser;
const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: { roles: { include: { role: true } } }
    });
    if (!user)
        return null;
    const roles = user.roles.map((ur) => ur.role.name);
    return { ...user, roles };
};
exports.getUserById = getUserById;
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: userId }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
