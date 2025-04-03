"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthControllers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const httpsError_helpers_1 = require("../helpers/httpsError.helpers");
const jwtGenerate_helper_1 = require("../helpers/jwtGenerate.helper");
const candidate_models_1 = require("../models/candidate.models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthControllers {
    signUp(request, response, nextFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const { name, dob, email, password, phone, cccd, university, major, sid } = request.body;
                const existingUser = yield candidate_models_1.CandidateModel.findOne({ email });
                if (existingUser) {
                    throw new httpsError_helpers_1.HttpError("User already exists", 400, "USER_EXISTS", response);
                }
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
                const [newUser] = yield candidate_models_1.CandidateModel.create([{
                        name,
                        email,
                        password: hashedPassword,
                        dob,
                        phone,
                        cccd,
                        university,
                        major,
                        sid
                    }], { session: session });
                const token = (0, jwtGenerate_helper_1.generateToken)(newUser.id.toString());
                yield session.commitTransaction();
                yield session.endSession();
                response.status(201).json({
                    success: true,
                    message: "User created successfully",
                    data: {
                        user: newUser,
                        token
                    }
                });
            }
            catch (err) {
                yield session.abortTransaction();
                nextFunction(err);
            }
            finally {
                session.endSession();
            }
        });
    }
    signIn(request, response, nextFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const { email, password } = request.body;
                const user = yield candidate_models_1.CandidateModel.findOne({ email });
                if (!user) {
                    throw new httpsError_helpers_1.HttpError("User does not exist", 400, "USER_NOT_EXISTS", response);
                }
                const isValidPassword = yield bcryptjs_1.default.compare(password, user.password);
                if (!isValidPassword) {
                    throw new httpsError_helpers_1.HttpError("Invalid password", 400, "INVALID_PASSWORD", response);
                }
                const token = (0, jwtGenerate_helper_1.generateToken)(user.id.toString());
                response.status(200).json({
                    success: true,
                    message: "User signed in successfully",
                    data: {
                        user,
                        token
                    }
                });
            }
            catch (err) {
                nextFunction(err);
            }
            finally {
                session.endSession();
            }
        });
    }
    signOut(request, response, nextFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
}
exports.AuthControllers = AuthControllers;
