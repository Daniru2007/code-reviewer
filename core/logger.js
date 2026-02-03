import fs from "fs";
import path from "path";

// Load all messages from JSON
const messages = JSON.parse(fs.readFileSync(path.resolve("./messages.json"), "utf8"));

/**
 * Simple template formatter
 */
function format(template, data) {
    return template.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? "");
}

/**
 * Logs all issues in a clean format
 * @param {Issue[]} issues - Array of Issue objects
 * @param {string} file - Optional filename
 */
export function logIssues(issues, file = "") {
    for (const issue of issues) {
        // Extract name and kind from node
        const node = issue.node;
        const name = node?.name ?? node?.id?.name ?? "unknown";

        // Get template message from JSON or fallback to generic message
        const template = messages[issue.code] || "Unknown issue: {name}";
        const msg = format(template, { name});

        const loc = issue.location ? `${issue.location.line}:${issue.location.column}` : "";
        const filePrefix = file ? `${file}:` : "";

        console.log(`${filePrefix}${loc} [${issue.severity.toUpperCase()}][${issue.code}] ${msg}`);
    }
}
