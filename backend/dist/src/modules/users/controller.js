"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.getUser = exports.listUsers = void 0;
const service_1 = require("./service");
const redis_1 = require("../../cache/redis");
const listUsers = async (req, res) => {
    const cached = await (0, redis_1.getCache)('users');
    if (cached)
        return res.json(cached);
    const users = await (0, service_1.getUsers)();
    await (0, redis_1.setCache)('users', users);
    res.json(users);
};
exports.listUsers = listUsers;
const getUser = async (req, res) => {
    const user = await (0, service_1.getUserById)(req.params.id);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    res.json(user);
};
exports.getUser = getUser;
const update = async (req, res) => {
    const user = await (0, service_1.updateUser)(req.params.id, req.body);
    res.json(user);
};
exports.update = update;
const remove = async (req, res) => {
    await (0, service_1.deleteUser)(req.params.id);
    res.json({ message: 'User deleted' });
};
exports.remove = remove;
