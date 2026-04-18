// Parse the polymorphic Content.description JSON per content type
// Content types: 0=Article, 1=Photo, 2=Video, 3=Document, 4=News, 5=Map

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

export function parseDescription(raw: string | null): GenericDescription | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return { title: raw, description: '' };
  }
}

export function parseArticleDescription(raw: string | null): ArticleDescription | null {
  return parseDescription(raw) as ArticleDescription | null;
}

export function parseNewsDescription(raw: string | null): NewsDescription | null {
  return parseDescription(raw) as NewsDescription | null;
}

export function parseMapDescription(raw: string | null): MapDescription | null {
  return parseDescription(raw) as MapDescription | null;
}

export function stringifyDescription(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}
