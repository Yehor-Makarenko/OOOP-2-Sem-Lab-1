import Queue from "./Queue.js";
import Stack from "./Stack.js";
import Operand from "./Operand.js";

export default class RPN {
  constructor(expr = "", ...variables) {
    expr = expr.trim();
    const [rpnExpr, lastPos] = this._getRPNExpression(expr, 0, variables);

    if (rpnExpr === null || lastPos < expr.length) {
      throw new Error("Can't parse expression");
    }

    this.expr = expr;
    this.rpnExpr = rpnExpr;
  }

  static merge(rpn1, rpn2, operatorChar) {
    const operator = rpn1._getOperator(operatorChar)[0];

    if (operatorChar.length > 1 || operator === null) {
      throw new Error("Can't merge rpns");
    }

    const mergedRPNExpression = Queue.concat(rpn1.rpnExpr, rpn2.rpnExpr);
    mergedRPNExpression.push(operator);
    const mergedRPN = new rpn1.constructor();
    mergedRPN.expr = rpn1.expr + operatorChar + rpn2.expr;
    mergedRPN.rpnExpr = mergedRPNExpression;

    return mergedRPN;
  }

  static copy(rpn) {
    const rpnExprCopy = new this();
    rpnExprCopy.rpnExpr = Queue.copy(rpn.rpnExpr);
    rpnExprCopy.expr = rpn.expr;

    return rpnExprCopy;
  }

  static OPERATORS = {
    ",": {type: ",", priority: 0},
    "(": {type: "(", priority: 0},
    ")": {type: ")", priority: 0},
    "+": {type: "+", priority: 1},
    "-": {type: "-", priority: 1},
    "*": {type: "*", priority: 2},
    "/": {type: "/", priority: 2},
    "u-": {type: "u-", priority: 3},
    "^": {type: "^", priority: 4},
  };

  _getRPNExpression(expr, startPos = 0, variables) {    
    const result = new Queue();
    const operators = new Stack();
    let currPos = startPos;
    let parsCounter = 0;
    let isLastOperand = false;
    let isUnaryMinus = false; 
    let operand, operator;     

    if (expr.trim() === "") return [result, 0];
  
    while (currPos < expr.length) {        
      if (!isLastOperand) {
        [operand, currPos] = this._getOperand(expr, currPos, variables);
        if (operand !== null) {
          result.push(operand);          
          isUnaryMinus = false;
          isLastOperand = true;
          continue;
        }
    
        [operator, currPos] = this._getOperator(expr, currPos);
    
        if (operator === null || operator.type !== "(" && operator.type !== "-") return [null, currPos];
  
        if (operator.type === "-") {
          if (isUnaryMinus || expr[currPos] === " ") return [null, currPos];        
          
          isUnaryMinus = true;          
          operators.push(RPN.OPERATORS["u-"]);   
          continue;     
        }
    
        operators.push(operator);        
        parsCounter++;
        isUnaryMinus = false;
  
        continue;
      }
    
      [operator, currPos] = this._getOperator(expr, currPos);    
    
      if (operator === null || operator.type === "(") return [null, currPos];
    
      if (operator.type === ")") {
        let lastOperator = operators.pop();
    
        while (lastOperator !== null && lastOperator.type !== "(") {
          result.push(lastOperator);
          lastOperator = operators.pop();
        }
    
        if (parsCounter === 0) return [result, currPos - 1];
            
        parsCounter--;
        continue;
      }    
    
      let lastOperator = operators.get();
    
      while (lastOperator !== null && lastOperator.priority >= operator.priority) {
        result.push(operators.pop());
        lastOperator = operators.get();
      }
  
      if (operator.type === ",") {
        if (parsCounter > 0) return [null, currPos];
  
        return [result, currPos - 1];
      }
        
      operators.push(operator);
      isLastOperand = false;
    }
  
    if (parsCounter > 0 || !isLastOperand) return [null, currPos];
  
    while (operators.length > 0) {
      result.push(operators.pop());
    }
  
    return [result, currPos];
  }

