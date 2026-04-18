// Domain
export interface IDomain {
  domain_id: number;
  domain_name: string | null;
  company_address: string | null;
  company_desc: string | null;
  company_name: string | null;
  phone_number: string | null;
  email: string | null;
  status: number;
  start_date: string | null;
  expire_date: string | null;
  file_limit: number;
  menu_cache: string | null;
  lang_cache: string | null;
}

// User
export interface IUser {
  userid: number;
  username: string;
  domain_id: number;
  full_name: string;
  phone: string;
  email: string;
  sitebuilder: number;
  user_level: number;
  password: string;
  verify_code: string | null;
}

// Content
export interface IContent {
  content_id: number;
  description: string | null;
  menu_id: number;
  domain_id: number;
  content_type: number;
  userid: number;
  status: number;
  lang_id: number;
  title: string;
}

// ContentItem
export interface IContentItem {
  item_id: number;
  create_date: string | null;
  title: string;
  url: string | null;
  upload_by: number;
  status: number;
  description: string | null;
  item_type: number;
  content_id: number;
  document_type: string | null;
}

// News
export interface INews {
  id: number;
  content_id: number;
  description: string | null;
  userid: number;
  status: number;
  create_date: string | null;
  priority: number;
  publish_date: string | null;
}

// MenuItem
export interface IMenuItem {
  item_id: number;
  item_name: string | null;
  item_url: string | null;
  parent_id: number;
  item_order: number;
  lang_id: number;
  domain_id: number;
}

// Banner
export interface IBanner {
  banner_id: number;
  image: string | null;
  domain_id: number;
  title: string | null;
  description: string | null;
  lang_id: number;
}

// Media
export interface IMedia {
  photo_id: number;
  file_name: string | null;
  title: string | null;
  server_id: number;
  domain_id: number;
  code: string | null;
}

// Language
export interface ILanguage {
  lang_id: number;
  lang_name: string;
  flag: number;
  domain_id: number;
  is_default?: number;
}

// Setting
export interface ISetting {
  setting_id: number;
  domain_id: number;
  domain_name: string | null;
  logo: string;
  mobile_logo: string;
  footer: string | null;
  title: string | null;
  menu_position: string | null;
  banner_position: string | null;
  banner_display: number;
  logo_position: string | null;
  logo_align: string | null;
  menu_align: string | null;
  screen_mode: string | null;
  banner_mode: string | null;
  plugin_mode: string | null;
  background: string | null;
  footer_align: number;
  theme: number;
  tracking_id: string | null;
  chat_script: string | null;
  page_style: number;
}

// SocialMedia
export interface ISocialMedia {
  smid: number;
  stype: number;
  link: string | null;
  domain_id: number;
}

// Plugin
export interface IPlugin {
  plid: number;
  domain_id: number;
  desc: string | null;
}

// DocumentType
export interface IDocumentType {
  typeid: number;
  description: string | null;
}
