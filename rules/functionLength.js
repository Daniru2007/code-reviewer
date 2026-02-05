import Issue from "../core/issue.js";
import { Rules, ErrorCodes, Severity } from "../core/types.js";
export function checkFunctionLength(node) {
    const length = node.loc.end.line - node.loc.start.line + 1;
    if(length>40){
        return new Issue({
                rule: Rules.FUNCTION_LENGTH,
                code: ErrorCodes.FUNC_LEN,
                node: node,
                severity: Severity.WARNING
            })
    }
    return null;
}