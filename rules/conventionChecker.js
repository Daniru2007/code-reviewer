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
