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

    addIssue(issue){
        this.issues.push(issue);
    }

    addDeclaration(node){
        this.currentScope.declarations.add(node);
    }

    addReference(node){
        this.currentScope.references.add(node);
    }

    enterScope(){
        this.currentScope = new Scope(this.currentScope);
    }

    exitScope(){
        if(!this.currentScope.parent) return;
        for (const ref of this.currentScope.references){
            this.currentScope.parent.references.add(ref);
        };
        this.currentScope = this.currentScope.parent;
    }

}