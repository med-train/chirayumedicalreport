import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  sex: text("sex").notNull(),
  mobile: text("mobile"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testTemplates = pgTable("test_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  testItems: jsonb("test_items").$type<Array<{
    testRow: string;
    antigen: string;
    whealDiameter: string;
    isPositive?: boolean;
  }>>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  testName: text("test_name").notNull(),
  testItems: jsonb("test_items").$type<Array<{
    testRow: string;
    antigen: string;
    whealDiameter: string;
    isPositive: boolean;
  }>>().notNull(),
  resultsText: text("results_text"),
  timeIn: text("time_in"),
  timeOut: text("time_out"),
  diagnosis: text("diagnosis"),
  createdAt: timestamp("created_at").defaultNow(),
});


export const patientsRelations = relations(patients, ({ many }) => ({
  reports: many(reports),
}));

export const doctorsRelations = relations(doctors, ({ many }) => ({
  reports: many(reports),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  patient: one(patients, {
    fields: [reports.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [reports.doctorId],
    references: [doctors.id],
  }),
}));

// Insert schemas
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
  createdAt: true,
});

export const insertTestTemplateSchema = createInsertSchema(testTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

// Types
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type TestTemplate = typeof testTemplates.$inferSelect;
export type InsertTestTemplate = z.infer<typeof insertTestTemplateSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type TestItem = {
  testRow: string;
  antigen: string;
  whealDiameter: string;
  isPositive: boolean;
};

export type ReportWithRelations = Report & {
  patient: Patient;
  doctor: Doctor;
};
