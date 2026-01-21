
import React from 'react';
import { DashboardSchema, UIComponentType } from '../types';
import { StatCard, DataTable, ChartRenderer } from './ui/DashboardComponents';

interface JSONRendererProps {
  schema: DashboardSchema;
  data: any;
  activePageId: string;
}

export const JSONRenderer: React.FC<JSONRendererProps> = ({ schema, data, activePageId }) => {
  const page = schema.pages.find(p => p.id === activePageId) || schema.pages[0];

  if (!page) return <div className="p-10 text-slate-400 font-medium">No page configuration available for this dashboard.</div>;

  const dataArray = Array.isArray(data) ? data : [data];

  // Map flexible types from AI to internal constants
  const getNormType = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('STAT')) return UIComponentType.STAT;
    if (t.includes('TABLE')) return UIComponentType.TABLE;
    if (t.includes('CHART')) return UIComponentType.CHART;
    if (t.includes('DETAIL')) return UIComponentType.DETAILS;
    return type as UIComponentType;
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-1 bg-indigo-500 rounded-full"></span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Live Analytics</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{page.title}</h1>
        <p className="text-slate-400 mt-2 font-medium max-w-2xl">
          Instantly synthesized view powered by AI analysis of your REST API response.
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {page.components.filter(c => getNormType(c.type) === UIComponentType.STAT).map(component => {
          let value = '0';
          const field = component.props.field || 'id';
          if (component.props.aggregate === 'sum') {
            value = dataArray.reduce((acc, curr) => acc + (Number(curr[field]) || 0), 0).toString();
          } else if (component.props.aggregate === 'count' || !component.props.aggregate) {
            value = dataArray.length.toString();
          } else {
             value = dataArray[0][field]?.toString() || '0';
          }

          return (
            <StatCard 
              key={component.id}
              title={component.title}
              value={value}
              isCurrency={component.props.isCurrency}
              description={component.description}
            />
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          {page.components.filter(c => getNormType(c.type) === UIComponentType.TABLE).map(component => (
            <DataTable 
              key={component.id}
              title={component.title}
              columns={component.props.columns}
              data={dataArray}
            />
          ))}
          
          {page.components.filter(c => getNormType(c.type) === UIComponentType.DETAILS).map(component => (
            <div key={component.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-slate-800 mb-8 border-l-4 border-indigo-500 pl-4">{component.title}</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {component.props.fields?.map((f: any) => (
                  <div key={f.key} className="space-y-1">
                    <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</dt>
                    <dd className="text-sm text-slate-700 font-bold break-all">
                       {typeof dataArray[0][f.key] === 'object' ? 
                          <pre className="text-[10px] bg-slate-50 p-2 rounded-lg mt-2 overflow-x-auto">{JSON.stringify(dataArray[0][f.key], null, 2)}</pre> : 
                          String(dataArray[0][f.key] || '-')
                       }
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 space-y-8">
          {page.components.filter(c => getNormType(c.type) === UIComponentType.CHART).map(component => (
            <ChartRenderer 
              key={component.id}
              title={component.title}
              type={component.props.chartType}
              dataKey={component.props.dataKey}
              data={dataArray}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
