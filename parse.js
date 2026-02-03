import * as parser from "@babel/parser";

export default function parse(code){
    readFile("./example.js");
    return parser.parse(code);
}
