import parse from "./core/parse.js";
import analyze from "./core/analyzer.js";
import readSource from "./core/reader.js";


function main(){
 const code = readSource("./example.js")
 const ast = parse(code);
 let context = analyze(ast);
}

main();