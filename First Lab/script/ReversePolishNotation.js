import Stack from "./classes/Stack.js";
import Queue from "./classes/Queue.js";
import Operand from "./classes/Operand.js";
export { calcRPN, getRPN, getOperand, getOperator, OPERATORS };

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

function calcRPN(rpn, varValue) {
  const result = new Stack();
  const rpnCopy = Queue.copy(rpn);
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

function getRPN(expr, startPos = 0, variable = "x") {
  const result = new Queue();
  const operators = new Stack();
  let currPos = startPos;
  let parsCounter = 0;
  let isLastOperand = false;
  let isUnaryMinus = false;  

  while (currPos < expr.length) {        
    if (!isLastOperand) {
      const operandData = getOperand(expr, currPos, variable);
      if (operandData !== null) {
        result.push(operandData[0]);
        currPos = operandData[1];
        isLastOperand = true;
        continue;
      }
  
      const operatorData = getOperator(expr, currPos);
  
      if (operatorData === null || (operatorData[0].type !== "(" && operatorData[0].type !== "-")) return null;

      if (operatorData[0].type === "-") {
        if (isUnaryMinus || operatorData[1] >= expr.length || expr[operatorData[1] === " "]) return null;        
        
        currPos = operatorData[1];
        operators.push(OPERATORS["u-"]);   
        continue;     
      }
  
      operators.push(operatorData[0]);
      currPos = operatorData[1];
      parsCounter++;
      isUnaryMinus = false;

      continue;
    }
  
    const operatorData = getOperator(expr, currPos);

    isUnaryMinus = false;
  
    if (operatorData === null || operatorData[0].type === "(") return null;
  
    if (operatorData[0].type === ")") {
      let lastOperator = operators.pop();
  
      while (lastOperator !== null && lastOperator.type !== "(") {
        result.push(lastOperator);
        lastOperator = operators.pop();
      }
  
      if (parsCounter === 0) return [result, operatorData[1] - 1];
  
      currPos = operatorData[1];
      parsCounter--;
      continue;
    }    
  
    let lastOperator = operators.get();
  
    while (lastOperator !== null && lastOperator.priority >= operatorData[0].priority) {
      result.push(operators.pop());
      lastOperator = operators.get();
    }

    if (operatorData[0].type === ",") {
      if (parsCounter > 0) return null;

      return [result, operatorData[1] - 1];
    }
  
    currPos = operatorData[1];
    operators.push(operatorData[0]);
    isLastOperand = false;
  }

  if (parsCounter > 0 || !isLastOperand) return null;

  while (operators.length > 0) {
    result.push(operators.pop());
  }

  return [result, currPos];
}

function getOperand(expr, startPos = 0, variable = "x") {
  let currPos = startPos;  
  let operand;

  while (expr[currPos] === " ") {
    currPos++;
    if (currPos >= expr.length) return null;
  }

  if (expr[currPos] === variable) {
    operand.type = "VAR";
    
    return [operand, currPos + 1];
  }

  let num;
  [num, currPos] = parseNumber(expr, currPos);

  if (num !== null) {
    operand = new Operand("NUM", num);
    return [operand, currPos];
  }

  const exprPart = expr.slice(currPos);

  for (let func of ["ln", "lg", "sin", "cos", "tan", "cot", "arcsin", "arccos", "arctan", "arccot"]) {
    if (!exprPart.startsWith(func)) continue;

    let arg;
    [arg, currPos] = parseFunctionArguments(expr, currPos + func.length);
    operand = new Operand(type, arg);

    return [operand, currPos];
  }

  if (exprPart.startsWith("log")) {
    let logBase, logArg;
    [logBase, logArg, currPos] = parseFunctionArguments(expr, currPos + 3, 2);            
    operand = new Operand("log", { logBase, logArg });
    
    return [operand, currPos];
  }

  throw new Error("Can't parse expression");
}

function parseFunctionArguments(expr, currPos, numOfArgs = 1) {  
  if (expr[currPos] !== "(") {
    throw new Error("Can't parse expression");
  }

  const args = [];

  for (let i = 0; i < numOfArgs; i++) {
    let arg;
    [arg, currPos] = getSubRPN(expr, currPos + 1);

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

function parseNUMOperand(expr, currPos) {
  if (expr[currPos] === "e") {    
    return [Math.E, currPos + 1];
  }

  if (expr[currPos] === "p") {    
    if (expr[currPos + 1] !== "i") {
      throw new Error("Can't parse expression");
    }

    return [Math.PI, currPos + 2];
  }

  if (isDigit(expr[currPos])) {    
    return parseNumber(expr, currPos);    
  }

  return [null, currPos];
}

function parseNumber(expr, currPos) {
  let num1, num2;
  [num1, currPos] = parseInt(expr, currPos);

  if(expr[currPos] !== ".") {
    return [+num, currPos];
  }
  
  currPos++;

  if (currPos >= expr.length || !isDigit(expr[currPos])) {
    throw new Error("Can't parse expression");
  }

  [num2, currPos] = parseInt(expr, currPos);

  return [+`${num1}.${num2}`, currPos];
}

function parseInt(expr, currPos) {
  let num = "";

  while (isDigit(expr[currPos])) {
    num += expr[currPos];
    currPos++;

    if (currPos >= expr.length) break;
  }

  return [+num, currPos];
}

function getSubRPN(expr, currPos) {
  if (currPos >= expr.length) {
    throw new Error("Can't parse expression");
  }

  const subfunction = getRPN(expr, currPos);

  if (subfunction[0] === null || subfunction[1] >= expr.length) {
    throw new Error("Can't parse expression");
  }

  return subfunction;
}

function getOperator(expr, startPos = 0) {
  let currPos = startPos;
  let char;

  while (expr[currPos] === " ") {
    currPos++;

    if (currPos >= expr.length) return null;
  }

  char = expr[currPos];

  if (char in OPERATORS) {    
    return [OPERATORS[char], currPos + 1];
  }
  
  throw new Error("Can't parse expression");
}

function isDigit(char) {
  return char !== " " && !isNaN(+char);
}