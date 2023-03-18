import Queue from "./Queue.js";
import Stack from "./Stack.js";
import Operand from "./classes/Operand.js";

const OPERATORS = {
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

export default class RPN {
  constructor(expr, variable = "x") {
    expr = expr.trim();
    const [rpnExpr, lastPos] = _getRPNExpression(expr, 0, variable);

    if (rpnExpr === null || lastPos < expr.length) {
      throw new Error("Can't parse expression");
    }

    this.expr = expr;
    this.rpnExpr = rpnExpr;
  }

  calcRPN(varValue) {
    const result = new Stack();
    const rpnCopy = Queue.copy(this.rpnExpr);
    let currItem = rpnCopy.shift();
    let base, arg, fItem, sItem;
  
    while (currItem !== null) {
      switch (currItem.type) {
        case "NUM":
          result.push({value: currItem.value, isVar: false});
          break;
        case "VAR":
          result.push({value: varValue, isVar: true});
          break;
        case "ln":
          arg = calcRPN(currItem.value, varValue);
  
          if (arg.value <= 0) return NaN;
  
          result.push({value: Math.log(arg.value), isVar: arg.isVar});
          break;
        case "lg":
          arg = calcRPN(currItem.value, varValue);
  
          if (arg.value <= 0) return NaN;
  
          result.push({value: Math.log10(arg.value), isVar: arg.isVar});
          break;
        case "sin":
          arg = calcRPN(currItem.value, varValue);       
          result.push({value: Math.sin(arg.value), isVar: arg.isVar});
          break;
        case "cos":
          arg = calcRPN(currItem.value, varValue);       
          result.push({value: Math.cos(arg.value), isVar: arg.isVar});
          break;
        case "tan":
          arg = calcRPN(currItem.value, varValue);       
          result.push({value: Math.tan(arg.value), isVar: arg.isVar});
          break;
        case "cot":
          arg = calcRPN(currItem.value, varValue);       
          result.push({value: 1 / Math.tan(arg.value), isVar: arg.isVar});
          break;
        case "arcsin":
          arg = calcRPN(currItem.value, varValue);       
          result.push({value: Math.asin(arg.value), isVar: arg.isVar});
          break;
        case "arccos":
          arg = calcRPN(currItem.value, varValue);       
          result.push({value: Math.acos(arg.value), isVar: arg.isVar});
          break;
        case "arctan":
          arg = calcRPN(currItem.value, varValue);       
          result.push({value: Math.atan(arg.value), isVar: arg.isVar});
          break;
        case "arccot":
          arg = calcRPN(currItem.value, varValue);       
          result.push({value: Math.PI / 2 - Math.atan(arg.value), isVar: arg.isVar});
          break;
        case "log":
          base = calcRPN(currItem.value[0], varValue);
          arg = calcRPN(currItem.value[1], varValue);
  
          if (base.value <= 0 || base.value === 1 || arg.value <= 0) return NaN;
  
          result.push({value: Math.log(arg.value) / Math.log(base.value), isVar: arg.isVar || base.isVar});
          break;
        case "u-":
          fItem = result.pop();
          result.push({value: -fItem.value, isVar: fItem.isVar});
          break;
        case "+":
          fItem = result.pop();
          sItem = result.pop();
          result.push({value: fItem.value + sItem.value, isVar: fItem.isVar || sItem.isVar});
          break;
        case "-":
          fItem = result.pop();
          sItem = result.pop();
          result.push({value: sItem.value - fItem.value, isVar: fItem.isVar || sItem.isVar});
          break;
        case "*":        
          fItem = result.pop();
          sItem = result.pop();
          result.push({value: fItem.value * sItem.value, isVar: fItem.isVar || sItem.isVar});
          break;
        case "/":
          fItem = result.pop();
          sItem = result.pop();
          result.push({value: sItem.value / fItem.value, isVar: fItem.isVar || sItem.isVar});
          break;
        case "^":
          fItem = result.pop();
          sItem = result.pop();        
                  
          if (sItem.value < 0 && fItem.isVar) return NaN;
  
          result.push({value: Math.pow(sItem.value, fItem.value), isVar: fItem.isVar || sItem.isVar});
          break;
      }
  
      currItem = rpnCopy.shift();
    }
  
    return result.pop();
  }

  _getRPNExpression(expr, startPos = 0, variable = "x") {
    const result = new Queue();
    const operators = new Stack();
    let currPos = startPos;
    let parsCounter = 0;
    let isLastOperand = false;
    let isUnaryMinus = false; 
    let operand, operator;     
  
    while (currPos < expr.length) {        
      if (!isLastOperand) {
        [operand, currPos] = _getOperand(expr, currPos, variable);
        if (operand !== null) {
          result.push(operand);          
          isUnaryMinus = false;
          isLastOperand = true;
          continue;
        }
    
        [operator, currPos] = _getOperator(expr, currPos);
    
        if (operator.type !== "(" && operator.type !== "-") return [null, currPos];
  
        if (operator.type === "-") {
          if (isUnaryMinus || expr[currPos] === " ") return [null, currPos];        
          
          isUnaryMinus = true;          
          operators.push(OPERATORS["u-"]);   
          continue;     
        }
    
        operators.push(operator[0]);
        currPos = operator[1];
        parsCounter++;
        isUnaryMinus = false;
  
        continue;
      }
    
      [operator, currPos] = _getOperator(expr, currPos);    
    
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

  _getOperand(expr, startPos = 0, variable = "x") {
    let currPos = startPos;  
    let operand;
  
    while (expr[currPos] === " ") {
      currPos++;
      if (currPos >= expr.length) return [null, currPos];
    }
  
    if (expr[currPos] === variable) {
      operand = new Operand("VAR");
      
      return [operand, currPos + 1];
    }
  
    let num;
    [num, currPos] = _parseNUMOperand(expr, currPos);
  
    if (num !== null) {
      operand = new Operand("NUM", num);
      return [operand, currPos];
    }
  
    const exprPart = expr.slice(currPos);
  
    for (let func of ["ln", "lg", "sin", "cos", "tan", "cot", "arcsin", "arccos", "arctan", "arccot"]) {
      if (!exprPart.startsWith(func)) continue;
  
      let arg;
      [arg, currPos] = _parseFunctionArguments(expr, currPos + func.length);
      operand = new Operand(type, arg);
  
      return [operand, currPos];
    }
  
    if (exprPart.startsWith("log")) {
      let logBase, logArg;
      [logBase, logArg, currPos] = _parseFunctionArguments(expr, currPos + 3, 2);            
      operand = new Operand("log", { logBase, logArg });
      
      return [operand, currPos];
    }
  
    return [null, currPos];
  }

  _parseFunctionArguments(expr, currPos, numOfArgs = 1) {  
    if (expr[currPos] !== "(") {
      throw new Error("Can't parse expression");
    }
  
    const args = [];
  
    for (let i = 0; i < numOfArgs; i++) {
      let arg;
      [arg, currPos] = _getSubRPN(expr, currPos + 1);
  
      if (i === numOfArgs - 1) break;
  
      if (expr[currPos] !== ",") {
        throw new Error("Can't parse expression");
      }
  
      args.push(arg);
    }
  
    if (expr[currPos] !== ")") {
      throw new Error("Can't parse expression");
    }
  
    return [...args, currPos];
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
  
    if (_isDigit(expr[currPos])) {    
      return _parseNumber(expr, currPos);    
    }
  
    return [null, currPos];
  }

  _parseNumber(expr, currPos) {
    let num1, num2;
    [num1, currPos] = _parseInt(expr, currPos);
  
    if(expr[currPos] !== ".") {
      return [+num1, currPos];
    }
    
    currPos++;
  
    if (currPos >= expr.length || !_isDigit(expr[currPos])) {
      throw new Error("Can't parse expression");
    }
  
    [num2, currPos] = _parseInt(expr, currPos);
  
    return [+`${num1}.${num2}`, currPos];
  }

  _parseInt(expr, currPos) {
    let num = "";
  
    while (_isDigit(expr[currPos])) {
      num += expr[currPos];
      currPos++;
  
      if (currPos >= expr.length) break;
    }
  
    return [+num, currPos];
  }
  
  _getSubRPN(expr, currPos) {
    if (currPos >= expr.length) {
      throw new Error("Can't parse expression");
    }
  
    const subRPN = getRPN(expr, currPos);
  
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
  
    if (char in OPERATORS) {    
      return [OPERATORS[char], currPos + 1];
    }
    
    return [null, currPos];
  }
  
  _isDigit(char) {
    return char !== " " && !isNaN(+char);
  }
}