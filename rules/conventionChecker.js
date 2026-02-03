import Issue from "../core/issue.js";
import { ErrorCodes, Kinds, Rules, Severity } from "../core/types.js";
function checkCamelCase(name) {
    return /^([a-z][a-zA-Z0-9]*)$/.test(name);
}

function checkPascalCase(name) {
    return /^([A-Z][a-zA-Z0-9]*)$/.test(name);
}

function checkScreamingSnakeCase(name) {
    return /^([A-Z][A-Z0-9_]*)$/.test(name);
}
export default function NamingConventionChecker(type, node) {
    /*
        Const -> SCREAMING_SNAKE_CASE
        Variables -> camelCase
        Functions -> camelCase
        Classes -> PascalCase
    */

    const name = node.name ?? node.id?.name;
    const loc = node.loc ?? node.id?.loc;
    switch (type) {
        case Kinds.VARIABLE:
        case Kinds.PARAMETER:
        case Kinds.FUNCTION:
            if (!checkCamelCase(name)) {
                return new Issue(Rules.NAMING, ErrorCodes.NAMING_CAMEL, node, Severity.WARNING);
            }
            break;
        case Kinds.CLASS:
            if (!checkPascalCase(name)) {
                return new Issue(Rules.NAMING, ErrorCodes.NAMING_PASCAL, node, Severity.WARNING);
            }
            break;
        case Kinds.CONST:
            if (!checkScreamingSnakeCase(name)) {
                return new Issue(Rules.NAMING, ErrorCodes.NAMING_SCREAMING, node, Severity.WARNING);
            }
            break;
    }
}
