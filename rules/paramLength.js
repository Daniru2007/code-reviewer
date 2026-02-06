import Issue from "../core/issue.js";
import { Rules, ErrorCodes, Severity } from "../core/types.js";

export function checkParamLength(node) {
    if (node.params.length > 5) {
        return new Issue({
            rule: Rules.MAX_PARAM,
            code: ErrorCodes.MAX_P,
            node: node,
            severity: Severity.WARNING
        })
    }
}