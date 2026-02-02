import parse from "./parse.js";
import analyze from "./analyzer.js";


function main(){
 let ast = parse();
 let context = analyze(ast);
}

main();