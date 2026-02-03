import Issue from "../core/issue.js";
import { Rules, ErrorCodes, Severity } from "../core/types.js";
export default function checkUnusedVars(context) {
    for (const decl of context.currentScope.declarations) {
        const name = decl.name ?? decl.id?.name;
        
        const used =[...context.currentScope.references] .some(
            ref => ref.name === name
        );
        if (!used) {
            context.addIssue(new Issue({
                rule: Rules.UNUSED,
                code: ErrorCodes.UNUSED_VAR,
                node: decl,
                severity: Severity.WARNING
            }))
        }
    }
}