import RPN from "./RPN.js";
import OneVariableRPN from "./OneVariableRPN.js";
import Operand from "./Operand.js";
import Queue from "./Queue.js";

export default class ImplicitRPN extends RPN {
  constructor (expr1 = "0", expr2 = "0", var1 = "x", var2 = "y") {
    super(`(${expr1})-(${expr2})`, var1, var2);
  }

  getValuesInPoint(varValue, upperBound, lowerBound) {   
    const rpnCopy = ImplicitRPN.copy(this);
    rpnCopy._substituteVariable(rpnCopy.rpnExpr, varValue);
    const oneVarRPN = new OneVariableRPN("");
    oneVarRPN.rpnExpr = rpnCopy.rpnExpr;

    return OneVariableRPN.getIntersectionPoints(oneVarRPN, new OneVariableRPN("0"), lowerBound, upperBound, (upperBound - lowerBound) / 1).map(point => point.x);
  }

  _substituteVariable(rpnExpr, varValue) {
    let currItem = rpnExpr.head;

    while (currItem !== null) {
      if (currItem.value.type === "INDEPENDENT_VAR") {
        currItem.value = new Operand("NUM", varValue);
      } else if (currItem.value.type === "DEPENDENT_VAR") {
        currItem.value = new Operand("INDEPENDENT_VAR");
      } else if (currItem.value.value instanceof Queue) {
        currItem.value = new Operand(currItem.value.type, Queue.copy(currItem.value.value));
        this._substituteVariable(currItem.value.value, varValue);
      }

      currItem = currItem.next;
    }
  }

  _getOperand(expr, startPos = 0, [var1, var2]) {
    let [operand, currPos] = super._getOperand(expr, startPos, var1);

    if (operand !== null) {
      return [operand, currPos];
    }

    if (expr[currPos] === var1) {
      operand = new Operand("INDEPENDENT_VAR");
      
      return [operand, currPos + 1];
    }

    if (expr[currPos] === var2) {
      operand = new Operand("DEPENDENT_VAR");
      
      return [operand, currPos + 1];
    }

    return [null, currPos];
  }
}