import { Request, Response, NextFunction } from "express";
import { Incident, IncidentPriority } from "../models/Incident";
import { fireAlert } from "../lib/alerts";
import { logger } from "../lib/logger";

// ─── Create Incident ──────────────────────────────────────────────────────────
export const createIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, priority, category, affectedServices, tenantId } = req.body;

    const incidentId = `INC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const incident = await Incident.create({
      incidentId,
      title,
      description,
      priority,
      category,
      affectedServices,
      tenantId: tenantId || null,
      timeline: [{ action: "Incident created", note: description, actor: req.user?._id?.toString() || "system" }],
    });

    // Automatically fire high-priority alerts
    if (priority === "P1" || priority === "P2") {
      await fireAlert({
        title: `[${priority}] ${title}`,
        message: description,
        severity: "critical",
        metadata: { incidentId, category, affectedServices },
      });
      incident.alertsSent.telegram = true;
      incident.alertsSent.email = true;
      await incident.save();
    }

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
};

// ─── Update Incident Status ───────────────────────────────────────────────────
export const updateIncidentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, note, rootCause, preventionMeasures } = req.body;

    const incident = await Incident.findOne({ incidentId: id });
    if (!incident) {
      return res.status(404).json({ success: false, error: "Incident not found" });
    }

    incident.status = status;
    incident.timeline.push({
      action: `Status changed to ${status}`,
      note,
      actor: req.user?._id?.toString(),
    });

    if (status === "acknowledged" && !incident.acknowledgedAt) incident.acknowledgedAt = new Date();
    if (status === "mitigated") incident.mitigatedAt = new Date();
    if (status === "resolved") {
      incident.resolvedAt = new Date();
      if (rootCause) incident.rootCause = rootCause;
      if (preventionMeasures) incident.preventionMeasures = preventionMeasures;
    }

    await incident.save();

    logger.info("Incident status updated", { incidentId: id, status, updatedBy: req.user?._id });

    // Notify resolution for P1/P2
    if (status === "resolved" && (incident.priority === "P1" || incident.priority === "P2")) {
      await fireAlert({
        title: `[RESOLVED] ${incident.title}`,
        message: note || "Incident has been resolved.",
        severity: "info",
        metadata: { incidentId: id, duration: `${Math.round((Date.now() - incident.detectedAt.getTime()) / 60000)} minutes` },
      });
    }

    res.json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Incidents (Filtered) ─────────────────────────────────────────────
export const getIncidents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, priority, category } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const incidents = await Incident.find(filter).sort({ detectedAt: -1 }).lean();
    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    next(error);
  }
};
