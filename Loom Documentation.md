# **Loom Language Documentation**

## **Table of Contents**
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Syntax Overview](#syntax-overview)
   - [Variable Declarations](#variable-declarations)
   - [Data Types](#data-types)
   - [Operators](#operators)
   - [Control Structures](#control-structures)
   - [Functions](#functions)
   - [Event Handling](#event-handling)
   - [Classes and Objects](#classes-and-objects)
   - [Namespaces](#namespaces)
   - [Modules and Imports](#modules-and-imports)
   - [Error Handling](#error-handling)
   - [Built-in Functions](#built-in-functions)
   - [Comments](#comments)
   - [Data Structures](#data-structures)
4. [Examples](#examples)
5. [Advanced Features](#advanced-features)
6. [Best Practices](#best-practices)
7. [FAQ](#faq)
8. [Community and Support](#community-and-support)

---

## **1. Introduction**
Loom is a powerful and flexible scripting language designed to be used with the Infinite Engine. It is tailored to provide a seamless experience for game developers, allowing for concise and expressive code while maintaining strong typing and clear syntax.

### **Key Features:**
- Explicit type declarations
- Custom event handling
- Class-based object-oriented programming
- Integration with Infinite Engine's features

## **2. Getting Started**
To start coding in Loom, simply include your scripts in the Infinite Engine project. Loom scripts are typically saved with the `.loom` extension.

```loom
# Example of a basic Loom script
var age : int = 10;
log("Age is " + age);
```

## **3. Syntax Overview**

### **3.1 Variable Declarations**
Variables in Loom are declared using the syntax:

```loom
variableName : Type = value;
```

- **Example:**
  ```loom
  var age : int = 10;
  ```
  ```loom
  age : int = 10; # var is optional as it automatically if uses age : int = 10;
  ```

### **3.2 Data Types**
Loom supports various primitive and custom data types:

- **Primitives:** `int`, `float`, `string`, `bool`
- **Custom Types:** Create your own types as needed.

### **3.3 Operators**
Loom includes a range of operators for arithmetic, comparison, assignment, and logical operations.

- **Arithmetic:** `+`, `-`, `*`, `/`, `%`
- **Comparison:** `==`, `!=`, `<`, `>`, `<=`, `>=`
- **Assignment:** `=`, `+=`, `-=`, `*=`, `/=`
- **Logical:** `and`, `or`, `not`

### **3.4 Control Structures**
Loom supports common control structures for conditional logic and loops.

#### **3.4.1 Conditional Statements**
```loom
if (condition):
    # code block
else if (condition):
    # code block
else:
    # code block
```

- **Example:**
  ```loom
  if (age > 18):
      log("Adult");
  else:
      log("Minor");
  ```

#### **3.4.2 Loops**
Loom supports `for` and `while` loops.

- **Example:**
  ```loom
  for (var i : int = 0; i < 10; i += 1):
      log("Index: " + i);
  ```

### **3.5 Functions**
Functions in Loom are defined using the following syntax:

```loom
returnType functionName(parameters):
    # function body
```

- **Example:**
  ```loom
  int add(x : int, y : int):
      return x + y;
  ```

### **3.6 Event Handling**
Loom provides a straightforward way to handle events.

```loom
Event eventName:
    EventType:
        # event handling code
```

- **Example:**
  ```loom
  Event keyW:
      Pressed:
          log("W key pressed");
      Released:
          log("W key was released)
  ```

### **3.7 Classes and Objects**
Classes in Loom allow you to encapsulate data and behavior.

```loom
class ClassName:
    # class members
```

- **Example:**
  ```loom
  class BankAccount:
      var balance : int;

      Public (initialBalance : int):
          self.balance = initialBalance;

      void deposit(amount : int):
          self.balance += amount;
  ```

### **3.8 Namespaces**
Namespaces help organize your code and avoid naming conflicts.

```loom
namespace MyNamespace {
    # code
}
```

- **Example:**
  ```loom
  namespace MyNamespace {
      var x : int = 5;
  }
  ```

### **3.9 Modules and Imports**
Modules in Loom can be imported into your scripts using the `include` keyword.

```loom
include "moduleName";
```

- **Example:**
  ```loom
  include "math";
  ```

### **3.10 Error Handling**
Loom provides a mechanism for handling errors and preventing re-declarations of variables.

```loom
# Custom error handling
x has already been defined, use x = 12 instead of x : int ‎ = 12 if wanted to reassign.
```

### **3.11 Built-in Functions**
Loom includes several built-in functions for common tasks.

- **Logging:**
  ```loom
  log(expression);
  ```

- **Example:**
  ```loom
  log("Hello, World!");
  ```

### **3.12 Comments**
Comments in Loom can be single-line or multi-line.

- **Single Line:**
  ```loom
  # This is a comment
  ```

- **Multi-Line:**
  ```loom
  /* This is a
  multi-line comment */
  ```

### **3.13 Data Structures**
Loom supports arrays and other data structures.

```loom
x : [] = [1,2,3,4,5]; # Array example
```

- **Example:**
  ```loom
  x : [] = 1 and 2 and 3 and 4 and 5;
  ```

## **4. Examples**
Here are a few examples to help you get started with Loom:

### **Basic Program**
```loom
var age : int = 20;
log("Age: " + age);
```

### **Function and Event Example**
```loom
int add(x : int, y : int):
    return x + y;

Event keyW:
    Pressed:
        log("The W key was pressed");
```

## **5. Advanced Features**
- Custom syntax or unique features Loom offers
- Potential integrations with Infinite Engine

## **6. Best Practices**
- Naming conventions
- Code organization tips
- Performance considerations

## **7. FAQ**
Answers to common questions and issues developers might face.

## **8. Community and Support**
- Links to the [Infinite Engine Dev Community](https://www.reddit.com/r/InfiniteEngineDev/)
- Contact information for support