  _getOperand(expr, startPos = 0, variables) {
    let currPos = startPos;  
    let operand;
  
    while (expr[currPos] === " ") {
      currPos++;
      if (currPos >= expr.length) return [null, currPos];
    }
  
    let num;
    [num, currPos] = this._parseNUMOperand(expr, currPos);
  
    if (num !== null) {
      operand = new Operand("NUM", num);
      return [operand, currPos];
    }
  
    const exprPart = expr.slice(currPos);
  
    for (let func of ["ln", "lg", "sin", "cos", "tan", "cot", "arcsin", "arccos", "arctan", "arccot", "abs"]) {
      if (!exprPart.startsWith(func)) continue;
  
      let arg;
      [arg, currPos] = this._parseFunctionArguments(expr, currPos + func.length, 1, variables);
      operand = new Operand(func, arg);
  
      return [operand, currPos];
    }
  
    if (exprPart.startsWith("log")) {
      let logBase, logArg;
      [logBase, logArg, currPos] = this._parseFunctionArguments(expr, currPos + 3, 2, variables);            
      operand = new Operand("log", { logBase, logArg });
      
      return [operand, currPos];
    }
  
    return [null, currPos];
  }

  _parseFunctionArguments(expr, currPos, numOfArgs = 1, variables) {  
    if (expr[currPos] !== "(") {
      throw new Error("Can't parse expression");
    }
  
    const args = [];
  
    for (let i = 0; i < numOfArgs; i++) {
      let arg;
      [arg, currPos] = this._getSubRPN(expr, currPos + 1, variables);
      args.push(arg);
  
      if (i === numOfArgs - 1) break;
  
      if (expr[currPos] !== ",") {
        throw new Error("Can't parse expression");
      }      
    }
  
    if (expr[currPos] !== ")") {
      throw new Error("Can't parse expression");
    }
  
    return [...args, currPos + 1];
  }

  _parseNUMOperand(expr, currPos) {
    if (expr[currPos] === "e") {    
      return [Math.E, currPos + 1];
    }
  
    if (expr[currPos] === "p") {    
      if (expr[currPos + 1] !== "i") {
        throw new Error("Can't parse expression");
      }
  
      return [Math.PI, currPos + 2];
    }
  
    if (this._isDigit(expr[currPos])) {    
      return this._parseNumber(expr, currPos);    
    }
  
    return [null, currPos];
  }

  _parseNumber(expr, currPos) {
    let num1, num2;
    [num1, currPos] = this._parseInt(expr, currPos);
  
    if(expr[currPos] !== ".") {
      return [+num1, currPos];
    }
    
    currPos++;
  
    if (currPos >= expr.length || !this._isDigit(expr[currPos])) {
      throw new Error("Can't parse expression");
    }
  
    [num2, currPos] = this._parseInt(expr, currPos);
  
    return [+`${num1}.${num2}`, currPos];
  }

  _parseInt(expr, currPos) {
    let num = "";
  
    while (this._isDigit(expr[currPos])) {
      num += expr[currPos];
      currPos++;
  
      if (currPos >= expr.length) break;
    }
  
    return [+num, currPos];
  }
  
  _getSubRPN(expr, currPos, variables) {
    if (currPos >= expr.length) {
      throw new Error("Can't parse expression");
    }
  
    const subRPN = this._getRPNExpression(expr, currPos, variables);
  
    if (subRPN[0] === null) {
      throw new Error("Can't parse expression");
    }
  
    return subRPN;
  }
  
  _getOperator(expr, startPos = 0) {
    let currPos = startPos;
    let char;
  
    while (expr[currPos] === " ") {
      currPos++;
  
      if (currPos >= expr.length) return [null, currPos];
    }
  
    char = expr[currPos];
  
    if (char in RPN.OPERATORS) {    
      return [RPN.OPERATORS[char], currPos + 1];
    }
    
    return [null, currPos];
  }
  
  _isDigit(char) {
    return char !== " " && !isNaN(+char);
  }
}