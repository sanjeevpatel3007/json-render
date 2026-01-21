
export enum UIComponentType {
  STAT = 'STAT',
  TABLE = 'TABLE',
  CHART = 'CHART',
  DETAILS = 'DETAILS',
  BADGE = 'BADGE'
}

export enum ChartType {
  BAR = 'BAR',
  LINE = 'LINE',
  PIE = 'PIE'
}

export interface UIComponentSchema {
  id: string;
  type: UIComponentType | string; // Allow flexible strings for AI compatibility
  title: string;
  description?: string;
  props: any;
}

export interface PageSchema {
  id: string;
  title: string;
  icon?: string;
  components: UIComponentSchema[];
}

export interface DashboardSchema {
  layout: 'admin';
  sidebar: {
    id: string;
    title: string;
    icon?: string;
  }[];
  pages: PageSchema[];
}

export interface ApiFieldMetadata {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  isId?: boolean;
  isStatus?: boolean;
  isCurrency?: boolean;
}

export interface ApiAnalysisResult {
  structure: 'array' | 'object';
  fields: ApiFieldMetadata[];
  sampleData: any;
}

export interface SavedDashboard {
  id: string;
  name: string;
  url: string;
  schema: DashboardSchema;
  data: any;
}
