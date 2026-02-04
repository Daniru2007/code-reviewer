import AnalyzerContext from "./scope.js";
import traverseModule from "@babel/traverse";
import NamingConventionChecker from "../rules/conventionChecker.js"
import { Kinds, ASTKindMap } from "./types.js";
import checkUnusedVars from "../rules/unusedVar.js";
import checkShadows from "../rules/shadowChecker.js";
const traverse = traverseModule.default;

function extractIdentifiers(param) {
    const identifiers = [];

    if (param.type === "Identifier") {
        identifiers.push(param);
    } else if (param.type === "AssignmentPattern") {
        identifiers.push(...extractIdentifiers(param.left));
    } else if (param.type === "ObjectPattern") {
        for (const prop of param.properties) {
            if (prop.value) {
                identifiers.push(...extractIdentifiers(prop.value));
            }
        }
    } else if (param.type === "ArrayPattern") {
        for (const elem of param.elements) {
            if (elem) identifiers.push(...extractIdentifiers(elem));
        }
    }

    return identifiers;
}


export default function analyze(ast) {
    const context = new AnalyzerContext();
    traverse(ast, {
        Program: {
            enter() { context.enterScope(); },
            exit() {
                checkUnusedVars(context);
                context.exitScope();
            }
        },
        VariableDeclaration(path) {
            for (const node of path.node.declarations) {
                const issue = NamingConventionChecker(ASTKindMap[path.node.kind], node);
                if (issue) {
                    context.addIssue(issue);
                }
                const shadowed = checkShadows(node, context.currentScope)
                if (shadowed) {
                    context.addIssue(shadowed);
                };
                context.addDeclaration(node);
            }
        },
        FunctionDeclaration: {
            enter(path) {
                const issue = NamingConventionChecker(Kinds.FUNCTION, path.node);
                if (issue) {
                    context.addIssue(issue);
                }
                context.addDeclaration(path.node);
                for (const param of path.node.params) {
                    const ids = extractIdentifiers(param);
                    for (const id of ids) {
                        const issue = NamingConventionChecker(Kinds.PARAMETER, id);
                        if (issue) context.addIssue(issue);
                        context.addDeclaration(id);
                    }
                }
                context.enterScope();
            },
            exit() {
                checkUnusedVars(context);
                context.exitScope();
            }
        },
        ClassDeclaration(path) {
            const issue = NamingConventionChecker(Kinds.CLASS, path.node);
            if (issue) {
                context.addIssue(issue);
            }
            context.addDeclaration(path.node);
        },
        Identifier(path) {
            if (
                path.parent.type !== "VariableDeclarator" &&
                path.parent.type !== "FunctionDeclaration"
            ) {
                context.addReference(path.node);
            }
        }
    });

    return context;
}