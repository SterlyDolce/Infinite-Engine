const {
    Program,
    BinaryExpression,
    Identifier,
    Literal,
    ArrayExpression,
    VariableDeclarator,
    VariableDeclaration,
    AssignmentExpression,
    FunctionDeclaration,
    BlockStatement,
    ClassDeclaration,
    ClassBody,
    MethodDefinition,
    FunctionExpression,
    ImportDeclaration,
    PropertyDefinition,
    CallExpression,
    IfStatement,
    ForStatement,
    ForInStatement,
    ForOfStatement,
    ObjectExpression,
    Property,
    MemberExpression,
    ReturnStatement,
    EventDeclaration
} = require('./ast');
const { tokenize, Token, tokenType, Lexer } = require('./Lexer');


class Parser {
    constructor() {
        this.tokens = [];
        this.currentIndex = 0;
    }

    not_EOF() {
        return this.currentToken().type !== tokenType.EOF;
    }

    prevToken(offset = 1) {
        const tokens = this.tokens
        const currentIndex = this.currentIndex
        return tokens[currentIndex - offset];
    }

    currentToken() {
        return this.tokens[this.currentIndex];
    }

    nextToken(offset = 1) {
        const tokens = this.tokens
        const currentIndex = this.currentIndex
        return tokens[currentIndex + offset];
    }

    eat() {
        return this.tokens[this.currentIndex++];
    }

    expect(type, errorMessage) {
        if (this.currentToken().type !== type) {
            throw new Error(`${errorMessage}. Found '${this.currentToken().value}' instead.`);
        }
        return this.eat();
    }

    produceAST(source) {
        const lexer = new Lexer(source)
        this.tokens = lexer.lex();
        this.currentIndex = 0;
        const program = new Program();

        while (this.not_EOF()) {
            program.body.push(this.parse_statement());
        }

        return program;
    }

    parse_statement(parentIndentID = null) {


        switch (this.currentToken().type) {
            case tokenType.Include:
                return this.parse_import_declaration()
            case tokenType.Var:
                return this.parse_variable_declaration();
            case tokenType.Func:
                return this.parse_function_declaration(parentIndentID);
            case tokenType.Class:
                return this.parse_class_declaration(parentIndentID);
            case tokenType.Public:
                return this.parse_public_declaration();
            case tokenType.If:
                return this.parse_if_statement();
            case tokenType.For:
                return this.parse_for_statement();
            case tokenType.Return:
                return this.parse_return_statement();
            case tokenType.Tab:
                return this.parse_block_statement(parentIndentID)
            case tokenType.Event:
                return this.parse_event_declaration(parentIndentID)
            default:
                return this.parse_expression();
        }
    }

    parse_import_declaration() {
        this.eat() // consume include
        if (this.currentToken().type !== tokenType.String) {
            throw Error("The source path can only be a string.")
        }
        const source = this.parse_primary_expression()
        return new ImportDeclaration(source)
    }

    parse_return_statement() {
        this.eat();
        const argument = this.parse_expression();
        return new ReturnStatement(argument);
    }

    parse_expression(precedence = -3) {
        let left = this.parse_primary_expression();

        while (this.not_EOF() && (this.currentToken().type === tokenType.BinaryOperator || this.currentToken().type === tokenType.Dot || this.currentToken().type === tokenType.LBracket)) {
            if (this.currentToken().type === tokenType.BinaryOperator) {
                const operatorToken = this.currentToken();
                const operatorPrecedence = this.get_operator_precedence(operatorToken.value);

                if (operatorPrecedence <= precedence) {
                    break;
                }

                this.eat(); // consume the operator
                const right = this.parse_expression(operatorPrecedence);

                left = new BinaryExpression(operatorToken.value, left, right);
            } else if (this.currentToken().type === tokenType.Dot) {
                this.eat(); // consume '.'
                const property = this.parse_primary_expression();
                left = new MemberExpression(left, property, false);
            } else if (this.currentToken().type === tokenType.LBracket) {
                this.eat(); // consume '['
                const property = this.parse_expression();
                this.expect(tokenType.RBracket, "Expected ']'");
                left = new MemberExpression(left, property, true);
            }

        }

        return left;
    }

    parse_primary_expression() {
        if (this.currentToken().value == "-") {

            this.eat()
            const value = 0 - this.currentToken().value
            this.eat()
            return new Literal(value);
        }

        let expr;
        switch (this.currentToken().type) {
            case tokenType.Ident:
                expr = this.parse_identifier();
                if (this.currentToken().type === tokenType.LParen) {
                    const call = this.parse_call_expression(expr);
                    if (this.currentToken().type !== tokenType.Colon) {
                        return call;
                    }
                }
                return expr;
            case tokenType.True:
                this.eat();
                return new Literal(true);
            case tokenType.False:
                this.eat();
                return new Literal(false);
            case tokenType.Null:
                this.eat();
                return new Literal("null");
            case tokenType.String:
            case tokenType.Number:
                return new Literal(this.eat().value);
            case tokenType.LParen:
                return this.parse_grouped_expression();
            case tokenType.LCurl:
                return this.parse_object_expression();
            case tokenType.LBracket:
                return this.parse_array_expression();
            case tokenType.Var:
                return this.parse_variable_declaration();
            case tokenType.Set:
                return this.parse_assignment_expression();
            case tokenType.Func:
                return this.parse_function_declaration();
            default:
                throw new Error(`Unknown Token at Loom Parsing: ${JSON.stringify(this.currentToken())}`);
        }
    }

