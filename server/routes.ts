import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPatientSchema, 
  insertDoctorSchema, 
  insertTestTemplateSchema, 
  insertReportSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Patient routes
  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.get("/api/patients/mobile/:mobile", async (req, res) => {
    try {
      const patient = await storage.getPatientByMobile(req.params.mobile);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  // Doctor routes
  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const doctor = await storage.getDoctor(req.params.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctor" });
    }
  });

  app.get("/api/doctors/name/:name", async (req, res) => {
    try {
      const doctor = await storage.getDoctorByName(decodeURIComponent(req.params.name));
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctor" });
    }
  });

  app.post("/api/doctors", async (req, res) => {
    try {
      const validatedData = insertDoctorSchema.parse(req.body);
      const doctor = await storage.createDoctor(validatedData);
      res.status(201).json(doctor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid doctor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create doctor" });
    }
  });

  // Test template routes
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTestTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTestTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.get("/api/templates/name/:name", async (req, res) => {
    try {
      const template = await storage.getTestTemplateByName(decodeURIComponent(req.params.name));
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", async (req, res) => {
  try {
    const validatedData = insertTestTemplateSchema.parse(req.body);
    const template = await storage.createTestTemplate(validatedData);
    res.status(201).json(template);
  } catch (error) {
    console.error("Error creating template:", error);  // 👈 add this
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid template data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create template" });
  }
});


  app.put("/api/templates/:id", async (req, res) => {
    try {
      const validatedData = insertTestTemplateSchema.partial().parse(req.body);
      const template = await storage.updateTestTemplate(req.params.id, validatedData);
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      await storage.deleteTestTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Report routes
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.get("/api/reports/patient/:patientId", async (req, res) => {
    try {
      const reports = await storage.getReportsByPatientId(req.params.patientId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient reports" });
    }
  });

  app.get("/api/reports/mobile/:mobile", async (req, res) => {
    try {
      const reports = await storage.getReportsByMobile(req.params.mobile);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports by mobile" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
