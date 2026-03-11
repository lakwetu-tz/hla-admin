"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.me = exports.refresh = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const service_1 = require("./service");
const logger_1 = __importDefault(require("../../core/utils/logger"));
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await (0, service_1.loginUser)(email, password);
        const { accessToken, refreshToken } = (0, service_1.generateTokens)(user.id);
        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
        res.json({ accessToken, user });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(401).json({ error: error.message || 'Login failed' });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
        return res.status(401).json({ error: 'No refresh token' });
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_SECRET);
        // Refresh Token Rotation: Generate new set of tokens
        const { accessToken, refreshToken: newRefreshToken } = (0, service_1.generateTokens)(decoded.id);
        res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
        res.json({ accessToken });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};
exports.refresh = refresh;
const me = async (req, res) => {
    try {
        // Assuming auth middleware attaches user id to req.user
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await (0, service_1.getUserById)(userId);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
exports.me = me;
const logout = (req, res) => {
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ message: 'Logged out' });
};
exports.logout = logout;
