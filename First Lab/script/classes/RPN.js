import Queue from "./Queue.js";
import Stack from "./Stack.js";
import Operand from "./Operand.js";
import Point from "./Point.js";

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
    const [rpnExpr, lastPos] = this._getRPNExpression(expr, 0, variable);

    if (rpnExpr === null || lastPos < expr.length) {
      throw new Error("Can't parse expression");
    }

    this.expr = expr;
    this.rpnExpr = rpnExpr;
  }

  getValueInPoint(varValue) {    
    return this._calcRPNExpression(this.rpnExpr, varValue).value;
  }

  static getIntersectionPoints(rpn1, rpn2, lBound, rBound, numOfIntervals = 1000) {  
    const deltaX = (rBound - lBound) / numOfIntervals;
    const resultPoints = [];
  
    const resultRPN = RPN.merge(rpn1, rpn2, "-");    
  
    for (let i = 0; i < numOfIntervals; i++) {
      const x1 = lBound + i * deltaX;
      const x2 = lBound + (i + 1) * deltaX;
      const y1 = resultRPN.getValueInPoint(x1);
      const y2 = resultRPN.getValueInPoint(x2);    
      let resultX;
  
      if (y1 === 0) {
        resultPoints.push(new Point(x1, rpn1.getValueInPoint(x1)));
        continue;
      } else if (y2 === 0) {
        if (i === numOfIntervals - 1) resultPoints.push(new Point(x2, rpn1.getValueInPoint(x2)));
        continue;
      }
      
      if (!isFinite(y1) || !isFinite(y2)) continue;
  
      if (y1 * y2 > 0) continue;
  
      resultX = rpn1._newtonMethod(resultRPN, x1 + 0.00001, 0.00001);
      resultPoints.push(new Point(resultX, rpn1.getValueInPoint(resultX)));
    }
  
    return resultPoints;
  }

  static merge(rpn1, rpn2, operatorChar) {
    const operator = rpn1._getOperator(operatorChar)[0];

    if (operatorChar.length > 1 || operator === null) {
      throw new Error("Can't merge rpns");
    }

    const mergedRPNExpression = Queue.concat(rpn1.rpnExpr, rpn2.rpnExpr);
    mergedRPNExpression.push(operator);
    const mergedRPN = new RPN("");
    mergedRPN.expr = rpn1.expr + operatorChar + rpn2.expr;
    mergedRPN.rpnExpr = mergedRPNExpression;

    return mergedRPN;
  }

  static copy(rpn) {
    const rpnExprCopy = new RPN("");
    rpnExprCopy.rpnExpr = Queue.copy(rpn.rpnExpr);
    rpnExprCopy.expr = rpn.expr;

    return rpnExprCopy;
  }

  _calcRPNExpression(rpnExpr, varValue) {
    const result = new Stack();
    const rpnExprCopy = Queue.copy(rpnExpr);
    let currItem = rpnExprCopy.shift();
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
          arg = this._calcRPNExpression(currItem.value, varValue);
  
          if (arg.value <= 0) return NaN;
  
          result.push({value: Math.log(arg.value), isVar: arg.isVar});
          break;
        case "lg":
          arg = this._calcRPNExpression(currItem.value, varValue);
  
          if (arg.value <= 0) return NaN;
  
          result.push({value: Math.log10(arg.value), isVar: arg.isVar});
          break;
        case "sin":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({value: Math.sin(arg.value), isVar: arg.isVar});
          break;
        case "cos":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({value: Math.cos(arg.value), isVar: arg.isVar});
          break;
        case "tan":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({value: Math.tan(arg.value), isVar: arg.isVar});
          break;
        case "cot":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({value: 1 / Math.tan(arg.value), isVar: arg.isVar});
          break;
        case "arcsin":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({value: Math.asin(arg.value), isVar: arg.isVar});
          break;
        case "arccos":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({value: Math.acos(arg.value), isVar: arg.isVar});
          break;
        case "arctan":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({value: Math.atan(arg.value), isVar: arg.isVar});
          break;
        case "arccot":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({value: Math.PI / 2 - Math.atan(arg.value), isVar: arg.isVar});
          break;
        case "log":
          base = this._calcRPNExpression(currItem.value[0], varValue);
          arg = this._calcRPNExpression(currItem.value[1], varValue);
  
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
  
      currItem = rpnExprCopy.shift();
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

    if (expr.trim() === "") return [result, 0];
  
    while (currPos < expr.length) {        
      if (!isLastOperand) {
        [operand, currPos] = this._getOperand(expr, currPos, variable);
        if (operand !== null) {
          result.push(operand);          
          isUnaryMinus = false;
          isLastOperand = true;
          continue;
        }
    
        [operator, currPos] = this._getOperator(expr, currPos);
    
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

  _newtonMethod(rpn, firstX, accuracy) {    
    let currX = firstX;
    let prevX = currX + accuracy + 1;
  
    while (Math.abs(currX - prevX) > accuracy) {          
      const derivative = (rpn.getValueInPoint(currX + accuracy) - rpn.getValueInPoint(currX - accuracy)) / (2 * accuracy);
      [currX, prevX] = [currX - rpn.getValueInPoint(currX) / derivative, currX];    
    }
  
    return currX;
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
    [num, currPos] = this._parseNUMOperand(expr, currPos);
  
    if (num !== null) {
      operand = new Operand("NUM", num);
      return [operand, currPos];
    }
  
    const exprPart = expr.slice(currPos);
  
    for (let func of ["ln", "lg", "sin", "cos", "tan", "cot", "arcsin", "arccos", "arctan", "arccot"]) {
      if (!exprPart.startsWith(func)) continue;
  
      let arg;
      [arg, currPos] = this._parseFunctionArguments(expr, currPos + func.length);
      operand = new Operand(func, arg);
  
      return [operand, currPos];
    }
  
    if (exprPart.startsWith("log")) {
      let logBase, logArg;
      [logBase, logArg, currPos] = this._parseFunctionArguments(expr, currPos + 3, 2);            
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
      [arg, currPos] = this._getSubRPN(expr, currPos + 1);
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
  
  _getSubRPN(expr, currPos) {
    if (currPos >= expr.length) {
      throw new Error("Can't parse expression");
    }
  
    const subRPN = this._getRPNExpression(expr, currPos);
  
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