    parse_identifier() {
        const token = this.currentToken();
        if (token.type === tokenType.Ident) {
            this.eat(); // consume identifier
            return new Identifier(token.value);
        } else {
            throw new Error(`Unexpected token ${token.type}, expected Identifier`);
        }
    }

    parse_if_statement(parentIndentID = null) {
        this.eat(); // consume 'if'

        const test = this.parse_primary_expression();

        if (this.currentToken().type !== tokenType.Colon) {
            throw new Error('Expected : after condition');
        }

        this.eat(); // consume ':'

        const consequent = this.parse_block_statement(parentIndentID);
        let alternate = null;

        if (this.currentToken().type === tokenType.Else || this.currentToken().type === tokenType.ElseIf) {
            if (this.currentToken().type === tokenType.Else) {
                this.eat(); // consume 'else'
                this.eat(); // consume ':'
                alternate = this.parse_block_statement(parentIndentID);
            } else {
                alternate = this.parse_if_statement();
            }
        }

        return new IfStatement(test, consequent, alternate);
    }

    parse_for_statement(parentIndentID = null) {
        this.eat(); // consume 'for'

        if (this.currentToken().type === tokenType.Var) {
            // assume it is a for loop
            const init = this.parse_expression();
            this.eat(); // consume ';'
            const test = this.parse_expression();
            this.eat(); // consume ';'
            const update = this.parse_expression();

            if (this.currentToken().type !== tokenType.Colon) {
                throw new Error('Expected : after updates');
            }

            this.eat(); // consume ':'
            const body = this.parse_block_statement();

            return new ForStatement(init, test, update, body);
        } else if (this.currentToken().type === tokenType.Ident) {
            // it is a for-in or for-of
            let left = this.parse_primary_expression();

            if (this.currentToken().type === tokenType.In) {
                this.eat(); // consume 'in'
                const right = this.parse_expression();

                if (this.currentToken().type !== tokenType.Colon) {
                    throw new Error('Expected : after expression');
                }

                this.eat(); // consume ':'
                const body = this.parse_block_statement(parentIndentID);

                return new ForInStatement(left, right, body);
            } else if (this.currentToken().type === tokenType.Of) {
                this.eat(); // consume 'of'
                const right = this.parse_expression();

                if (this.currentToken().type !== tokenType.Colon) {
                    throw new Error('Expected : after expression');
                }

                this.eat(); // consume ':'
                const body = this.parse_block_statement(parentIndentID);

                return new ForOfStatement(left, right, body);
            }
        }
    }

    parse_call_expression(callee) {
        this.eat(); // consume '('
        const args = [];

        while (this.currentToken().type !== tokenType.RParen) {
            args.push(this.parse_expression());
            if (this.currentToken().type === tokenType.Comma) {
                this.eat(); // consume ','
            } else if (this.currentToken().type !== tokenType.RParen) {
                throw new Error('Expected , or ) in function call arguments');
            }
        }

        this.eat(); // consume ')'


        return new CallExpression(callee, args, callee.name);
    }

    parse_grouped_expression() {
        this.eat(); // consume '('
        const expr = this.parse_expression();
        this.expect(tokenType.RParen, "Expected ')'");
        return expr;
    }

    parse_class_declaration(parentIndentID = null) {
        this.expect(tokenType.Class, "Expected 'class' keyword");
        const id = this.parse_identifier();
        let superClass = null;

        if (this.currentToken().type === tokenType.Extends) {
            this.eat(); // consume 'extends'
            superClass = this.parse_primary_expression();
        }

        this.expect(tokenType.Colon, "Expected ':' after class name or superclass");
        const body = this.parse_class_body(parentIndentID);
        return new ClassDeclaration(id, superClass, body);
    }

    parse_class_body(parentIndentID = null) {
        const body = new ClassBody();
        let currentIndentID = parentIndentID;


        if (this.currentToken().type === tokenType.Indent) {
            currentIndentID = this.currentToken().id;
            this.eat();
            while (this.currentToken().id !== currentIndentID) {
                body.body.push(this.parse_class_element(currentIndentID));
            }
            this.eat(); // Consume DEDENT
        }


        return body;
    }

    parse_class_element(parentIndentID = null) {


        switch (this.currentToken().type) {
            case tokenType.Ident:
                // Check if it's a constructor
                if (this.currentToken().value === 'constructor') {
                    return this.parse_constructor_definition(parentIndentID);
                }
                // Otherwise, it's a method definition
                return this.parse_method_definition(parentIndentID);
            case tokenType.Var:
                return this.parse_property_definition();
            case tokenType.Tab:
            default:
                throw new Error(`Unexpected token type ${this.currentToken().type} in class body`);
        }
    }

