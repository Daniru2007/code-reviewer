class Scope{
    constructor(parent = null){
        this.parent = parent;
        this.declarations = new Set();
        this.references = new Set();
    };
}

export default class AnalyzerContext{
    constructor(){
        this.globalScope = new Scope();
        this.currentScope = this.globalScope;
        this.issues = [];
    }

    enterScope(){
        this.currentScope = new Scope(this.currentScope);
    }

    exitScope(){
        // for (const decl of currentScope.declarations){
        //     if(!currentScope.references.has(decl)){
        //         console.log(`Warning: "${decl}" is declared but never used.`);
        //     };
        // };
        if(!this.currentScope.parent) return;
        for (const ref of this.currentScope.references){
            this.currentScope.parent.references.add(ref);
        };
        this.currentScope = this.currentScope.parent;
    }

}