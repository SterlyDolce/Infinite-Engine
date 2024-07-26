

const tokenType = {
    Var: "var",
    Set: "set",
    Private: "private",
    Public: "public",
    Return: 'return',
    Include: 'include',

    Ident: "identifier",
    Number: "number",
    String: "string",

    True: "true",
    False: "false",
    Null: "null",

    Assign: "assign",

    Class: "class",
    Func: "func",
    If: "if",
    Else: "else",
    ElseIf: "elseif",
    For: "for",
    In: "in",
    Of: "of",
    Event: "event",

    Extends: "extends",

    BinaryOperator: "binaryOperator",

    LParen: "LParen",
    RParen: "RParen",

    LBracket: "LBracket",
    RBracket: "RBracket",

    LCurl: "LCurl",
    RCurl: "RCurl",

    Indent: "indent",
    Dedent: "dedent",
    NewLine: "newline",

    Comma: "comma",
    Dot: "dot",
    Colon: 'colon',
    Hash: 'hashtag',
    Semicolon: 'semicolon',

    Tab: "tab",

    EOF: "eof"
}

const KEYWORDS = {
    "var": tokenType.Var,
    "set": tokenType.Set,
    "private": tokenType.Private,
    "public": tokenType.Public,
    "class": tokenType.Class,
    "func": tokenType.Func,
    "true": tokenType.True,
    "false": tokenType.False,
    "null": tokenType.Null,
    "extends": tokenType.Extends,
    "constructor": tokenType.Ident,
    "if": tokenType.If,
    "else": tokenType.Else,
    "elseif": tokenType.ElseIf,
    "for": tokenType.For,
    "Event": tokenType.Event,

    "of": tokenType.Of,
    "in": tokenType.In,

    "is": tokenType.BinaryOperator,
    "not": tokenType.BinaryOperator,
    "or": tokenType.BinaryOperator,
    "and": tokenType.BinaryOperator,

    "include": tokenType.Include,

    "return": tokenType.Return
}

class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

class Indentation {
    constructor(type, id) {
        this.type = type;
        this.id = id;
    }
}

function createToken(type, value) {
    const token = new Token(type, value);
    return token;
}

class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.line = 0;
        this.indentStack = [0]; // Track current indentation levels
        this.tokens = [];
        this.indentID = 0;
    }

    lex() {
        while (this.position < this.input.length) {
            let char = this.input[this.position];

            if (char === ' ') {
                this.consumeWhitespace();
            } else if (char === '\n') {
                this.line++;
                this.position++;
                this.handleIndentation();
            } else if (char === ':') {
                this.tokens.push(createToken(tokenType.Colon, char));
                this.position++;
            } else if (char === ';') {
                this.tokens.push(createToken(tokenType.Semicolon, char));
                this.position++;
            } else if (['+', '-', '*', '/', '<', '>', '%'].includes(char)) {
                if (this.input[this.position + 1] === '=') {
                    this.tokens.push(createToken(tokenType.BinaryOperator, char + '='));
                    this.position += 2;
                } else {
                    this.tokens.push(createToken(tokenType.BinaryOperator, char));
                    this.position++;
                }
            } else if (char === '!') {
                if (this.input[this.position + 1] === '=') {
                    this.tokens.push(createToken(tokenType.BinaryOperator, '!='));
                    this.position += 2;
                } else {
                    throw new Error(`Unexpected character: ${char}`);
                }
            } else if (char === '=') {
                if (this.input[this.position + 1] === '=') {
                    this.tokens.push(createToken(tokenType.BinaryOperator, '=='));
                    this.position += 2;
                } else {
                    this.tokens.push(createToken(tokenType.Assign, char));
                    this.position++;
                }
            } else if (char === '(') {
                this.tokens.push(createToken(tokenType.LParen, char));
                this.position++;
            } else if (char === ')') {
                this.tokens.push(createToken(tokenType.RParen, char));
                this.position++;
            } else if (char === '{') {
                this.tokens.push(createToken(tokenType.LCurl, char));
                this.position++;
            } else if (char === '}') {
                this.tokens.push(createToken(tokenType.RCurl, char));
                this.position++;
            } else if (char === '[') {
                this.tokens.push(createToken(tokenType.LBracket, char));
                this.position++;
            } else if (char === ']') {
                this.tokens.push(createToken(tokenType.RBracket, char));
                this.position++;
            } else if (char === '.') {
                this.tokens.push(createToken(tokenType.Dot, char));
                this.position++;
            } else if (char === ',') {
                this.tokens.push(createToken(tokenType.Comma, char));
                this.position++;
            } else if (char === '#') {
                this.consumeComment("\n");
            } else if (char === '"' || char === "'") {
                const stringChar = char;
                let string = this.consumeString(stringChar);
                let type = tokenType.String;
                this.tokens.push(createToken(type, string));
            } else if (/[a-zA-Z]/.test(char)) {
                let identifier = this.consumeIdentifier();
                let type = KEYWORDS[identifier] || tokenType.Ident;
                this.tokens.push(createToken(type, identifier));
            } else if (/[0-9]/.test(char)) {
                let number = this.consumeNumber();
                let type = tokenType.Number;
                this.tokens.push(createToken(type, Number(number)));
            } else {
                throw new Error(`Unexpected character: '${char}'`);
            }
        }

        // Add EOF token
        this.tokens.push(createToken(tokenType.EOF, null));
        return this.tokens;
    }

    consumeComment(endChar) {
        this.position++;
        while (this.input[this.position] !== endChar) {
            this.position++;
        }
        this.position++;
    }

    consumeWhitespace() {
        let start = this.position;
        while (this.input[this.position] === ' ') {
            this.position++;
        }
        let length = this.position - start;
        return length;
    }

    consumeIdentifier() {
        let start = this.position;
        while (/[a-zA-Z0-9-_]/.test(this.input[this.position])) {
            this.position++;
        }
        return this.input.slice(start, this.position);
    }

    consumeNumber() {
        let start = this.position;
        while (/[0-9.]/.test(this.input[this.position])) {
            this.position++;
        }
        return this.input.slice(start, this.position);
    }

    consumeString(char) {
        let start = this.position;
        this.position++;
        while (this.input[this.position] !== char) {
            this.position++;
        }
        this.position++;
        return this.input.slice(start + 1, this.position - 1);
    }

    handleIndentation() {
        let spaces = this.consumeWhitespace();
        let currentIndent = this.indentStack[this.indentStack.length - 1];

        if (this.input[this.position] === '\n') {
            return;
        }

        if (spaces > currentIndent) {
            this.indentID++;
            this.tokens.push(new Indentation(tokenType.Indent, this.indentID));
            this.indentStack.push(spaces);
        } else {
            while (spaces < this.indentStack[this.indentStack.length - 1]) {
                this.tokens.push(new Indentation(tokenType.Dedent, this.indentID));
                this.indentID--;
                this.indentStack.pop();
            }
        }
    }
}














module.exports = { Token, tokenType, Lexer };