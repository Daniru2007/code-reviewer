function checkShadows(id, scope){
    if (!scope.parent) return false;
    if (scope.parent.declarations.has(id)){
        return true;
    };
    return checkShadows(id, scope.parent);
}