import jwt, {JwtPayload} from "jsonwebtoken";

export const decodeToken = (token: string): (string | JwtPayload) => {
    try {
        if(!token) throw new Error('Token is not provided');
        if(!process.env.JWT_SECRET)  throw new Error('JWT secret is not defined');

        const decoded: (string | JwtPayload) = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
}