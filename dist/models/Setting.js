"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Setting = void 0;
const objection_1 = require("objection");
const BaseModel_1 = require("./BaseModel");
class Setting extends BaseModel_1.BaseModel {
    static tableName = 'tblsetting';
    static idColumn = 'setting_id';
    setting_id;
    domain_id;
    domain_name;
    logo;
    mobile_logo;
    footer;
    title;
    menu_position;
    banner_position;
    banner_display;
    logo_position;
    logo_align;
    menu_align;
    screen_mode;
    banner_mode;
    plugin_mode;
    background;
    footer_align;
    theme;
    tracking_id;
    chat_script;
    page_style;
    static STYLE_DEFAULT = 0;
    static STYLE_INVERSE = 1;
    static STYLE_RED = 2;
    static STYLE_GREEN = 3;
    static STYLE_PURPLE = 4;
    static STYLE_YELLOW = 5;
    static TEMPLATE_CLASSIC = 0;
    static TEMPLATE_SINGLE_PAGE = 1;
    static TEMPLATE_MAGAZINE = 2;
    static TEMPLATE_HERO = 3;
    static relationMappings = {
        domain: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/Domain',
            join: { from: 'tblsetting.domain_id', to: 'tbldomain.domain_id' },
        },
    };
    static async getByDomain(domainId) {
        return this.query().where('domain_id', domainId).first();
    }
    static getThemeName(theme) {
        const themes = {
            0: 'Default',
            1: 'Inverse',
            2: 'Red',
            3: 'Green',
            4: 'Purple',
            5: 'Yellow',
        };
        return themes[theme] || 'Default';
    }
    static getTemplateName(style) {
        const templates = {
            0: 'Classic',
            1: 'Single Page',
            2: 'Magazine',
            3: 'Hero',
        };
        return templates[style] || 'Classic';
    }
}
exports.Setting = Setting;
//# sourceMappingURL=Setting.js.map