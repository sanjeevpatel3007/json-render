
import { GoogleGenAI, Type } from "@google/genai";
import { DashboardSchema, ApiAnalysisResult } from "../types";

export const enhanceSchemaWithAI = async (analysis: ApiAnalysisResult, baseSchema: DashboardSchema): Promise<DashboardSchema> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze this API response analysis and improve the UI dashboard schema.
        Data Sample (truncated): ${JSON.stringify(Array.isArray(analysis.sampleData) ? analysis.sampleData.slice(0, 2) : analysis.sampleData)}
        
        CRITICAL: 
        1. For "TABLE" components, every item in "columns" MUST have a valid "accessorKey" that matches a key in the Data Sample.
        2. Component "type" should be one of: "STAT", "TABLE", "CHART", "DETAILS".
        3. Make the dashboard professional with meaningful titles.
        
        Current Base Schema: ${JSON.stringify(baseSchema)}
        
        Return ONLY a JSON object that matches the DashboardSchema interface.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            layout: { type: Type.STRING },
            sidebar: { 
              type: Type.ARRAY, 
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  icon: { type: Type.STRING }
                },
                required: ["id", "title"]
              }
            },
            pages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  components: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        props: { 
                          type: Type.OBJECT,
                          properties: {
                            field: { type: Type.STRING },
                            aggregate: { type: Type.STRING },
                            isCurrency: { type: Type.BOOLEAN },
                            chartType: { type: Type.STRING },
                            dataKey: { type: Type.STRING },
                            columns: {
                              type: Type.ARRAY,
                              items: {
                                type: Type.OBJECT,
                                properties: {
                                  header: { type: Type.STRING },
                                  accessorKey: { type: Type.STRING },
                                  type: { type: Type.STRING }
                                },
                                required: ["header", "accessorKey"]
                              }
                            },
                            fields: {
                              type: Type.ARRAY,
                              items: {
                                type: Type.OBJECT,
                                properties: {
                                  key: { type: Type.STRING },
                                  label: { type: Type.STRING },
                                  type: { type: Type.STRING }
                                },
                                required: ["key", "label"]
                              }
                            }
                          }
                        }
                      },
                      required: ["id", "type", "title", "props"]
                    }
                  }
                },
                required: ["id", "title", "components"]
              }
            }
          },
          required: ["layout", "sidebar", "pages"]
        }
      }
    });

    if (response.text) {
      try {
        return JSON.parse(response.text);
      } catch (e) {
        console.error("AI response parse error", e);
        return baseSchema;
      }
    }
    return baseSchema;
  } catch (error) {
    console.error("AI Schema Enhancement failed:", error);
    return baseSchema;
  }
};
