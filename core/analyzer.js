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
                NamingConventionChecker(ASTKindMap[path.node.kind], node);
            }
        },
        FunctionDeclaration: {
            enter(path) { 
                NamingConventionChecker(Kinds.FUNCTION, path.node);
                for (const param of path.node.params){
                    NamingConventionChecker(Kinds.PARAMETER, param);
                }
                context.enterScope(); 
            },
            exit() { context.exitScope(); }
        },
        ClassDeclaration(path) {
            NamingConventionChecker(Kinds.CLASS, path.node);
        },
        Identifier(path) {
        }
    });

    return context;
}