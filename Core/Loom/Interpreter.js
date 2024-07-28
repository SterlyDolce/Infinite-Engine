const Parser = require('./Parser');
const fs = require('fs')
const path = require('path')

class Environment {
    constructor(parent = null) {
        this.store = {};
        this.events = []
        this.parent = parent;
    }

    isDefined(name, currentScope = false) {
        if (this.get(name)) {
            return true;
        } else if (this.parent) {
            if (currentScope) return false
            return this.parent.isDefined(name);
        } else {
            return false;
        }
    }

    get(name) {
        if (name in this.store) {
            return this.store[name].value;
        } else if (this.parent) {
            return this.parent.get(name);
        }
        return undefined;
    }

    set(name, value) {
        this.store[name] = { name, value };
    }

    MK_EV(eventType, body, interpreter, env) {


        function eventHandler() {
            // Use the body to handle the event
            interpreter.interpret(body, env);
        };

        document.addEventListener(eventType, eventHandler);
        document.addEventListener('removeEvents', removeEvents)

        function removeEvents() {
            document.removeEventListener(eventType, eventHandler);
            document.removeEventListener('removeEvents', removeEvents)
        }
    }

    MK_FN(name, params, body, interpreter, parent) {

        const funcEnv = new Environment(parent);
        const func = Object.defineProperty(function (...args) {
            for (let i = 0; i < params.length; i++) {
                funcEnv.set(params[i], args[i]);
            }
            const result = interpreter.interpret(body, funcEnv);
            return result

        }.bind(this), 'name', { value: name });

        this.set(name, func)
    }

    MK_NATIVE_FN(name, callback) {

        const func = Object.defineProperty(function (...args) {
            return callback(...args)
        }.bind(this), 'name', { value: name });

        this.set(name, func)

    }

    MK_VAR(name, value) {
        this.set(name, value)
    }


}

class Interpreter {
    constructor() {
        this.dir = ""
        this.name = ""
        this.globalEnv = new Environment();
        this.initializeGlobalVar();
    }

    initializeGlobalVar() {
        this.globalEnv.MK_NATIVE_FN('log', (...arg)=>consol.log(...arg));
        this.globalEnv.MK_NATIVE_FN('copy', (object) => {
            function deepCopy(obj) {
                if (obj === null || typeof obj !== 'object') {
                    return obj;
                }

                if (Array.isArray(obj)) {
                    const arrCopy = [];
                    obj.forEach((item, index) => {
                        arrCopy[index] = deepCopy(item);
                    });
                    return arrCopy;
                }

                const objCopy = {};
                Object.keys(obj).forEach((key) => {
                    objCopy[key] = deepCopy(obj[key]);
                });
                return objCopy;
            }

            return deepCopy(object);
        });

        this.globalEnv.MK_VAR('math', Math)

    }

    execute(data, filepath) {
        if (filepath) {
            this.dir = path.dirname(filepath)
            this.name = path.basename(filepath)
        }
        const parser = new Parser()
        const program = parser.produceAST(data);
        this.interpret(program)
    }

    include(data) {
        const parser = new Parser()
        const program = parser.produceAST(data);
        this.interpret(program)
    }

    interpret(node, env = this.globalEnv) {
        if (!node) {
            console.error('Cannot interpret null node');
            return null;
        }

        switch (node.type) {
            case 'Program':
                return this.evalProgram(node, env);
            case 'ImportDeclaration':
                return this.evalImportDeclaration(node, env);
            case 'BlockStatement':
                return this.evalBlockStatement(node, env);
            case 'ExpressionStatement':
                return this.interpret(node.expression, env);
            case 'VariableDeclaration':
                return this.evalVariableDeclaration(node, env);
            case 'VariableAssignment':
                return this.evalVariableAssignment(node, env);
            case 'ClassDeclaration':
                return this.evalClsDeclaration(node, env);
            case 'Identifier':
                if (env.get(node.name) == undefined) {
                    // throw new Error(`'${node.name}' is undefined`);
                    return undefined
                }
                return env.get(node.name);
            case 'Literal':
                const value = node.value;
                if (value == undefined) {
                    // throw new Error(`'${node.name}' is undefined`);
                    return undefined
                }
                return value;
            case 'AssignmentExpression':
                return this.evalAssignmentExpression(node, env);
            case 'FunctionDeclaration':
                return this.evalFunctionDeclaration(node, env);
            case 'CallExpression':
                return this.evalCallExpression(node, env);
            case 'MemberExpression':
                return this.evalMemberExpression(node, env);
            case 'IfStatement':
                return this.evalIfStatement(node, env);
            case 'ForStatement':
                return this.evalForStatement(node, env);
            case 'ForInStatement':
                return this.evalForInStatement(node, env);
            case 'ForOfStatement':
                return this.evalForOfStatement(node, env);
            case 'ArrayExpression':
                return this.evalArrayExpression(node, env);
            case 'ObjectExpression':
                return this.evalObjectExpression(node, env);
            case 'BinaryExpression':
                return this.evalBinaryExpression(node, env);
            case 'ReturnStatement':
                return this.evalReturnStatement(node, env)
            case 'EventDeclaration':
                return this.evalEventDeclaration(node, env);
            default:
                console.error(`Unknown node type: ${node.type}`, node);
                return null;
        }

    }

    isObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    evalProgram(program, env) {
        let result;
        for (const statement of program.body) {
            result = this.interpret(statement, env);
        }
        return result;
    }

    evalBlockStatement(block, env) {
        let result;
        for (const statement of block.body) {
            result = this.interpret(statement, env);
        }
        return result;
    }

    evalImportDeclaration(node, env) {
        let source = node.source.value;
        if (!source.endsWith(".loom") && !source.endsWith(".LOOM")) {
            source = source + ".loom";
        }
        const p = path.join(this.dir, source);

        try {
            const data = fs.readFileSync(p, 'utf8');
            this.include(data);
        } catch (err) {
            console.error('Error including file:', err);
        }
    }

    evalVariableDeclaration(statement, env) {


        const declaration = statement.declarations
        if (env.isDefined(declaration.identifier.name, true)) {
            console.error(`Variable '${declaration.identifier.name}' has already been defined`);
        } else {
            const value = this.interpret(declaration.init, env);
            env.set(declaration.identifier.name, value);
        }

    }

    evalVariableAssignment(statement, env) {
        if (!env.isDefined(statement.id.name)) {
            console.error(`Variable '${statement.id.name}' is not defined`);
        } else {
            const value = this.interpret(statement.value, env);
            env.set(statement.id.name, value);
        }
    }

    evalAssignmentExpression(expression, env) {

        if (expression.identifier.type == "MemberExpression") {
            const object = this.interpret(expression.identifier.object, env)
            const node = expression.identifier
            const property = node.computed
                ? this.interpret(node.property, env)
                : node.property.name;
            const value = this.interpret(expression.init, env)
            try {
                object.prototype[property] = value
            } catch (error) {
                object[property] = value
            }
            env.set(object[property], value)
            return value
        }

        else if (!env.isDefined(expression.identifier.name)) {
            console.error(`Cannot assign variable '${expression.identifier.name}' as it is not defined`);
            return null;
        } else {
            const value = this.interpret(expression.init, env);
            env.set(expression.identifier.name, value);
            return value;
        }
    }

    evalBinaryExpression(expression, env) {
        const left = this.interpret(expression.left, env);
        const right = this.interpret(expression.right, env);
        const operator = expression.operator;

        switch (operator) {
            case '+':
                return left + right;
            case '-':
                return left - right;
            case '*':
                return left * right;
            case '/':
                return left / right;
            case '%':
                return left % right;
            case '<':
                return left < right;
            case '>':
                return left > right;
            case 'is':
                return left === right;
            case 'or':
                return left || right;
            case 'and':
                return left && right;
            case 'not':
                return left !== right;
            case '<=':
                return left <= right;
            case '>=':
                return left >= right;
            case '==':
                return left == right;
            case '!=':
                return left != right;
            default:
                console.error(`Unknown operator: ${operator}`);
                return null;
        }
    }

    evalClassDeclaration(expression, env) {
        const className = expression.id.name;
        const superClass = expression.superClass ? env.get(expression.superClass.name) : null;
        const classBody = expression.body.body;
        const clsEnv = new Environment(env);

        // Define the class constructor
        const ClassConstructor = (...args) => {
            // If there is a super class, call its constructor
            let result = undefined
            if (superClass) {
                superClass.apply(this, args);
            }

            // Initialize class fields and execute constructor
            classBody.forEach(element => {
                if (element.kind === 'constructor') {
                    element.value.params.forEach((param, index) => {
                        clsEnv.set(param.name, args[index])
                    });
                    result = this.interpret(element.value.body, clsEnv);
                } else if (element.kind === 'field') {
                    clsEnv.set(element.key.name, undefined)
                }
            });

            return result
        };

        // Set up inheritance if superClass exists
        if (superClass) {
            ClassConstructor.prototype = Object.create(superClass.prototype);
            ClassConstructor.prototype.constructor = ClassConstructor;
        }

        // Define class methods
        classBody.forEach(element => {
            if (element.kind === 'method') {
                const methodName = element.key.name;
                ClassConstructor.prototype[methodName] = function (...args) {
                    const methodEnv = new Environment(clsEnv);
                    element.value.params.forEach((param, index) => {
                        methodEnv.set(param.name, args[index]);
                    });
                    return this.interpret(element.value.body, methodEnv);
                }.bind(this);
            }
        });

        // Store the class constructor in the environment
        env.set(className, ClassConstructor);
    }

