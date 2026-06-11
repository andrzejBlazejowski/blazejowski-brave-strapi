import type { Schema, Struct } from '@strapi/strapi';

export interface CvEducation extends Struct.ComponentSchema {
  collectionName: 'components_cv_educations';
  info: {
    description: 'An education entry';
    displayName: 'Education';
    icon: 'graduationCap';
  };
  attributes: {
    degree: Schema.Attribute.String & Schema.Attribute.Required;
    endDate: Schema.Attribute.String & Schema.Attribute.Required;
    institution: Schema.Attribute.String & Schema.Attribute.Required;
    startDate: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CvEmployment extends Struct.ComponentSchema {
  collectionName: 'components_cv_employments';
  info: {
    description: 'A period of employment at a company';
    displayName: 'Employment';
    icon: 'briefcase';
  };
  attributes: {
    company: Schema.Attribute.String & Schema.Attribute.Required;
    endDate: Schema.Attribute.String & Schema.Attribute.Required;
    key: Schema.Attribute.UID<'company'> & Schema.Attribute.Required;
    location: Schema.Attribute.String;
    projects: Schema.Attribute.Component<'cv.project', true>;
    role: Schema.Attribute.String & Schema.Attribute.Required;
    startDate: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CvHighlight extends Struct.ComponentSchema {
  collectionName: 'components_cv_highlights';
  info: {
    description: 'A single project or role highlight bullet point';
    displayName: 'Highlight';
    icon: 'bulletList';
  };
  attributes: {
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface CvLanguage extends Struct.ComponentSchema {
  collectionName: 'components_cv_languages';
  info: {
    description: 'Language proficiency (CEFR levels)';
    displayName: 'Language';
    icon: 'earth';
  };
  attributes: {
    isNative: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    listening: Schema.Attribute.Enumeration<
      ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    > &
      Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    reading: Schema.Attribute.Enumeration<
      ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    > &
      Schema.Attribute.Required;
    speaking: Schema.Attribute.Enumeration<
      ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    > &
      Schema.Attribute.Required;
    writing: Schema.Attribute.Enumeration<
      ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    > &
      Schema.Attribute.Required;
  };
}

export interface CvProfile extends Struct.ComponentSchema {
  collectionName: 'components_cv_profiles';
  info: {
    description: 'Personal profile and contact information';
    displayName: 'Profile';
    icon: 'user';
  };
  attributes: {
    email: Schema.Attribute.Email & Schema.Attribute.Required;
    githubUrl: Schema.Attribute.String;
    linkedinUrl: Schema.Attribute.String;
    location: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    phone: Schema.Attribute.String;
    photo: Schema.Attribute.Media<'images'>;
    summary: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CvProject extends Struct.ComponentSchema {
  collectionName: 'components_cv_projects';
  info: {
    description: 'A project within an employment period';
    displayName: 'Project';
    icon: 'folder';
  };
  attributes: {
    featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    highlights: Schema.Attribute.Component<'cv.highlight', true>;
    key: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    summary: Schema.Attribute.Text & Schema.Attribute.Required;
    technologies: Schema.Attribute.Component<'cv.technology', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CvSkill extends Struct.ComponentSchema {
  collectionName: 'components_cv_skills';
  info: {
    description: 'A single skill or competency';
    displayName: 'Skill';
    icon: 'star';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CvTechnology extends Struct.ComponentSchema {
  collectionName: 'components_cv_technologies';
  info: {
    description: 'A technology or tool used on a project';
    displayName: 'Technology';
    icon: 'code';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'cv.education': CvEducation;
      'cv.employment': CvEmployment;
      'cv.highlight': CvHighlight;
      'cv.language': CvLanguage;
      'cv.profile': CvProfile;
      'cv.project': CvProject;
      'cv.skill': CvSkill;
      'cv.technology': CvTechnology;
    }
  }
}
