import { getIntersectionPoints, newtonMethod } from "./Intersection.js";
import { getReversePolishNotation } from "./ReversePolishNotation.js";
import Point from "./classes/Point.js";

test("Test Newton's method", () => {
  expect(newtonMethod(getReversePolishNotation("2/x + 5")[0], -0.1, 0.001)).toBeCloseTo(-0.4);
  expect(newtonMethod(getReversePolishNotation("2*x - 2^0.5")[0], 1, 0.001)).toBeCloseTo(Math.sqrt(2) / 2);
  expect(newtonMethod(getReversePolishNotation("x^2 + 3*x - 1")[0], 1, 0.001)).toBeCloseTo((-3 + Math.sqrt(13)) / 2);
  expect(newtonMethod(getReversePolishNotation("x^2 + 3*x - 1")[0], -5, 0.001)).toBeCloseTo((-3 - Math.sqrt(13)) / 2);
  expect(newtonMethod(getReversePolishNotation("sin(x-1)")[0], 2, 0.001)).toBeCloseTo(1);
  expect(newtonMethod(getReversePolishNotation("cos(x)")[0], 1, 0.001)).toBeCloseTo(Math.PI / 2);
  expect(newtonMethod(getReversePolishNotation("tan(x)")[0], 3, 0.001)).toBeCloseTo(Math.PI);
  expect(newtonMethod(getReversePolishNotation("cot(x)")[0], 1.5, 0.001)).toBeCloseTo(Math.PI / 2);
  expect(newtonMethod(getReversePolishNotation("arcsin(x+5)")[0], -5.5, 0.001)).toBeCloseTo(-5);
  expect(newtonMethod(getReversePolishNotation("arccos(x) - pi / 4")[0], 0, 0.001)).toBeCloseTo(Math.sqrt(2) / 2);
  expect(newtonMethod(getReversePolishNotation("arctan(x)")[0], 1, 0.001)).toBeCloseTo(0);
  expect(newtonMethod(getReversePolishNotation("arccot(x) - 2")[0], 0, 0.001)).toBeCloseTo(Math.tan(Math.PI / 2 - 2));
  expect(newtonMethod(getReversePolishNotation("e^x - 1")[0], 1, 0.001)).toBeCloseTo(0);
  expect(newtonMethod(getReversePolishNotation("3^x - 2")[0], 1, 0.001)).toBeCloseTo(Math.log(2) / Math.log(3));
  expect(newtonMethod(getReversePolishNotation("ln(x)")[0], 2, 0.001)).toBeCloseTo(1);
  expect(newtonMethod(getReversePolishNotation("lg(x) - 1")[0], 9, 0.001)).toBeCloseTo(10);
  expect(newtonMethod(getReversePolishNotation("log(2, x) - 8")[0], 200, 0.001)).toBeCloseTo(256);
});

test("Test getIntersectionPoints function", () => {
expect(getIntersectionPoints(getReversePolishNotation("1 / x")[0], getReversePolishNotation("0")[0], 1000, -5, 5)).toEqual([]);

  let receivedPoints = getIntersectionPoints(getReversePolishNotation("sin(x)")[0], getReversePolishNotation("cos(x)")[0], 1000, -5, 5);
  let expectedX = [Math.PI / 4 - Math.PI, Math.PI / 4, Math.PI / 4 + Math.PI];
  let expectedY = [-Math.sqrt(2) / 2, Math.sqrt(2) / 2, -Math.sqrt(2) / 2];
  comparePoints(receivedPoints, expectedX, expectedY);

  receivedPoints = getIntersectionPoints(getReversePolishNotation("x^2 + 3*x")[0], getReversePolishNotation("1")[0], 1000, -5, 5);
  expectedX = [(-3 - Math.sqrt(13)) / 2, (-3 + Math.sqrt(13)) / 2];
  expectedY = [1, 1];
  comparePoints(receivedPoints, expectedX, expectedY);
});

function comparePoints(receivedPoints, expectedX, expectedY) {
  for (let i = 0 ; i < receivedPoints.length; i++) {
    expect(receivedPoints[i].x).toBeCloseTo(expectedX[i]);
    expect(receivedPoints[i].y).toBeCloseTo(expectedY[i]);
  }
}