import {FormControl} from "@angular/forms";

export interface BuilderGeneratedPageSectionI {
  id?: number;
  index?: number;
  reasoning?: string;
  section_description: string;
  section_title: string;
  section_type?: string;
  variation?: object;
  user_preferences?: object;
  is_tempo?: boolean;
  title_control?: FormControl;
  description_control?: FormControl;
  loading?: boolean;
}

export interface BuilderGeneratedPageI {
  page_outline: {
    sections: BuilderGeneratedPageSectionI[];
  };
  pages_meta: PageMetaI[];
  sections_number: number;
  sections_number_reasoning: string;
  website_description: string;
  website_keyphrase: string;
  website_pages_number_reasoning: string;
  website_title: string;
  website_design_type_level: number;
}

export interface PageThemeI {
  colors: {
    background_dark: string;
    background_light: string;
    background_third: string;
    button_additional_color: string;
    button_text_color: string;
    link_color: string;
    primary_color: string;
    secondary_color: string;
    text_dark: string;
    text_light: string;
  };
  fonts: {
    primary_font: string;
  };
}

export interface SectionTypeI {
  "section_type": string;
  "index": number;
}

export interface ColorI {
  title: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface ColorPaletteI {
  background_dark: string;
  background_light: string;
  background_third: string;
  button_additional_color: string;
  button_text_color: string;
  link_color: string;
  primary_color: string;
  secondary_color: string;
  text_dark: string;
  text_light: string;
}

interface FontsI {
  primary_font: string;
}

interface PageOutline {
  sections: BuilderGeneratedPageSectionI[];
}

export interface PageMetaI {
  id: number;
  index: number;
  title: string;
  slug: string;
  description: string;
  page_type?: string;
  sections?: any[];
}

export interface SiteGenerationI {
  website_keyphrase: string;
  website_description: string;
  website_title: string;
  website_design_type_level: number;
  colors: ColorPaletteI | { primary_color: string, secondary_color: string };
  fonts: FontsI;
  page_outline: PageOutline;
  pages_meta?: PageMetaI[];
  theme: string;
  ai_type?: string;
  business_name: string;
  business_description: string;
  generate_secondary_pages?: boolean;
  domain_name?: string;
  business_type: string;
  post_status: string;
}

export interface StorageSiteStateI {
  colors: ColorPaletteI | { primary_color: string, secondary_color: string };
  fonts: FontsI;
  page_outline: PageOutline;
  pages_meta?: PageMetaI[];
  theme: string;
  active_color: ColorI;
  generated_color: ColorI;
  tour_step: number;
  siteInfo: {
    business_name: string;
    business_description: string;
    generate_secondary_pages?: boolean;
    business_type: string;
  };
  website_info: {
    website_description: string;
    website_title: string;
    website_keyphrase: string;
    website_design_type_level: number
  };
}

export interface SectionTemplateI {
  description: string;
  key: string;
  ui_name: string;
  base64_image: string;
}


export interface SecondaryPageReqI {
  business_type: string;
  business_name: string;
  business_description: string;
  notif_id?: string;
  workspace_id?: number;
  client_id?: number;
  domain_id?: number;
  u_id?: string;
  page_title: string;
  page_type: string;
  page_description: string;
  homepage_outline: PageOutline;
  slug?: string;
  id?: number;
}

export interface SecondaryPageTypeReqI {
  business_type: string;
  business_name: string;
  business_description: string;
  page_index: number;
  pages_meta: {
    id: number;
    index: number;
    title: string;
    slug: string;
    description: string;
    sections: any
    page_type: string;
  }[] | any [];
}

export interface SecondaryPageWithSectionsI {
  page: PageMetaI;
  sections?: BuilderGeneratedPageSectionI[];
}
