import { http } from './http';
import type { DocumentRecord } from './documents';

export type RiskLevel = 'high' | 'medium' | 'low';

export type ContractRisk = {
  id: number | string;
  severity: RiskLevel;
  clause: string;
  explanation: string;
  article?: string;
  safer?: string | null;
  confidence?: number;
};

export type ContractKeyFact = {
  label: string;
  value: string;
  risk: boolean;
};

export type ContractTimeline = {
  date: string;
  label: string;
  type: string;
  urgent?: boolean;
};

export type ContractSideBySide = {
  original: string;
  simplified: string;
  risk: RiskLevel;
};

export type RiskBreakdown = {
  subject: string;
  score: number;
};

export type FinancialRisk = {
  label: string;
  value: string;
  note: string;
  risk: boolean;
};

export type ContractAnalysis = {
  documentId?: string;
  fileName?: string;
  docType?: string;
  summary?: string;
  riskScore?: number;
  aiConfidence?: number;
  warnings?: string[];
  suggestedActions?: string[];
  keyFacts?: ContractKeyFact[];
  risks?: ContractRisk[];
  timeline?: ContractTimeline[];
  sideBySide?: ContractSideBySide[];
  riskBreakdown?: RiskBreakdown[];
  financialRisks?: FinancialRisk[];
  generatedAt?: string;
};

export type AnalyzeContractPayload = {
  documentId: string;
  language?: string;
  refresh?: boolean;
};

export const analyzeContractRequest = async (payload: AnalyzeContractPayload) => {
  const { data } = await http.post<{ analysis: ContractAnalysis; document: DocumentRecord }>(
    '/contracts/analyze',
    payload
  );
  return data;
};

export const getContractAnalysisRequest = async (documentId: string) => {
  const { data } = await http.get<{ analysis: ContractAnalysis; document: DocumentRecord }>(
    `/contracts/${documentId}`
  );
  return data;
};
