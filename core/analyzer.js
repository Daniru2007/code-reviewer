import AnalyzerContext from "./scope.js";
import traverseModule from "@babel/traverse";
import NamingConventionChecker from "../rules/conventionChecker.js"
import { Kinds, ASTKindMap } from "./types.js";
const traverse = traverseModule.default;

export default function analyze(ast) {
    const context = new AnalyzerContext();
    traverse(ast, {
        Program: {
            enter() { context.enterScope(); },
            exit() { context.exitScope(); }
        },
        VariableDeclaration(path) {
            for (const node of path.node.declarations) {
                const issue = NamingConventionChecker(ASTKindMap[path.node.kind], node);
                if (issue) {
                    context.addIssue(issue);
                }
            }
        },
        FunctionDeclaration: {
            enter(path) {
                const issue = NamingConventionChecker(Kinds.FUNCTION, path.node);
                if (issue) {
                    context.addIssue(issue);
                }
                for (const param of path.node.params) {
                    const issue = NamingConventionChecker(Kinds.PARAMETER, param);
                    if (issue) {
                        context.addIssue(issue);
                    }
                }
                context.enterScope();
            },
            exit() { context.exitScope(); }
        },
        ClassDeclaration(path) {
            const issue = NamingConventionChecker(Kinds.CLASS, path.node);
            if (issue) {
                context.addIssue(issue);
            }
        },
        Identifier(path) {
        }
    });

    return context;
}