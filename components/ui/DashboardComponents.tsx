
import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export const StatCard: React.FC<{ title: string; value: string | number; description?: string; isCurrency?: boolean }> = ({ title, value, description, isCurrency }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-indigo-100">
    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
    <div className="mt-2 flex items-baseline gap-1">
      <span className="text-2xl font-black text-slate-800 tracking-tight">
        {isCurrency ? `$${Number(value).toLocaleString()}` : Number(value).toLocaleString()}
      </span>
    </div>
    {description && <p className="mt-2 text-xs text-slate-400 leading-relaxed font-medium">{description}</p>}
  </div>
);

export const DataTable: React.FC<{ columns: any[]; data: any[]; title?: string }> = ({ columns, data, title }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
      <h2 className="font-bold text-slate-800 text-base">{title || 'Records'}</h2>
      <span className="text-[10px] font-bold bg-white border border-slate-100 text-slate-500 px-2 py-1 rounded-md">
        Showing {Math.min(data.length, 10)} of {data.length}
      </span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest">
          <tr>
            {columns.map((col: any, idx) => (
              <th key={col.accessorKey || idx} className="px-6 py-4 border-b border-slate-50">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.slice(0, 10).map((row, i) => (
            <tr key={i} className="hover:bg-indigo-50/20 transition-colors group">
              {columns.map((col: any, idx) => {
                const val = row[col.accessorKey];
                return (
                  <td key={col.accessorKey || idx} className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {typeof val === 'boolean' ? (
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${val ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {val ? 'Yes' : 'No'}
                      </span>
                    ) : (val?.toString() || '-')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const ChartRenderer: React.FC<{ type: string; dataKey: string; data: any[]; title: string }> = ({ type, dataKey, data, title }) => {
  const counts = data.reduce((acc: any, item: any) => {
    const val = item[dataKey]?.toString() || 'Unknown';
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  
  const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full min-h-[380px] flex flex-col">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">{title}</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'PIE' ? (
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} fill="#8884d8" paddingAngle={5} stroke="none">
                {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
              />
            </PieChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" fontWeight="bold" />
              <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" fontWeight="bold" />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
