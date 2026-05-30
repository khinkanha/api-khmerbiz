import { LoginResponse } from '../types/api';
export declare function login(username: string, password: string): Promise<LoginResponse>;
export interface SignupResult {
    userid: number;
    domain_name?: string;
}
export declare function signup(data: {
    username: string;
    password: string;
    full_name: string;
    phone: string;
    email: string;
    domain_name?: string;
}): Promise<SignupResult>;
export declare function verifyAccount(username: string, code: string): Promise<void>;
export declare function refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export declare function logout(userId: number, refreshToken: string): Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map