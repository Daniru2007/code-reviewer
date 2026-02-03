import parse from "./core/parse.js";
import analyze from "./core/analyzer.js";
import readSource from "./core/reader.js";
import { logIssues } from "./core/logger.js";


function main(){
 const code = readSource("./example.js")
 const ast = parse(code);
 let context = analyze(ast);
 logIssues(context.issues);
}

main();