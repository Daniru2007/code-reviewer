const crypto = require("crypto");

function hash(str) {
  return crypto.createHash("sha1").update(str).digest("hex");
}

function getNodeSignature(node) {
  const type = node.type || "Unknown";

  if (type === "Identifier") return `Identifier:${node.name}`;
  if (type === "NumericLiteral") return `NumericLiteral:${node.value}`;
  if (type === "StringLiteral") return `StringLiteral:${node.value}`;
  if (type === "BinaryExpression") return `BIN:${node.operator}`;
  if (type === "FunctionDeclaration") {
    const name = node.id?.name || "<anonymous>";
    const arity = node.params?.length ?? 0;
    return `FUNC:${name}|arity=${arity}`;
  }

  return type; // fallback
}

export class TrieNode {
  constructor(type, value = null, parent = null, signature = "ROOT") {
    this.type = type;
    this.value = value;
    this.signature = signature; // e.g. BIN:+
    this.parent = parent;
    this.children = new Map(); // nodeSig -> TrieNode
    this.occurrences = new Map(); // contextHash -> ASTNode[]
  }

  addOccurrence(contextHash, astNode) {
    if (!this.occurrences.has(contextHash)) {
      this.occurrences.set(contextHash, []);
    }
    this.occurrences.get(contextHash).push(astNode);
  }
}

export class ASTTrie {
  constructor() {
    this.root = new TrieNode("ROOT", null, null, "ROOT");
    this.currentNode = this.root;

    this.contextStack = ["ROOT_CTX"];
    this.currentContextHash = "ROOT_CTX";
  }

  enter(astNode, role = "") {
    const nodeSig = getNodeSignature(astNode);

    let child = this.currentNode.children.get(nodeSig);
    if (!child) {
      const [type, ...rest] = nodeSig.split(":");
      const value = rest.length ? rest.join(":") : null;
      child = new TrieNode(type, value, this.currentNode, nodeSig);
      this.currentNode.children.set(nodeSig, child);
    }

    const newContextHash = hash(
      `${this.currentContextHash}>${role}>${nodeSig}`
    );

    child.addOccurrence(newContextHash, astNode);

    this.currentNode = child;
    this.contextStack.push(newContextHash);
    this.currentContextHash = newContextHash;
  }

  exit() {
    if (!this.currentNode.parent) return; // already at root
    this.currentNode = this.currentNode.parent;

    this.contextStack.pop();
    this.currentContextHash = this.contextStack[this.contextStack.length - 1];
  }
}
