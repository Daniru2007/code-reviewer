import fs from "fs";
import path from "path";

const messages = JSON.parse(fs.readFileSync(path.resolve("./messages.json"), "utf8"));
function format(template, data) {
    return template.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? "");
}

export function logIssues(issues, file = "") {
    for (const issue of issues) {
        const node = issue.node;
        const name = node?.name ?? node?.id?.name ?? "unknown";

        const template = messages[issue.code] || "Unknown issue: {name}";
        const msg = format(template, { name});

        const loc = issue.location ? `${issue.location.line}:${issue.location.column}` : "";
        const filePrefix = file ? `${file}:` : "";

        console.log(`${filePrefix}${loc} [${issue.severity.toUpperCase()}][${issue.code}] ${msg}`);
    }
}
