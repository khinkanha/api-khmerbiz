import { Model, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';

export class Setting extends BaseModel {
  static tableName = 'tblsetting';
  static idColumn = 'setting_id';

  setting_id!: number;
  domain_id!: number;
  domain_name!: string | null;
  logo!: string;
  mobile_logo!: string;
  footer!: string | null;
  title!: string | null;
  menu_position!: string | null;
  banner_position!: string | null;
  banner_display!: number;
  logo_position!: string | null;
  logo_align!: string | null;
  menu_align!: string | null;
  screen_mode!: string | null;
  banner_mode!: string | null;
  plugin_mode!: string | null;
  background!: string | null;
  footer_align!: number;
  theme!: number;
  tracking_id!: string | null;
  chat_script!: string | null;
  page_style!: number;

  static readonly STYLE_DEFAULT = 0;
  static readonly STYLE_INVERSE = 1;
  static readonly STYLE_RED = 2;
  static readonly STYLE_GREEN = 3;
  static readonly STYLE_PURPLE = 4;
  static readonly STYLE_YELLOW = 5;

  static readonly TEMPLATE_CLASSIC = 0;
  static readonly TEMPLATE_SINGLE_PAGE = 1;
  static readonly TEMPLATE_MAGAZINE = 2;
  static readonly TEMPLATE_HERO = 3;

  static relationMappings: RelationMappings = {
    domain: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/Domain',
      join: { from: 'tblsetting.domain_id', to: 'tbldomain.domain_id' },
    },
  };

  static async getByDomain(domainId: number): Promise<Setting | undefined> {
    return this.query().where('domain_id', domainId).first();
  }

  static getThemeName(theme: number): string {
    const themes: Record<number, string> = {
      0: 'Default',
      1: 'Inverse',
      2: 'Red',
      3: 'Green',
      4: 'Purple',
      5: 'Yellow',
    };
    return themes[theme] || 'Default';
  }

  static getTemplateName(style: number): string {
    const templates: Record<number, string> = {
      0: 'Classic',
      1: 'Single Page',
      2: 'Magazine',
      3: 'Hero',
    };
    return templates[style] || 'Classic';
  }
}
