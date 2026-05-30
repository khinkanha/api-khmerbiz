export declare const config: {
    port: number;
    nodeEnv: string;
    isDev: boolean;
    db: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
    };
    jwt: {
        secret: string;
        accessExpiry: string;
        refreshExpiry: string;
    };
    s3: {
        endpoint: string;
        bucket: string;
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        photoBaseUrl: string;
    };
    upload: {
        maxFileSizeMB: number;
        maxFilesPerDomain: number;
    };
    zai: {
        apiKey: string;
        baseUrl: string;
        model: string;
        temperature: number;
        maxTokens: number;
    };
    recaptcha: {
        secret: string;
    };
};
//# sourceMappingURL=index.d.ts.map