const nodeType = "Program" 
    | "Literal" 
    | "Identifier" 
    | "BinaryExpression"
    | "ArrayExpression"
    | "VariableDeclaration"
    | "VariableDeclarator"
    | "ExpressionStatement"
    | "CallExpression"
    | "FunctionDeclaration"
    | "BlockStatement"
    | "ClassDeclaration"
    | "MethodDefinition"
    | "PropertyDefinition"
    | "ClassBody"
    | "FunctionExpression"
    | "ForStatement"
    | "ReturnStatement"

class Statement {
    constructor() {
        this.type = "";
    }
}

class Program extends Statement {
    constructor() {
        super();
        this.type = "Program";
        this.body = [];
    }
}

class ImportDeclaration extends Statement {
    constructor(source = "") {
        super();
        this.type = "ImportDeclaration";
        this.source = source;
    }
}

class BlockStatement extends Statement {
    constructor(body = []) {
        super();
        this.type = "BlockStatement";
        this.body = body;
    }
}

class ReturnStatement extends Statement {
    constructor(argument) {
        super();
        this.type = "ReturnStatement";
        this.argument = argument;
    }
}

class VariableDeclaration extends Statement {
    constructor(declarations = [], isPublic = false) {
        super();
        this.type = "VariableDeclaration";
        this.declarations = declarations;
        this.isPublic = isPublic;
    }
}

class IfStatement extends Statement {
    constructor(test = new Expression(), consequent = new BlockStatement(), alternate = null) {
        super();
        this.type = "IfStatement";
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
}

class ForStatement extends Statement {
    constructor(init = new VariableDeclaration() ,test = new Expression(), update = new AssignmentExpression(), body = new BlockStatement()) {
        super();
        this.type = "ForStatement";
        this.init = init;
        this.test = test;
        this.update = update;
        this.body = body;
    }
}

class ForInStatement extends Statement {
    constructor(left = new Expression(), right = new Expression(), body = new BlockStatement()) {
        super();
        this.type = "ForInStatement";
        this.left = left;
        this.right = right;
        this.body = body;
    }
}

class ForOfStatement extends Statement {
    constructor(left = new Expression(), right = new Expression(), body = new BlockStatement()) {
        super();
        this.type = "ForOfStatement";
        this.left = left;
        this.right = right;
        this.body = body;
    }
}

class FunctionDeclaration extends Statement {
    constructor(id = new Identifier(), params = [], body = new BlockStatement()) {
        super();
        this.type = "FunctionDeclaration";
        this.id = id;
        this.params = params;
        this.body = body;
    }
}

class EventDeclaration extends Statement {
    constructor(eventType = new Identifier(), body = new BlockStatement()) {
        super();
        this.type = "EventDeclaration";
        this.eventType = eventType;
        this.body = body;
    }
}

class ClassBody extends Statement {
    constructor(body = []) {
        super();
        this.type = "ClassBody";
        this.body = body;
    }
}

class ClassDeclaration extends Statement {
    constructor(id = new Identifier(), superClass = null, body = new ClassBody()) {
        super();
        this.type = "ClassDeclaration";
        this.id = id;
        this.superClass = superClass;
        this.body = body;
    }
}

class Expression extends Statement {}

class BinaryExpression extends Expression {
    constructor(operator = "", left = new Expression(), right = new Expression()) {
        super();
        this.type = "BinaryExpression";
        this.left = left;
        this.right = right;
        this.operator = operator;
    }
}

class Identifier extends Expression {
    constructor(name = "") {
        super();
        this.type = "Identifier";
        this.name = name;
    }
}

class Literal extends Expression {
    constructor(value = "") {
        super();
        this.type = "Literal";
        this.value = value;
    }
}

class ArrayExpression extends Expression {
    constructor(elements = []) {
        super();
        this.type = "ArrayExpression";
        this.elements = elements;
    }
}

class ObjectExpression extends Expression {
    constructor(properties = []) {
        super();
        this.type = "ObjectExpression";
        this.properties = properties;
    }
}


class Property extends Expression {
    constructor(key, value) {
        super();
        this.type = "Property";
        this.key = key;
        this.value = value;
    }
}

class VariableDeclarator extends Expression {
    constructor(identifier = new Identifier(), init = null) {
        super();
        this.type = "VariableDeclarator";
        this.identifier = identifier;
        this.init = init;
    }
}

class AssignmentExpression extends Expression {
    constructor(identifier = new Identifier(), init = new Expression()) {
        super();
        this.type = "AssignmentExpression";
        this.identifier = identifier;
        this.init = init;
    }
}

class CallExpression extends Expression {
    constructor(callee = new Identifier(), args = new Array(new Expression()), name) {
        super();
        this.type = "CallExpression";
        this.callee = callee;
        this.args = args;
        this.name = name
    }
}

class MemberExpression extends Expression {
    constructor(object = new Identifier(), property = new Identifier(), computed = false) {
        super();
        this.type = "MemberExpression";
        this.object = object;
        this.property = property;
        this.computed = computed;
    }
}

class PropertyDefinition extends Expression {
    constructor(key = new Identifier(), value = null) {
        super();
        this.type = "PropertyDefinition";
        this.key = key;
        this.value = value;
        this.kind = 'field'
    }
}

class MethodDefinition extends Expression {
    constructor(key = new Identifier(), kind = "", value = new FunctionDeclaration()) {
        super();
        this.type = "MethodDefinition";
        this.key = key;
        this.kind = kind;
        this.value = value;
    }
}

class FunctionExpression extends FunctionDeclaration {
    constructor(params = [], body = new BlockStatement()) {
        super();
        this.type = "FunctionExpression";
        this.id = null
        this.params = params;
        this.body = body;
    }
}



module.exports = {
    nodeType,
    Statement,
    Program,
    Expression,
    BinaryExpression,
    Identifier,
    Literal,
    ArrayExpression,
    VariableDeclarator,
    VariableDeclaration,
    AssignmentExpression,
    FunctionDeclaration,
    BlockStatement,
    ClassBody,
    ClassDeclaration,
    PropertyDefinition,
    MethodDefinition,
    FunctionExpression,
    CallExpression,
    IfStatement,
    ForStatement,
    ForInStatement,
    ForOfStatement,
    ObjectExpression,
    Property,
    MemberExpression,
    ReturnStatement,
    ImportDeclaration,
    EventDeclaration
};
