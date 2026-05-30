export interface ArticleDescription {
    title: string;
    description: string;
}
export interface NewsDescription {
    title: string;
    shortdes: string;
    longdes: string;
    photo: string;
    publish: string;
}
export interface MapDescription {
    title: string;
    description: string;
    lat: number;
    lng: number;
    visible: number;
}
export interface GenericDescription {
    title: string;
    description: string;
}
export declare function parseDescription(raw: string | null): GenericDescription | null;
export declare function parseArticleDescription(raw: string | null): ArticleDescription | null;
export declare function parseNewsDescription(raw: string | null): NewsDescription | null;
export declare function parseMapDescription(raw: string | null): MapDescription | null;
export declare function stringifyDescription(data: Record<string, unknown>): string;
//# sourceMappingURL=content-description.d.ts.map