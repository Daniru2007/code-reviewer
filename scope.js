class Scope{
    constructor(parent = null){
        this.parent = parent;
        this.declarations = new Set();
        this.references = new Set();
    };
}

export class AnalyzerContext{
    constructor(){
        this.globalScope = new Scope();
        this.currentScope = this.globalScope;
    }

    enterScope(){
        currentScope = new Scope(currentScope);
    }

    exitScope(){
        // for (const decl of currentScope.declarations){
        //     if(!currentScope.references.has(decl)){
        //         console.log(`Warning: "${decl}" is declared but never used.`);
        //     };
        // };
        if(!currentScope.parent) return;
        for (const ref of currentScope.references){
            currentScope.parent.references.add(ref);
        };
        currentScope = currentScope.parent;
    }

}