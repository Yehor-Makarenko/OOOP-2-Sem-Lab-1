import { calcReversePolishNotation, getReversePolishNotation, getOperand, getOperator, OPERATORS } from "./ReversePolishNotation.js";
import Queue from "./classes/Queue.js";

test("Return correct operator", () => {  
  for (let key of Object.keys(OPERATORS)) {
    if (key === "u-") continue;

    const expr = `  ${key}`;    
    expect(getOperator(expr, 1)).toEqual([OPERATORS[key], expr.length]);
    expect(getOperator("a")).toBeNull();
  }
});

test("Return correct operand", () => {  
  const varValue = new Queue();
  varValue.push({ type: "VAR", value: null });

  expect(getOperand("  z", 1, "z")).toEqual([{ type: "VAR", value: null }, 3]);
  expect(getOperand("  x", 1)).toEqual([{ type: "VAR", value: null }, 3]);
  expect(getOperand("  e", 1)).toEqual([{ type: "NUM", value: Math.E }, 3]);
  expect(getOperand("  pi", 1)).toEqual([{ type: "NUM", value: Math.PI }, 4]);
  expect(getOperand("  123", 1)).toEqual([{ type: "NUM", value: 123 }, 5]);
  expect(getOperand("  12.3", 1)).toEqual([{ type: "NUM", value: 12.3 }, 6]);
  expect(getOperand("  ln(x)", 1)).toEqual([{ type: "ln", value: varValue }, 7]);
  expect(getOperand("  lg(x)", 1)).toEqual([{ type: "lg", value: varValue }, 7]);
  expect(getOperand("  sin(x)", 1)).toEqual([{ type: "sin", value: varValue }, 8]);
  expect(getOperand("  cos(x)", 1)).toEqual([{ type: "cos", value: varValue }, 8]);
  expect(getOperand("  tan(x)", 1)).toEqual([{ type: "tan", value: varValue }, 8]);
  expect(getOperand("  cot(x)", 1)).toEqual([{ type: "cot", value: varValue }, 8]);
  expect(getOperand("  arcsin(x)", 1)).toEqual([{ type: "arcsin", value: varValue }, 11]);
  expect(getOperand("  arccos(x)", 1)).toEqual([{ type: "arccos", value: varValue }, 11]);
  expect(getOperand("  arctan(x)", 1)).toEqual([{ type: "arctan", value: varValue }, 11]);
  expect(getOperand("  arccot(x)", 1)).toEqual([{ type: "arccot", value: varValue }, 11]);
  expect(getOperand("  log(x, x)", 1)).toEqual([{ type: "log", value: [varValue, varValue] }, 11]);

  expect(getOperand("ln()")).toBeNull();
  expect(getOperand("ln(3")).toBeNull();
  expect(getOperand("log(3,")).toBeNull();
  expect(getOperand("log(3,)")).toBeNull();
  expect(getOperand("log(,3)")).toBeNull();
  expect(getOperand("12.")).toBeNull();
  expect(getOperand("a")).toBeNull();
});

