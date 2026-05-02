import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeBranchBrief, normalizeQualityGate } from "../src/artifacts.js";

void describe("artifact normalization", () => {
  void it("normalizes branchbrief aliases", () => {
    const artifact = normalizeBranchBrief({ title: "T", description: "S", tests: ["npm test"], follow_ups: ["later"] }, "branchbrief.json");
    assert.equal(artifact.title, "T");
    assert.equal(artifact.summary, "S");
    assert.deepEqual(artifact.testing, ["npm test"]);
    assert.deepEqual(artifact.followUps, ["later"]);
  });

  void it("normalizes qualitygate checks", () => {
    const artifact = normalizeQualityGate({ result: "pass", checks: [{ label: "build", result: "pass" }] }, "qualitygate.json");
    assert.equal(artifact.status, "pass");
    assert.equal(artifact.checks?.[0]?.name, "build");
    assert.equal(artifact.checks?.[0]?.status, "pass");
  });
});
