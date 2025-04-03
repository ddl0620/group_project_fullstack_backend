"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const env_1 = require("../config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (userId) => {
    // @ts-ignore
    return jsonwebtoken_1.default.sign({ userId }, env_1.JWT_SECRET, { expiresIn: env_1.JWT_EXPIRES_IN });
};
exports.generateToken = generateToken;
