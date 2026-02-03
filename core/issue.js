import { Severity } from "./types.js";
export default class Issue {
    constructor({ rule, code, node = null, severity = Severity.WARNING}) {
        this.rule = rule;           // "naming", "unused", "shadowing"
        this.code = code;
        this.node = node;           // AST node (for location)
        this.severity = severity;   // "info" | "warning" | "error"
    }

    get location() {
        if (!this.node || !this.node.loc) return null;
        return {
            line: this.node.loc.start.line,
            column: this.node.loc.start.column
        };
    }
}
