import RPN from "./RPN.js";
import Operand from "./Operand.js";
import Point from "./Point.js";
import Stack from "./Stack.js";
import Queue from "./Queue.js";

export default class OneVariableRPN extends RPN {
  constructor (expr = "", variable = "x") {
    super(expr, variable);    
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

  _calcRPNExpression(rpnExpr, varValue) {
    const result = new Stack();
    const rpnExprCopy = Queue.copy(rpnExpr);
    let currItem = rpnExprCopy.shift();
    let base, arg, fItem, sItem;
  
    while (currItem !== null) {
      switch (currItem.type) {
        case "NUM":
          result.push({ value: currItem.value, isVar: false });
          break;
        case "INDEPENDENT_VAR":
          result.push({ value: varValue, isVar: true });
          break;
        case "ln":
          arg = this._calcRPNExpression(currItem.value, varValue);
  
          if (arg.value <= 0) return NaN;
  
          result.push({ value: Math.log(arg.value), isVar: arg.isVar });
          break;
        case "lg":
          arg = this._calcRPNExpression(currItem.value, varValue);
  
          if (arg.value <= 0) return NaN;
  
          result.push({ value: Math.log10(arg.value), isVar: arg.isVar });
          break;
        case "sin":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({ value: Math.sin(arg.value), isVar: arg.isVar });
          break;
        case "cos":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({ value: Math.cos(arg.value), isVar: arg.isVar });
          break;
        case "tan":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({ value: Math.tan(arg.value), isVar: arg.isVar });
          break;
        case "cot":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({ value: 1 / Math.tan(arg.value), isVar: arg.isVar });
          break;
        case "arcsin":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({ value: Math.asin(arg.value), isVar: arg.isVar });
          break;
        case "arccos":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({ value: Math.acos(arg.value), isVar: arg.isVar });
          break;
        case "arctan":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({ value: Math.atan(arg.value), isVar: arg.isVar });
          break;
        case "arccot":
          arg = this._calcRPNExpression(currItem.value, varValue);       
          result.push({ value: Math.PI / 2 - Math.atan(arg.value), isVar: arg.isVar });
          break;
        case "abs":
          arg = this._calcRPNExpression(currItem.value, varValue);
          result.push({ value: Math.abs(arg.value), isVar: arg.isVar });
          break;
        case "log":
          base = this._calcRPNExpression(currItem.value.logBase, varValue);
          arg = this._calcRPNExpression(currItem.value.logArg, varValue);
  
          if (base.value <= 0 || base.value === 1 || arg.value <= 0) return NaN;
  
          result.push({ value: Math.log(arg.value) / Math.log(base.value), isVar: arg.isVar || base.isVar });
          break;
        case "u-":
          fItem = result.pop();
          result.push({value: -fItem.value, isVar: fItem.isVar });
          break;
        case "+":
          fItem = result.pop();
          sItem = result.pop();
          result.push({value: fItem.value + sItem.value, isVar: fItem.isVar || sItem.isVar });
          break;
        case "-":
          fItem = result.pop();
          sItem = result.pop();
          result.push({ value: sItem.value - fItem.value, isVar: fItem.isVar || sItem.isVar });
          break;
        case "*":        
          fItem = result.pop();
          sItem = result.pop();
          result.push({ value: fItem.value * sItem.value, isVar: fItem.isVar || sItem.isVar });
          break;
        case "/":
          fItem = result.pop();
          sItem = result.pop();
          result.push({ value: sItem.value / fItem.value, isVar: fItem.isVar || sItem.isVar });
          break;
        case "^":
          fItem = result.pop();
          sItem = result.pop();        
                  
          if (sItem.value < 0 && fItem.isVar) return NaN;
  
          result.push({ value: Math.pow(sItem.value, fItem.value), isVar: fItem.isVar || sItem.isVar });
          break;
      }
  
      currItem = rpnExprCopy.shift();
    }
  
    return result.pop();
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

  _getOperand(expr, startPos = 0, [variable]) {
    let [operand, currPos] = super._getOperand(expr, startPos, [variable]);

    if (operand !== null) {
      return [operand, currPos];
    }

    if (expr[currPos] === variable) {
      operand = new Operand("INDEPENDENT_VAR");
      
      return [operand, currPos + 1];
    }

    return [null, currPos];
  }
}
