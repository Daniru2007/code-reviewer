import Issue from "./issue.js";
import { Rules, ErrorCodes, Severity } from "../core/types.js";

class Scope {
    constructor(parent = null) {
        this.parent = parent;
        this.declarations = new Set();
        this.references = new Set();
    };
}

export default class AnalyzerContext {
    constructor() {
        this.globalScope = new Scope();
        this.currentScope = this.globalScope;
        this.issues = [];
        this.depth = 0;
        this.MAX_DEPTH = 5;
    }

    addIssue(issue) {
        this.issues.push(issue);
    }

    addDeclaration(node) {
        this.currentScope.declarations.add(node);
    }

    addReference(node) {
        this.currentScope.references.add(node);
    }

    enterScope() {
        this.currentScope = new Scope(this.currentScope);
        this.depth++;
        if (this.depth == this.MAX_DEPTH) {
            return new Issue({
                    rule: Rules.DEPTH_EXCEED,
                    code: ErrorCodes.DEP_EXC,
                    node: null,
                    severity: Severity.WARNING
                });
        }
        return null;
    }

    exitScope() {
        if (!this.currentScope.parent) return;
        for (const ref of this.currentScope.references) {
            this.currentScope.parent.references.add(ref);
        };
        this.currentScope = this.currentScope.parent;
        this.depth--;
    }

}