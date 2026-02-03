import * as parser from "@babel/parser";

export default function parse(code) {
    return parser.parse(code, {
        sourceType: "module",
        plugins: [],
        locations: true 
    });
}
