
import { ApiAnalysisResult, ApiFieldMetadata } from '../types';

export const analyzeApiResponse = (data: any): ApiAnalysisResult => {
  const structure = Array.isArray(data) ? 'array' : 'object';
  const sample = structure === 'array' ? data[0] : data;
  
  if (!sample || typeof sample !== 'object') {
    return { structure: 'object', fields: [], sampleData: data };
  }

  const fields: ApiFieldMetadata[] = Object.keys(sample).map(key => {
    const val = sample[key];
    const type = Array.isArray(val) ? 'array' : typeof val as any;
    
    // Pattern detection
    const lowerKey = key.toLowerCase();
    const isId = lowerKey.includes('id');
    const isStatus = ['status', 'role', 'type', 'category', 'state'].some(k => lowerKey.includes(k));
    const isCurrency = ['price', 'amount', 'cost', 'revenue', 'budget', 'total'].some(k => lowerKey.includes(k)) && type === 'number';
    const isDate = !isNaN(Date.parse(val)) && (typeof val === 'string' && (val.includes('-') || val.includes(':')));

    return {
      key,
      label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      type: isDate ? 'date' : type,
      isId,
      isStatus,
      isCurrency
    };
  });

  return { structure, fields, sampleData: data };
};