    parse_constructor_definition(parentIndentID = null) {
        this.expect(tokenType.Ident, "Expected 'constructor' keyword");
        const params = this.parse_params();
        this.expect(tokenType.Colon, "Expected ':' after constructor parameters");
        const body = this.parse_block_statement(parentIndentID);
        const value = new FunctionDeclaration(null, params, body)
        return new MethodDefinition("constructor", 'constructor', value);
    }

    parse_method_definition(parentIndentID = null) {
        const key = this.parse_identifier();
        const params = this.parse_params();
        this.expect(tokenType.Colon, "Expected ':' after method parameters");
        const body = this.parse_block_statement(parentIndentID);
        const value = new FunctionDeclaration(null, params, body)
        return new MethodDefinition(key, 'method', value);
    }

    parse_params() {
        this.expect(tokenType.LParen, "Expected '(' for function parameters");

        const params = [];
        while (this.currentToken().type !== tokenType.RParen) {
            params.push(this.parse_identifier());
            if (this.currentToken().type === tokenType.Comma) {
                this.eat(); // consume ','
            } else if (this.currentToken().type !== tokenType.RParen) {
                throw new Error('Expected , or ) in function parameters');
            }
        }

        this.eat(); // consume ')'
        return params;
    }

    parse_property_definition() {
        this.expect(tokenType.Var, "Expected 'var' keyword");

        const key = this.parse_identifier();
        this.expect(tokenType.Assign, "Expected '='");
        const value = this.parse_expression();
        return new PropertyDefinition(key, value);
    }

    parse_block_statement(parentIndentID = null) {
        const block = new BlockStatement();
        let currentIndentID = parentIndentID;



        if (this.currentToken().type === tokenType.Indent) {
            currentIndentID = this.currentToken().id;
            this.eat();
            while (this.currentToken().id !== currentIndentID) {
                block.body.push(this.parse_statement(currentIndentID));
            }
            this.eat(); // Consume DEDENT
        }

        return block;
    }



    parse_variable_declaration() {
        this.eat(); // consume 'var'
        const id = this.parse_identifier();

        let init = null;
        if (this.currentToken().type === tokenType.Assign) {
            this.eat(); // consume '='
            init = this.parse_expression();
        }

        return new VariableDeclaration(new VariableDeclarator(id, init));
    }

    parse_assignment_expression() {
        this.eat(); // consume 'set'
        const left = this.parse_expression();
        this.expect(tokenType.Assign, "Expected '='");
        const right = this.parse_expression();
        return new AssignmentExpression(left, right);
    }

    get_operator_precedence(operator) {
        switch (operator) {
            case '=':
                return 1;
            case '||':
                return 2;
            case '&&':
                return 3;
            case '<':
            case '>':
            case '<=':
            case '>=':
            case '==':
            case '!=':
                return 4;
            case '+':
            case '-':
                return 5;
            case '*':
            case '/':
                return 6;
            default:
                return 0;
        }
    }

    parse_object_expression() {
        this.expect(tokenType.LCurl, "Expected '{' at the start of object literal");
        const properties = [];

        while (this.currentToken().type !== tokenType.RCurl) {
            while (this.currentToken().type == tokenType.Indent || this.currentToken().type == tokenType.Dedent) {
                this.eat()
            }
            const key = this.parse_primary_expression();
            this.expect(tokenType.Colon, "Expected ':' in object literal");
            const value = this.parse_expression();
            properties.push(new Property(key, value));

            while (this.currentToken().type == tokenType.Indent || this.currentToken().type == tokenType.Dedent) {
                this.eat()
            }

            if (this.currentToken().type === tokenType.Comma) {
                this.eat(); // consume ','
            } else if (this.currentToken().type !== tokenType.RCurl) {
                throw new Error('Expected , or } in object literal');
            }
        }

        this.expect(tokenType.RCurl, "Expected '}' at the end of object literal");
        return new ObjectExpression(properties);
    }

    parse_array_expression() {
        this.expect(tokenType.LBracket, "Expected '[' at the start of array literal");
        const elements = [];

        while (this.currentToken().type !== tokenType.RBracket) {
            elements.push(this.parse_expression());

            if (this.currentToken().type === tokenType.Comma) {
                this.eat(); // consume ','
            } else if (this.currentToken().type !== tokenType.RBracket) {
                throw new Error('Expected , or ] in array literal');
            }
        }

        this.expect(tokenType.RBracket, "Expected ']' at the end of array literal");
        return new ArrayExpression(elements);
    }

    parse_function_declaration(parentIndentID = null) {
        this.eat(); // consume 'func'
        const id = this.parse_identifier();
        const params = this.parse_params();
        this.eat(); // consume ':'
        const body = this.parse_block_statement(parentIndentID);
        return new FunctionDeclaration(id, params, body);
    }

    parse_event_declaration(parentIndentID = null) {
        this.eat(); // consume 'Event'
        const eventType = this.parse_identifier();
        this.eat(); // consume ':'
        const body = this.parse_block_statement(parentIndentID);
        return new EventDeclaration(eventType, body);
    }

    parse_public_declaration() {
        this.eat(); // consume 'public'
        return this.parse_expression();
    }
}

module.exports = Parser;
