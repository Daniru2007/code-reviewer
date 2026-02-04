import Issue from "../core/issue.js";
import { ErrorCodes, Rules, Severity } from "../core/types.js";
export default function checkShadows(node, scope) {
    if (!scope.parent) return null;

    const name = node.id.name;

    const used = [...scope.parent.declarations].some(
        decl => (decl.name ?? decl.id?.name) === name
    );
    if (used) {
        return new Issue({
            rule: Rules.SHADOWING,
            code: ErrorCodes.SHADOW_VAR,
            node: node,
            severity: Severity.WARNING
        });
    };
    return checkShadows(node, scope.parent);
}