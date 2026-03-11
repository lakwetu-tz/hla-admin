"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGpsData = void 0;
const axios_1 = __importDefault(require("axios"));
const getGpsData = async () => {
    try {
        const res = await axios_1.default.get('https://api.example.com/selcome');
        return res.data;
    }
    catch (error) {
        // Retry logic
    }
};
exports.getGpsData = getGpsData;
