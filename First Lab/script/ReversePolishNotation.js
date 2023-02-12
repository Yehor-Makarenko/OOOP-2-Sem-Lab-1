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

function calcReversePolishNotation(reversePolishNotation, varValue) {
  const result = new Stack();
  const reversePolishNotationCopy = Queue.copy(reversePolishNotation);
  let currItem = reversePolishNotationCopy.shift();
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
        arg = calcReversePolishNotation(currItem.value, varValue);

        if (arg.value <= 0) return NaN;

        result.push({value: Math.log(arg.value), isVar: arg.isVar});
        break;
      case "lg":
        arg = calcReversePolishNotation(currItem.value, varValue);

        if (arg.value <= 0) return NaN;

        result.push({value: Math.log10(arg.value), isVar: arg.isVar});
        break;
      case "sin":
        arg = calcReversePolishNotation(currItem.value, varValue);       
        result.push({value: Math.sin(arg.value), isVar: arg.isVar});
        break;
      case "cos":
        arg = calcReversePolishNotation(currItem.value, varValue);       
        result.push({value: Math.cos(arg.value), isVar: arg.isVar});
        break;
      case "tan":
        arg = calcReversePolishNotation(currItem.value, varValue);       
        result.push({value: Math.tan(arg.value), isVar: arg.isVar});
        break;
      case "cot":
        arg = calcReversePolishNotation(currItem.value, varValue);       
        result.push({value: 1 / Math.tan(arg.value), isVar: arg.isVar});
        break;
      case "arcsin":
        arg = calcReversePolishNotation(currItem.value, varValue);       
        result.push({value: Math.asin(arg.value), isVar: arg.isVar});
        break;
      case "arccos":
        arg = calcReversePolishNotation(currItem.value, varValue);       
        result.push({value: Math.acos(arg.value), isVar: arg.isVar});
        break;
      case "arctan":
        arg = calcReversePolishNotation(currItem.value, varValue);       
        result.push({value: Math.atan(arg.value), isVar: arg.isVar});
        break;
      case "arccot":
        arg = calcReversePolishNotation(currItem.value, varValue);       
        result.push({value: Math.PI / 2 - Math.atan(arg.value), isVar: arg.isVar});
        break;
      case "log":
        base = calcReversePolishNotation(currItem.value[0], varValue);
        arg = calcReversePolishNotation(currItem.value[1], varValue);

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

    currItem = reversePolishNotationCopy.shift();
  }

  return result.pop();

}

function getReversePolishNotation(expr, startPos = 0, variable = "x") {
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
  const operand = {
    type: null,
    value: null
  }

  while (expr[currPos] === " ") {
    currPos++;
    if (currPos >= expr.length) return null;
  }

  if (expr[currPos] === variable) {
    operand.type = "VAR";
    
    return [operand, currPos + 1];
  }

  if (expr[currPos] === "e") {
    operand.type = "NUM";
    operand.value = Math.E;

    return [operand, currPos + 1];
  }

  if (expr[currPos] === "p") {
    currPos++;

    if (currPos >= expr.length || expr[currPos] !== "i") return null;

    operand.type = "NUM";
    operand.value = Math.PI;

    return [operand, currPos + 1];
  }

  if (isDigit(expr[currPos])) {
    let num = "";

    while (isDigit(expr[currPos])) {
      num += expr[currPos];
      currPos++;

      if (currPos >= expr.length) break;
    }

    if (currPos < expr.length && expr[currPos] === ".") {
      num += ".";
      currPos++;

      if (currPos >= expr.length || !isDigit(expr[currPos])) return null;

      while (isDigit(expr[currPos])) {
        num += expr[currPos];
        currPos++;
  
        if (currPos >= expr.length) break;
      }
    }

    operand.type = "NUM";
    operand.value = +num;    

    return [operand, currPos];
  }

  const exprPart = expr.slice(currPos);

  if (exprPart.startsWith("ln(") || exprPart.startsWith("lg(") || exprPart.startsWith("sin(") || exprPart.startsWith("cos(") 
    || exprPart.startsWith("tan(") || exprPart.startsWith("cot(") || exprPart.startsWith("arcsin(") || exprPart.startsWith("arccos(") 
    || exprPart.startsWith("arctan(") || exprPart.startsWith("arccot(")) {
    let type = "";

    while(expr[currPos] !== "(") {
      type += expr[currPos];
      currPos++;
    }

    const argData = getReversePolishNotation(expr, currPos + 1);

    if (argData === null) return null;

    currPos = argData[1];

    if (currPos >= expr.length) return null;

    if (expr[currPos] !== ")") return null;

    operand.type = type;
    operand.value = argData[0];
    
    return [operand, currPos + 1];
  }

  if (exprPart.startsWith("log(")) {
    const logBaseData = getReversePolishNotation(expr, currPos + 4);

    if (logBaseData === null) return null;

    currPos = logBaseData[1];

    if (currPos >= expr.length) return null;

    if (expr[currPos] !== ",") return null;

    const logArgData = getReversePolishNotation(expr, currPos + 1);

    if (logArgData === null) return null;

    currPos = logArgData[1];

    if (currPos >= expr.length) return null;

    if (expr[currPos] !== ")") return null;

    operand.type = "log";
    operand.value = [logBaseData[0], logArgData[0]];
    
    return [operand, currPos + 1];
  }

  return null;
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
  return null;
}

function isDigit(char) {
  return char !== " " && !isNaN(+char);
}