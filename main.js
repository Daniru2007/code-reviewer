import parse from "./parse.js";
import analyze from "./analyzer.js";
import readSource from "./reader.js";


function main(){
 const code = readSource("./example.js")
 const ast = parse(code);
 let context = analyze(ast);
}

main();