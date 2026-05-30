export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hash: string): Promise<{
    match: boolean;
    needsRehash: boolean;
}>;
export declare function rehashPassword(password: string): Promise<string>;
//# sourceMappingURL=password.d.ts.map