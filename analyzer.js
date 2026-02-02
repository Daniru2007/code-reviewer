import AnalyzerContext from "./scope";
import traverseModule from "@babel/traverse";
const traverse = traverseModule.default;

export default function analyze(ast){
    const context = new AnalyzerContext();
    traverse(ast, {

        Program: {
        },
        VariableDeclaration(path) {
            // TODO fix path.node.declarations[0].id.name for multiple declarations
            let id = path.node.declarations[0].id.name;
        },
        FunctionDeclaration: {
        },
        ClassDeclaration(path) {
        },
        Identifier(path) {
        }
    });

    return context;
}