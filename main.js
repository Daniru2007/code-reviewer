const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

// ----- CONFIG -----
const FOLDER_PATH = __dirname; // review files in current folder
const EXTENSION = ".js"; // only JS files

// ----- HELPER FUNCTIONS -----
function getJSFiles(folder) {
    return fs.readdirSync(folder).filter(file => file.endsWith(EXTENSION));
}

function readFile(filePath) {
    return fs.readFileSync(filePath, { encoding: "utf-8" });
}

// ----- RULES -----
function checkVariableName(name, line, file) {
    if (!/^([a-z][a-zA-Z0-9]*)$/.test(name)) {
        console.log(`${file} | Line ${line}: Variable "${name}" is not camelCase`);
    }
}

function checkFunctionName(name, line, file) {
    if (!/^([a-z][a-zA-Z0-9]*)$/.test(name)) {
        console.log(`${file} | Line ${line}: Function "${name}" is not camelCase`);
    }
}

function checkNestingDepth(node, line, file, currentDepth = 0, maxDepth = 3) {
    if (currentDepth > maxDepth) {
        console.log(`${file} | Line ${line}: Nesting depth ${currentDepth} exceeds ${maxDepth}`);
    }
    if (node.body && node.body.body) {
        node.body.body.forEach(child => {
            if (child.type === "BlockStatement" || child.type === "IfStatement") {
                checkNestingDepth(child, child.loc.start.line, file, currentDepth + 1, maxDepth);
            }
        });
    }
}

// ----- MAIN -----
const files = getJSFiles(FOLDER_PATH);

files.forEach(file => {
    const code = readFile(path.join(FOLDER_PATH, file));
    let ast;
    try {
        ast = parser.parse(code, { sourceType: "module" });
    } catch (err) {
        console.log(`${file}: Parsing error - ${err.message}`);
        return;
    }

    console.log(ast);

    traverse(ast, {
        VariableDeclarator(path) {
            const name = path.node.id.name;
            const line = path.node.loc.start.line;
            checkVariableName(name, line, file);
        },
        FunctionDeclaration(path) {
            const name = path.node.id.name;
            const line = path.node.loc.start.line;
            checkFunctionName(name, line, file);
            checkNestingDepth(path.node, line, file);
        }
    });
});

