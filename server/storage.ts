import { 
  patients, 
  doctors, 
  testTemplates, 
  reports,
  type Patient, 
  type InsertPatient,
  type Doctor,
  type InsertDoctor,
  type TestTemplate,
  type InsertTestTemplate,
  type Report,
  type InsertReport,
  type ReportWithRelations
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Patients
  getPatient(id: string): Promise<Patient | undefined>;
  getPatientByMobile(mobile: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  
  // Doctors
  getDoctor(id: string): Promise<Doctor | undefined>;
  getDoctorByName(name: string): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  
  // Test Templates
  getTestTemplate(id: string): Promise<TestTemplate | undefined>;
  getTestTemplateByName(name: string): Promise<TestTemplate | undefined>;
  getAllTestTemplates(): Promise<TestTemplate[]>;
  createTestTemplate(template: InsertTestTemplate): Promise<TestTemplate>;
  updateTestTemplate(id: string, template: Partial<InsertTestTemplate>): Promise<TestTemplate>;
  deleteTestTemplate(id: string): Promise<void>;
  
  // Reports
  getReport(id: string): Promise<ReportWithRelations | undefined>;
  getReportsByPatientId(patientId: string): Promise<ReportWithRelations[]>;
  getReportsByMobile(mobile: string): Promise<ReportWithRelations[]>;
  createReport(report: InsertReport): Promise<Report>;
  getAllReports(): Promise<ReportWithRelations[]>;
}

export class DatabaseStorage implements IStorage {
  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatientByMobile(mobile: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.mobile, mobile));
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(insertPatient)
      .returning();
    return patient;
  }

  async getDoctor(id: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor || undefined;
  }

  async getDoctorByName(name: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.name, name));
    return doctor || undefined;
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const [doctor] = await db
      .insert(doctors)
      .values(insertDoctor)
      .returning();
    return doctor;
  }

  async getTestTemplate(id: string): Promise<TestTemplate | undefined> {
    const [template] = await db.select().from(testTemplates).where(eq(testTemplates.id, id));
    return template || undefined;
  }

  async getTestTemplateByName(name: string): Promise<TestTemplate | undefined> {
    const [template] = await db.select().from(testTemplates).where(eq(testTemplates.name, name));
    return template || undefined;
  }

  async getAllTestTemplates(): Promise<TestTemplate[]> {
    return await db.select().from(testTemplates).orderBy(desc(testTemplates.createdAt));
  }

  async createTestTemplate(insertTemplate: InsertTestTemplate): Promise<TestTemplate> {
    const [template] = await db
      .insert(testTemplates)
      .values({
        name: insertTemplate.name,
        testItems: insertTemplate.testItems
      })
      .returning();
    return template;
  }

  async updateTestTemplate(id: string, insertTemplate: Partial<InsertTestTemplate>): Promise<TestTemplate> {
    const updateData: any = {};
    if (insertTemplate.name !== undefined) updateData.name = insertTemplate.name;
    if (insertTemplate.testItems !== undefined) updateData.testItems = insertTemplate.testItems;
    
    const [template] = await db
      .update(testTemplates)
      .set(updateData)
      .where(eq(testTemplates.id, id))
      .returning();
    return template;
  }

  async deleteTestTemplate(id: string): Promise<void> {
    await db.delete(testTemplates).where(eq(testTemplates.id, id));
  }

  async getReport(id: string): Promise<ReportWithRelations | undefined> {
    const [report] = await db
      .select()
      .from(reports)
      .leftJoin(patients, eq(reports.patientId, patients.id))
      .leftJoin(doctors, eq(reports.doctorId, doctors.id))
      .where(eq(reports.id, id));

    if (!report || !report.patients || !report.doctors) {
      return undefined;
    }

    return {
      ...report.reports,
      patient: report.patients,
      doctor: report.doctors,
    };
  }

  async getReportsByPatientId(patientId: string): Promise<ReportWithRelations[]> {
    const reportResults = await db
      .select()
      .from(reports)
      .leftJoin(patients, eq(reports.patientId, patients.id))
      .leftJoin(doctors, eq(reports.doctorId, doctors.id))
      .where(eq(reports.patientId, patientId))
      .orderBy(desc(reports.createdAt));

    return reportResults
      .filter(result => result.patients && result.doctors)
      .map(result => ({
        ...result.reports,
        patient: result.patients!,
        doctor: result.doctors!,
      }));
  }

  async getReportsByMobile(mobile: string): Promise<ReportWithRelations[]> {
    const reportResults = await db
      .select()
      .from(reports)
      .leftJoin(patients, eq(reports.patientId, patients.id))
      .leftJoin(doctors, eq(reports.doctorId, doctors.id))
      .where(eq(patients.mobile, mobile))
      .orderBy(desc(reports.createdAt));

    return reportResults
      .filter(result => result.patients && result.doctors)
      .map(result => ({
        ...result.reports,
        patient: result.patients!,
        doctor: result.doctors!,
      }));
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
  const [report] = await db
    .insert(reports)
    .values({
      patientId: insertReport.patientId,
      doctorId: insertReport.doctorId,
      testName: insertReport.testName,
      testItems: insertReport.testItems,
      resultsText: insertReport.resultsText,
      timeIn: insertReport.timeIn,
      timeOut: insertReport.timeOut,
      diagnosis: insertReport.diagnosis,
    })
    .returning();
  return report;
}


  async getAllReports(): Promise<ReportWithRelations[]> {
    const reportResults = await db
      .select()
      .from(reports)
      .leftJoin(patients, eq(reports.patientId, patients.id))
      .leftJoin(doctors, eq(reports.doctorId, doctors.id))
      .orderBy(desc(reports.createdAt));

    return reportResults
      .filter(result => result.patients && result.doctors)
      .map(result => ({
        ...result.reports,
        patient: result.patients!,
        doctor: result.doctors!,
      }));
  }
}

export const storage = new DatabaseStorage();
