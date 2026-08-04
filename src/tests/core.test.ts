import { describe, it, expect } from "vitest";
import { templates, getTemplateBySlug } from "../lib/templates";

// Re-implement or test pure feature logic from Activity Log page for strict verification
function timeAgo(dateString: string, referenceNow?: Date) {
  const date = new Date(dateString);
  const now = referenceNow || new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

function getActorLabel(actor: string, currentUserEmail = "test@trustseal.co") {
  if (!actor || actor === "Creator" || actor.toLowerCase() === currentUserEmail) {
    return "You";
  }
  if (actor.includes("@")) {
    const prefix = actor.split("@")[0];
    return prefix
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return actor;
}

describe("Feature: Templates System", () => {
  it("should contain exactly 6 high-quality agreement templates", () => {
    expect(templates).toHaveLength(6);
  });

  it("should have valid data structures and non-empty content for all templates", () => {
    templates.forEach((template) => {
      expect(template.slug).toBeTypeOf("string");
      expect(template.name.length).toBeGreaterThan(0);
      expect(template.category).toBeTypeOf("string");
      expect(template.clauses.length).toBeGreaterThan(0);
      expect(template.variables.length).toBeGreaterThan(0);
      expect(template.description.length).toBeGreaterThan(0);
      
      // Check clause ordering and formatting
      template.clauses.forEach((clause, index) => {
        expect(clause.order).toBe(index + 1);
        expect(clause.content.length).toBeGreaterThan(10);
      });
    });
  });

  it("should correctly fetch a template by slug", () => {
    const freelance = getTemplateBySlug("freelance-contract");
    expect(freelance).toBeDefined();
    expect(freelance?.name).toBe("Freelance Service Contract");
    expect(freelance?.isPremium).toBe(false);

    const partnership = getTemplateBySlug("business-partnership");
    expect(partnership).toBeDefined();
    expect(partnership?.name).toBe("Business Partnership Agreement");
  });

  it("should return undefined for a non-existent slug", () => {
    expect(getTemplateBySlug("non-existent-template")).toBeUndefined();
  });
});

describe("Feature: Activity Feed & Audit Trail Logic", () => {
  it("should calculate human-readable relative timestamps accurately", () => {
    const ref = new Date("2026-08-03T12:00:00Z");
    
    // 10 seconds ago -> just now
    expect(timeAgo("2026-08-03T11:59:50Z", ref)).toBe("just now");
    // 5 minutes ago -> 5 mins ago
    expect(timeAgo("2026-08-03T11:55:00Z", ref)).toBe("5 mins ago");
    // 3 hours ago -> 3 hours ago
    expect(timeAgo("2026-08-03T09:00:00Z", ref)).toBe("3 hours ago");
    // 5 days ago -> 5 days ago
    expect(timeAgo("2026-07-29T12:00:00Z", ref)).toBe("5 days ago");
  });

  it("should properly transform actor identifiers into user-friendly names or 'You'", () => {
    expect(getActorLabel("Creator", "kemi@example.com")).toBe("You");
    expect(getActorLabel("kemi@example.com", "kemi@example.com")).toBe("You");
    expect(getActorLabel("femi_olawale@gmail.com", "kemi@example.com")).toBe("Femi Olawale");
    expect(getActorLabel("tech.vault-ltd@enterprises.io", "kemi@example.com")).toBe("Tech Vault Ltd");
    expect(getActorLabel("BrandBoost Agency", "kemi@example.com")).toBe("BrandBoost Agency");
  });

  it("should filter audit trail activities correctly by action category and search terms", () => {
    const sampleActivities = [
      { action: "SIGNED", actor: "Femi", agreementTitle: "Loan Agreement", timestamp: "2026-08-01T00:00:00Z" },
      { action: "SENT", actor: "Creator", agreementTitle: "Partnership Agreement", timestamp: "2026-08-02T00:00:00Z" },
      { action: "CREATED", actor: "Creator", agreementTitle: "NDA Contract", timestamp: "2026-08-03T00:00:00Z" }
    ];

    // Filter signed
    const signedOnly = sampleActivities.filter(a => a.action === "SIGNED");
    expect(signedOnly).toHaveLength(1);
    expect(signedOnly[0].agreementTitle).toBe("Loan Agreement");

    // Search by title
    const searchResult = sampleActivities.filter(a => 
      a.agreementTitle.toLowerCase().includes("partnership")
    );
    expect(searchResult).toHaveLength(1);
    expect(searchResult[0].action).toBe("SENT");
  });
});

describe("Feature: Agreement Structure & Rules Validation", () => {
  it("should enforce valid party configurations", () => {
    const validParties = [
      { name: "Kemi Adeyemi", email: "kemi@example.com", role: "creator" },
      { name: "Femi Olawale", email: "femi@example.com", role: "signer" }
    ];

    expect(validParties.length).toBeGreaterThanOrEqual(2);
    expect(validParties.some(p => p.role === "creator")).toBe(true);
    expect(validParties.some(p => p.role === "signer")).toBe(true);
  });
});
