import * as parser from "@babel/parser";
import traverseModule from "@babel/traverse";
const traverse = traverseModule.default;
import fs from 'fs';

// check
class Scope{
    constructor(parent = null){
        this.parent = parent;
        this.declarations = new Set();
        this.references = new Set();
    };
}

let currentScope = null;

function enterScope(){
    currentScope = new Scope(currentScope);
}
function exitScope(){
    for (const decl of currentScope.declarations){
        if(!currentScope.references.has(decl)){
            console.log(`Warning: "${decl}" is declared but never used.`);
        };
    };
    if(!currentScope.parent) return;
    for (const ref of currentScope.references){
        currentScope.parent.references.add(ref);
    };
    currentScope = currentScope.parent;
}

function checkShadows(id, scope = currentScope){
    if (!scope.parent) return false;
    if (scope.parent.declarations.has(id)){
        return true;
    };
    return checkShadows(id, scope.parent);
}

const code = fs.readFileSync('./example.js', 'utf8');

function NamingConventionChecker(name, type){
    /*
        Const -> SCREAMING_SNAKE_CASE
        Variables -> camelCase
        Functions -> camelCase
        Classes -> PascalCase
    */

    console.log(`[${type}:${name}]`);
    switch(type){
        case 'var':
        case 'let':
        case 'function':
            if(!/^([a-z][a-zA-Z0-9]*)$/.test(name)){
                console.log(`    -> ${type} "${name}" is not camelCase`);
            }
            break;
        case 'class':
            if(!/^([A-Z][a-zA-Z0-9]*)$/.test(name)){
                console.log(`    -> ${type} "${name}" is not PascalCase`);
            }
            break;
        case 'const':
            if(!/^([A-Z][A-Z0-9_]*)$/.test(name)){
                console.log(`    -> ${type} "${name}" is not SCREAMING_SNAKE_CASE`);
            }
            break;
    }
}

const ast = parser.parse(code);

traverse(ast, {
    Program: {
        enter() { enterScope(); },
        exit() { exitScope(); }
    },
    VariableDeclaration(path) {
        // TODO fix path.node.declarations[0].id.name for multiple declarations
        let id = path.node.declarations[0].id.name;
        NamingConventionChecker(id, path.node.kind);
        currentScope.declarations.add(id);
        if(checkShadows(id)){
            console.log(`    -> Warning: "${id}" shadows a variable in an outer scope.`);
        }
    },
    FunctionDeclaration: {
        enter(path) {
            NamingConventionChecker(path.node.id.name, 'function');
            currentScope.declarations.add(path.node.id.name);
            enterScope();
        },
        exit() { exitScope(); }
    },
    ClassDeclaration(path) {
        NamingConventionChecker(path.node.id.name, 'class');
    },
    Identifier(path) {
        if (
            path.parent.type !== "VariableDeclarator" &&
            path.parent.type !== "FunctionDeclaration"
        ) {
            currentScope.references.add(path.node.name);
        }
    }
});
