import OneVariableRPN from "./classes/OneVariableRPN.js";
import Operand from "./classes/Operand.js";
import Queue from "./classes/Queue.js";
import RPN from "./classes/RPN.js";

test("Return correct operator", () => {  
  const rpn = new RPN();
  for (let key of Object.keys(RPN.OPERATORS)) {
    if (key === "u-") continue;

    const expr = `  ${key}`;    
    expect(rpn._getOperator(expr, 1)).toEqual([RPN.OPERATORS[key], expr.length]);
    expect(rpn._getOperator("a")[0]).toBeNull();
  }
});

test("Return correct operand", () => {  
  const varValue = new Queue();
  const rpn = new OneVariableRPN();
  varValue.push(new Operand("INDEPENDENT_VAR"));

  expect(rpn._getOperand("  z", 1, ["z"])).toEqual([new Operand("INDEPENDENT_VAR", null), 3]);
  expect(rpn._getOperand("  x", 1)).toEqual([new Operand("INDEPENDENT_VAR", null), 3]);
  expect(rpn._getOperand("  e", 1)).toEqual([new Operand("NUM", Math.E), 3]);
  expect(rpn._getOperand("  pi", 1)).toEqual([new Operand("NUM", Math.PI), 4]);
  expect(rpn._getOperand("  123", 1)).toEqual([new Operand("NUM", 123), 5]);
  expect(rpn._getOperand("  12.3", 1)).toEqual([new Operand("NUM", 12.3), 6]);
  expect(rpn._getOperand("  ln(x)", 1)).toEqual([new Operand("ln", varValue), 7]);
  expect(rpn._getOperand("  lg(x)", 1)).toEqual([new Operand("lg", varValue), 7]);
  expect(rpn._getOperand("  sin(x)", 1)).toEqual([new Operand("sin", varValue), 8]);
  expect(rpn._getOperand("  cos(x)", 1)).toEqual([new Operand("cos", varValue), 8]);
  expect(rpn._getOperand("  tan(x)", 1)).toEqual([new Operand("tan", varValue), 8]);
  expect(rpn._getOperand("  cot(x)", 1)).toEqual([new Operand("cot", varValue), 8]);
  expect(rpn._getOperand("  arcsin(x)", 1)).toEqual([new Operand("arcsin", varValue), 11]);
  expect(rpn._getOperand("  arccos(x)", 1)).toEqual([new Operand("arccos", varValue), 11]);
  expect(rpn._getOperand("  arctan(x)", 1)).toEqual([new Operand("arctan", varValue), 11]);
  expect(rpn._getOperand("  arccot(x)", 1)).toEqual([new Operand("arccot", varValue), 11]);
  expect(rpn._getOperand("  log(x, x)", 1)).toEqual([new Operand("log", { logBase: varValue, logArg: varValue }), 11]);

  try {
    expect(rpn._getOperand("ln()")[0]).toBeNull();    
    expect(1).toEqual(2);
  } catch {
    expect(1).toEqual(1);
  }
  try {
    expect(rpn._getOperand("ln(3")[0]).toBeNull();    
    expect(1).toEqual(2);
  } catch {
    expect(1).toEqual(1);
  }
  try {
    expect(rpn._getOperand("log(3,")[0]).toBeNull();    
    expect(1).toEqual(2);
  } catch {
    expect(1).toEqual(1);
  }
  try {
    expect(rpn._getOperand("log(3,)")[0]).toBeNull();    
    expect(1).toEqual(2);
  } catch {
    expect(1).toEqual(1);
  }
  try {
    expect(rpn._getOperand("log(,3)")[0]).toBeNull();    
    expect(1).toEqual(2);
  } catch {
    expect(1).toEqual(1);
  }
  try {
    expect(rpn._getOperand("12.")[0]).toBeNull();    
    expect(1).toEqual(2);
  } catch {
    expect(1).toEqual(1);
  }
  try {
    expect(rpn._getOperand("a")[0]).toBeNull();
    expect(1).toEqual(2);
  } catch {
    expect(1).toEqual(1);
  }
});

