
import { ApiAnalysisResult, DashboardSchema, UIComponentType, ChartType } from '../types';

export const generateBaseSchema = (analysis: ApiAnalysisResult): DashboardSchema => {
  const { structure, fields } = analysis;
  
  const components: any[] = [];

  // Add Stat Cards for numbers
  const numericFields = fields.filter(f => f.type === 'number' && !f.isId);
  numericFields.slice(0, 3).forEach(f => {
    components.push({
      id: `stat-${f.key}`,
      type: UIComponentType.STAT,
      title: f.label,
      props: { field: f.key, aggregate: 'sum', isCurrency: f.isCurrency }
    });
  });

  if (structure === 'array') {
    // Add Chart if there are dates or statuses
    const dateField = fields.find(f => f.type === 'date');
    const statusField = fields.find(f => f.isStatus);
    
    if (statusField) {
      components.push({
        id: 'main-chart',
        type: UIComponentType.CHART,
        title: `${statusField.label} Distribution`,
        props: { 
          chartType: ChartType.PIE, 
          dataKey: statusField.key 
        }
      });
    }

    // Add Main Data Table
    components.push({
      id: 'main-table',
      type: UIComponentType.TABLE,
      title: 'Data Explorer',
      props: { 
        columns: fields.filter(f => !['object', 'array'].includes(f.type)).map(f => ({
          header: f.label,
          accessorKey: f.key,
          type: f.type
        }))
      }
    });
  } else {
    // Single Object View
    components.push({
      id: 'main-details',
      type: UIComponentType.DETAILS,
      title: 'Item Details',
      props: { fields: fields }
    });
  }

  return {
    layout: 'admin',
    sidebar: [{ id: 'dashboard', title: 'Dashboard', icon: 'LayoutDashboard' }],
    pages: [{
      id: 'dashboard',
      title: 'Overview',
      components
    }]
  };
};
