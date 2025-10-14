import type { TestItem, ReportWithRelations, TestTemplate, Patient, Doctor } from "@shared/schema";

export interface FormData {
  patientName: string;
  age: number | null;
  sex: string;
  doctorName: string;
  mobile: string;
  testName: string;
  testItems: TestItem[];
}

export interface TestItemFormData {
  testRow: string;
  antigen: string;
  whealDiameter: string;
  isPositive: boolean;
}

export { type TestItem, type ReportWithRelations, type TestTemplate, type Patient, type Doctor };
