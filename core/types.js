// Severity levels
export const Severity = Object.freeze({
  INFO: "info",
  WARNING: "warning",
  ERROR: "error"
});

// Rule identifiers
export const Rules = Object.freeze({
  NAMING: "naming-convention",
  UNUSED: "unused-variable",
  SHADOWING: "shadowing-variable",
  FUNCTION_LENGTH: "function-too-long",
  DEPTH_EXCEED: "maximum-depth-exceeded"
});

// Error / issue codes (optional)
export const ErrorCodes = Object.freeze({
  NAMING_CAMEL: "NC001",
  NAMING_PASCAL: "NC002",
  NAMING_SCREAMING: "NC003",
  UNUSED_VAR: "UV001",
  SHADOW_VAR: "SV001",
  FUNC_LEN: "FL001",
  DEP_EXC: "DPE001"
});

// Semantic kinds for AST nodes
export const Kinds = Object.freeze({
  VARIABLE: "variable",   // var, let
  CONST: "const",
  FUNCTION: "function",
  CLASS: "class",
  PARAMETER: "parameter",
  IMPORT: "import"
});

export const ASTKindMap = {
    var: Kinds.VARIABLE,
    let: Kinds.VARIABLE,
    const: Kinds.CONST
};

