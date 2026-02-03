import fs from 'fs';
export default function readSource(fileName){
    const code = fs.readFileSync(fileName, 'utf8');
    return code;
}