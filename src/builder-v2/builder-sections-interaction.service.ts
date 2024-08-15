import {Injectable} from "@angular/core";
import {
  BuilderGeneratedPageSectionI,
  ColorI,
  PageMetaI,
  SecondaryPageWithSectionsI,
  SectionTemplateI
} from "./builder-v2.interface";
import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";
import {Subject} from "rxjs/internal/Subject";
import {FormControl, Validators} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class BuilderSectionsInteractionService {
  loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  minZoom: BehaviorSubject<number> = new BehaviorSubject<number>(30);
  maxZoom: BehaviorSubject<number> = new BehaviorSubject<number>(250);
  pageSections: BuilderGeneratedPageSectionI[] = [];
  defaultColor: BehaviorSubject<ColorI> = new BehaviorSubject<ColorI>({
    title: 'Indigo',
    primaryColor: '#283566',
    secondaryColor: '#986424'
  });
  activeColor: BehaviorSubject<ColorI> = new BehaviorSubject<ColorI>({
    title: 'Indigo',
    primaryColor: '#283566',
    secondaryColor: '#986424'
  });
  activeFont: BehaviorSubject<string> = new BehaviorSubject<string>('Montserrat');
  activeTheme: BehaviorSubject<string> = new BehaviorSubject<string>('Flat');
  aiGeneratedStyle;
  sectionChanges: Subject<{
    sections: BuilderGeneratedPageSectionI[],
    changedIndex?: number
  }> = new Subject<{
    sections: BuilderGeneratedPageSectionI[],
    changedIndex?: number
  }>();
  saveCustomizationChanges: Subject<void> = new Subject<void>();
  siteInfo: BehaviorSubject<{
    business_name: string,
    business_description: string,
    generate_secondary_pages?: boolean,
    business_type: string,
    domain_name?: string
  }> = new BehaviorSubject<{
    business_name: string,
    business_description: string,
    generate_secondary_pages?: boolean,
    business_type: string,
  }>(null);
  websiteInfo: {
    website_description: string;
    website_title: string;
    website_keyphrase: string;
    website_design_type_level: number
  };
  updateSectionTypes: BehaviorSubject<BuilderGeneratedPageSectionI[]> = new BehaviorSubject<BuilderGeneratedPageSectionI[]>([]);
  updateSection: BehaviorSubject<BuilderGeneratedPageSectionI[]> = new BehaviorSubject<BuilderGeneratedPageSectionI[]>([]);
  buildLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  generateDescriptionLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  saveLocalState: Subject<void> = new Subject();
  pageLoaded: Subject<void | boolean> = new Subject<void | boolean>();
  scrollToSection: Subject<string> = new Subject<string>();
  requestSubject: Subject<{ action: string, response: any }> = new Subject<{ action: string, response: any }>();
  updateEnhancedSection: Subject<{
    index: number,
    section_title: string,
    section_description: string
  }> = new Subject<{
    index: number,
    section_title: string,
    section_description: string
  }>();
  enhanceSection: Subject<{ type: 'new' | 'enhance' | 'title' | 'description', index: number }> = new Subject<{
    type: 'enhance',
    index: number
  }>();
  showArcade: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showRightClick = true;
  isSectionEdit = false;
  canAddSection: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  secondaryPageLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  secondaryPages: BehaviorSubject<SecondaryPageWithSectionsI[]> = new BehaviorSubject<SecondaryPageWithSectionsI[]>([]);
  changePageOutline: Subject<{ action: 'add' | 'remove'; template: SectionTemplateI; tempo: boolean; index?: number }> =
    new Subject<{ action: 'add' | 'remove'; template: any; tempo: boolean; index?: number }>();

  checkAddLimit(sectionsCount: number) {
    const limit = 12;
    this.canAddSection.next(sectionsCount < limit);
  }

  resetSubjects() {
    this.loading.next(false);
    this.minZoom.next(30);
    this.maxZoom.next(250);
    this.pageSections = [];
    this.defaultColor.next({
      title: 'Indigo',
      primaryColor: '#283566',
      secondaryColor: '#986424'
    });
    this.activeColor.next({
      title: 'Indigo',
      primaryColor: '#283566',
      secondaryColor: '#986424'
    });
    this.activeFont.next('Montserrat');
    this.activeTheme.next('Flat');
    this.aiGeneratedStyle = null;
    this.siteInfo.next(null);
    this.updateSectionTypes.next([]);
    this.buildLoading.next(false);
    this.generateDescriptionLoading.next(false);
    this.showArcade.next(false);
    this.isSectionEdit = false;
    this.secondaryPageLoading.next(false);
  }

  addFormControls(sections: BuilderGeneratedPageSectionI[]): BuilderGeneratedPageSectionI[] {
    return sections.map(section => {
      section.description_control = new FormControl(section.section_description, {updateOn: 'blur'});
      section.title_control = new FormControl(section.section_title, {updateOn: 'blur'});

      return section;
    });
  }

  removeFormControls(sections: BuilderGeneratedPageSectionI[]): BuilderGeneratedPageSectionI[] {
    return sections.map(({description_control, title_control, ...rest}) => rest);
  }

  getModifiedSectionStructure(sections: BuilderGeneratedPageSectionI[], index: number = null, updateFields = false) {
    sections = sections.map(({loading, ...section}, index) => {
      section.index = index;
      if (updateFields) {
        section.section_title = section.title_control?.value;
        section.section_description = section.description_control?.value;
      }
      return section;
    });
    return {
      "page_outline": {
        sections: this.removeFormControls(sections)
      },
      "section_index": index,
      "business_type": this.siteInfo.value.business_type,
      "business_name": this.siteInfo.value.business_name,
      "business_description": this.siteInfo.value.business_description
    };
  }

  removeExtraKeysFromSections(sections: BuilderGeneratedPageSectionI[], onlyBase = false) {
    return sections.map(({description_control, title_control, is_tempo, loading, ...mainSection}) => {
      if (onlyBase) {
        const {variation, reasoning, section_type, ...base} = mainSection;
        return base;
      }
      return mainSection;
    });
  }

  getPagesMeta(removeAllExtraKeys = true) {
    return this.secondaryPages.value.map(({page, sections}) => {
      sections = sections.map(section => {
        section.section_description = section.description_control?.value || section.section_description;
        section.section_title = section.title_control?.value || section.section_title;
        return section;
      });
      sections = this.removeExtraKeysFromSections(this.removeFormControls(sections), removeAllExtraKeys);
      return {
        ...page,
        sections
      };
    });
  }

  convertToSecondaryPages(pageMeta: PageMetaI[]): SecondaryPageWithSectionsI[] {
    return pageMeta.map((resp, index) => {
      return {
        page: pageMeta[index],
        sections: resp.sections
      };
    });
  }
}