test("Return correct RPN", () => {    
  const rpn = new OneVariableRPN();
  expect(getRPNFields(new OneVariableRPN("x").rpnExpr)).toEqual([rpn._getOperand("x")[0]]);
  expect(getRPNFields(new OneVariableRPN("-x").rpnExpr)).toEqual([rpn._getOperand("x")[0], RPN.OPERATORS["u-"]]);
  expect(getRPNFields(new OneVariableRPN("x + 2").rpnExpr)).toEqual([rpn._getOperand("x")[0], rpn._getOperand("2")[0], RPN.OPERATORS["+"]]);
  expect(getRPNFields(new OneVariableRPN("x - 2").rpnExpr)).toEqual([rpn._getOperand("x")[0], rpn._getOperand("2")[0], RPN.OPERATORS["-"]]);
  expect(getRPNFields(new OneVariableRPN("x * 2").rpnExpr)).toEqual([rpn._getOperand("x")[0], rpn._getOperand("2")[0], RPN.OPERATORS["*"]]);
  expect(getRPNFields(new OneVariableRPN("x / 2").rpnExpr)).toEqual([rpn._getOperand("x")[0], rpn._getOperand("2")[0], RPN.OPERATORS["/"]]);
  expect(getRPNFields(new OneVariableRPN("1 + 2 * 3").rpnExpr)).toEqual([rpn._getOperand("1")[0], rpn._getOperand("2")[0], rpn._getOperand("3")[0], RPN.OPERATORS["*"], RPN.OPERATORS["+"]]);
  expect(getRPNFields(new OneVariableRPN("(1 + 2) * 3").rpnExpr)).toEqual([rpn._getOperand("1")[0], rpn._getOperand("2")[0], RPN.OPERATORS["+"], rpn._getOperand("3")[0], RPN.OPERATORS["*"]]);
  expect(getRPNFields(new OneVariableRPN("1 + -2 * 3").rpnExpr)).toEqual([rpn._getOperand("1")[0], rpn._getOperand("2")[0], RPN.OPERATORS["u-"], rpn._getOperand("3")[0], RPN.OPERATORS["*"], RPN.OPERATORS["+"]]);

  try {
    expect(getRPN("xx")).toBeNull();
    expect(1).toEqual(2);
  } catch {
    expect(1).toEqual(1);
  }
  try {
    expect(getRPN("2++3")).toBeNull();  
    expect(1).toEqual(2);
  } catch {
    expect(1).toEqual(1);
  }
  try {
    expect(getRPN("+5")).toBeNull();  
    expect(1).toEqual(2);
  } catch {
    expect(1).toEqual(1);
  }
  try {
    expect(getRPN("2**4")).toBeNull();  
    expect(1).toEqual(2);
  } catch {
    expect(1).toEqual(1);
  }
  try {    
    expect(getRPN("* 4")).toBeNull();
    expect(1).toEqual(2);
  } catch {
    expect(1).toEqual(1);
  }  

  function getRPNFields(rnp) {
    const result = [];
    let currItem = rnp.head;
  
    while (currItem !== null) {
      result.push(currItem.value);
      currItem = currItem.next;      
    }

    return result;
  }
});

test("Return correct RPN value", () => {
  for (let i = 0; i < 100; i++) {
    const randValue1 = Math.random() * 10000 - 5000;
    const randValue2 = Math.random() * 10000 - 5000;
    const randNormalizedValue = Math.random() * 2 - 1;
    const randSmallValue1 = Math.random() * 10 - 5;
    const randSmallValue2 = Math.random() * 10 - 5;
    console.log(randValue1);
    console.log(randValue2);
    console.log(randSmallValue1);
    console.log(randSmallValue2);
    
    expect(new OneVariableRPN(`x + ${randValue2}`).getValueInPoint(randValue1)).toBeCloseTo(randValue1 + randValue2);
    expect(new OneVariableRPN(`x - ${randValue2}`).getValueInPoint(randValue1)).toBeCloseTo(randValue1 - randValue2);
    expect(new OneVariableRPN(`x * ${randValue2}`).getValueInPoint(randValue1)).toBeCloseTo(randValue1 * randValue2);
    expect(new OneVariableRPN(`x / ${randValue2}`).getValueInPoint(randValue1)).toBeCloseTo(randValue1 / randValue2);
    expect(new OneVariableRPN("sin(x)").getValueInPoint(randValue1)).toBeCloseTo(Math.sin(randValue1));
    expect(new OneVariableRPN("cos(x)").getValueInPoint(randValue1)).toBeCloseTo(Math.cos(randValue1));
    expect(new OneVariableRPN("tan(x)").getValueInPoint(randValue1)).toBeCloseTo(Math.tan(randValue1));
    expect(new OneVariableRPN("cot(x)").getValueInPoint(randValue1)).toBeCloseTo(1 / Math.tan(randValue1));
    expect(new OneVariableRPN("arcsin(x)").getValueInPoint(randNormalizedValue)).toBeCloseTo(Math.asin(randNormalizedValue));
    expect(new OneVariableRPN("arccos(x)").getValueInPoint(randNormalizedValue)).toBeCloseTo(Math.acos(randNormalizedValue));
    expect(new OneVariableRPN("arctan(x)").getValueInPoint(randValue1)).toBeCloseTo(Math.atan(randValue1));
    expect(new OneVariableRPN("arccot(x)").getValueInPoint(randValue1)).toBeCloseTo(Math.PI / 2 - Math.atan(randValue1));
    expect(new OneVariableRPN("e^x").getValueInPoint(randSmallValue1)).toBeCloseTo(Math.E**randSmallValue1);
    expect(new OneVariableRPN(`x^${randSmallValue1}`).getValueInPoint(Math.abs(randSmallValue2))).toBeCloseTo(Math.abs(randSmallValue2)**randSmallValue1);
    expect(new OneVariableRPN(`${Math.abs(randSmallValue1)}^x`).getValueInPoint(randSmallValue2)).toBeCloseTo(Math.abs(randSmallValue1)**randSmallValue2);
    expect(new OneVariableRPN("ln(x)").getValueInPoint(Math.abs(randValue1))).toBeCloseTo(Math.log(Math.abs(randValue1)));
    expect(new OneVariableRPN("lg(x)").getValueInPoint(Math.abs(randValue1))).toBeCloseTo(Math.log10(Math.abs(randValue1)));
    expect(new OneVariableRPN(`log(${Math.abs(randValue1)}, x)`).getValueInPoint(Math.abs(randValue2))).toBeCloseTo(Math.log(Math.abs(randValue2)) / Math.log(Math.abs(randValue1)));
  }
});