    evalClsDeclaration(expression, env) {
        const className = expression.id.name;
        const superClass = expression.superClass ? env.get(expression.superClass.name) : null;
        const classBody = expression.body.body;
        const clsEnv = new Environment(env);
        const scope = this;

        // Define the class with the specified name
        class ClassDeclaration {
            constructor(...args) {
                const constructorElement = classBody.find(element => element.kind === 'constructor');
                if (constructorElement) {
                    constructorElement.value.params.forEach((param, index) => {
                        clsEnv.set(param.name, args[index]);
                    });
                    scope.interpret(constructorElement.value.body, clsEnv);
                }
            }
        }

        // Process the class body
        classBody.forEach(element => {
            if (element.kind === 'field') {
                ClassDeclaration.prototype[element.key.name] = scope.interpret(element.value, clsEnv);
            } else if (element.kind === 'method') {
                const method = (...args) => {
                    const methodEnv = new Environment(clsEnv);
                    element.value.params.forEach((param, index) => {
                        methodEnv.set(param.name, args[index]);
                    });
                    return scope.interpret(element.value.body, methodEnv);
                };
                Object.defineProperty(method, 'name', { value: element.key.name });
                ClassDeclaration.prototype[element.key.name] = method;
            }
        });

        if (superClass) {
            Object.setPrototypeOf(ClassDeclaration.prototype, superClass.prototype);
            Object.setPrototypeOf(ClassDeclaration, superClass);
        }

        // Set the class name
        Object.defineProperty(ClassDeclaration, 'name', { value: className });

        // Set the class in the environment
        clsEnv.set('self', ClassDeclaration.prototype)
        env.set(className, ClassDeclaration);
    }





    evalFunctionDeclaration(expression, env) {
        const funcEnv = new Environment(env);

        const name = expression.id.name;
        const params = expression.params.map(param => param.name);
        const body = expression.body;

        const func = Object.defineProperty(function (...args) {
            for (let i = 0; i < params.length; i++) {
                funcEnv.set(params[i], args[i]);
            }
            return this.interpret(body, funcEnv);
        }.bind(this), 'name', { value: name });

        env.MK_FN(name, params, body, this, env)
    }



    evalCallExpression(expression, env) {
        const func = env.get(expression.callee.name);

        if (!func) {
            console.error(`Unknown function or Class: ${expression.callee.name}`);
            return null;
        }


        const args = expression.args.map(arg => this.interpret(arg, env));

        try {
            return new func(...args);
        } catch (error) {
            return func(...args);
        }

    }

    evalIfStatement(node, env) {
        const test = this.interpret(node.test, env);
        if (test) {
            return this.interpret(node.consequent, env);
        } else if (node.alternate) {
            return this.interpret(node.alternate, env);
        }
        return null;
    }

    evalForStatement(node, env) {
        const newEnv = new Environment(env);
        this.interpret(node.init, newEnv);

        while (true) {
            const test = this.interpret(node.test, newEnv);
            if (!test) break;

            this.interpret(node.body, newEnv);
            this.interpret(node.update, newEnv);
        }

        return null;
    }

    evalForInStatement(node, env) {
        const newEnv = new Environment(env);
        const right = this.interpret(node.right, env);

        if (!right[Symbol.iterator]) {
            throw new Error('Right-hand side of for-in is not iterable');
        }

        for (const element in right) {
            newEnv.set(node.left.name, element);
            this.interpret(node.body, newEnv);
        }

        return null;
    }

    evalForOfStatement(node, env) {
        const newEnv = new Environment(env);
        const right = this.interpret(node.right, env);

        if (!right[Symbol.iterator]) {
            throw new Error('Right-hand side of for-of is not iterable');
        }

        for (const element of right) {
            newEnv.set(node.left.name, element);
            this.interpret(node.body, newEnv);
        }

        return null;
    }

    evalArrayExpression(node, env) {
        const values = [];

        for (const element of node.elements) {
            const value = this.interpret(element, env);
            values.push(value);
        }

        return values;
    }

    evalObjectExpression(node, env) {
        const values = {};

        for (const property of node.properties) {
            const value = this.interpret(property.value, env);
            const key = this.interpret(property.key, env);

            values[key] = value;
        }

        return values;
    }

    evalMemberExpression(node, env) {
        let object;


        // Check if the object is 'self'
        if (node.object.type === 'Identifier' && node.object.name === 'self') {
            // Assuming 'self' refers to the current instance in the environment
            object = env.get('self');
        } else {
            // Otherwise, evaluate the object as usual
            object = this.interpret(node.object, env);
        }

        // Determine the property name or computed value
        const property = node.computed
            ? this.interpret(node.property, env)
            : node.property.name;

        // Check if the object is valid and is of type 'object'
        if (object === null || typeof object !== 'object') {
            throw new Error(`Cannot access property '${property}' of non-object '${object}'`);
        }

        // Retrieve the value of the specified property
        let value = object[property];



        // Check if the property exists on the object
        if (value === undefined) {
            throw new Error(`Property '${property}' does not exist on object '${JSON.stringify(object)}'`);
        }

        // Check if the property is a function and if the node is a CallExpression
        if (typeof value === 'function' && node.property.type === 'CallExpression') {
            const args = node.property.args.map(arg => this.interpret(arg, env));
            return value.call(object, ...args); // Call the function in the context of the object
        }

        return value;
    }



    evalReturnStatement(node, env) {
        return this.interpret(node.argument, env)
    }


    evalEventDeclaration(expression, env) {
        const eventType = expression.eventType.name;
        const body = expression.body;

        env.MK_EV(eventType, body, this, env)
    }
}

module.exports = { Interpreter, Environment };
