import * as parser from "@babel/parser";
import fs from 'fs';

function reader(file){
    const code = fs.readFileSync(file, 'utf8');
    console.log(code)
    return code;
}

export default function parse(){
    reader("./example.js");
    const ast = parser.parse(code);
    return ast;
}
