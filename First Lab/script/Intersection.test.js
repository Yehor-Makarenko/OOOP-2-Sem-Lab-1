import { getIntersectionPoints, newtonMethod } from "./Intersection.js";
import { getRPN } from "./ReversePolishNotation.js";
import Point from "./classes/Point.js";

test("Test Newton's method", () => {
  expect(newtonMethod(getRPN("2/x + 5")[0], -0.1, 0.001)).toBeCloseTo(-0.4);
  expect(newtonMethod(getRPN("2*x - 2^0.5")[0], 1, 0.001)).toBeCloseTo(Math.sqrt(2) / 2);
  expect(newtonMethod(getRPN("x^2 + 3*x - 1")[0], 1, 0.001)).toBeCloseTo((-3 + Math.sqrt(13)) / 2);
  expect(newtonMethod(getRPN("x^2 + 3*x - 1")[0], -5, 0.001)).toBeCloseTo((-3 - Math.sqrt(13)) / 2);
  expect(newtonMethod(getRPN("sin(x-1)")[0], 2, 0.001)).toBeCloseTo(1);
  expect(newtonMethod(getRPN("cos(x)")[0], 1, 0.001)).toBeCloseTo(Math.PI / 2);
  expect(newtonMethod(getRPN("tan(x)")[0], 3, 0.001)).toBeCloseTo(Math.PI);
  expect(newtonMethod(getRPN("cot(x)")[0], 1.5, 0.001)).toBeCloseTo(Math.PI / 2);
  expect(newtonMethod(getRPN("arcsin(x+5)")[0], -5.5, 0.001)).toBeCloseTo(-5);
  expect(newtonMethod(getRPN("arccos(x) - pi / 4")[0], 0, 0.001)).toBeCloseTo(Math.sqrt(2) / 2);
  expect(newtonMethod(getRPN("arctan(x)")[0], 1, 0.001)).toBeCloseTo(0);
  expect(newtonMethod(getRPN("arccot(x) - 2")[0], 0, 0.001)).toBeCloseTo(Math.tan(Math.PI / 2 - 2));
  expect(newtonMethod(getRPN("e^x - 1")[0], 1, 0.001)).toBeCloseTo(0);
  expect(newtonMethod(getRPN("3^x - 2")[0], 1, 0.001)).toBeCloseTo(Math.log(2) / Math.log(3));
  expect(newtonMethod(getRPN("ln(x)")[0], 2, 0.001)).toBeCloseTo(1);
  expect(newtonMethod(getRPN("lg(x) - 1")[0], 9, 0.001)).toBeCloseTo(10);
  expect(newtonMethod(getRPN("log(2, x) - 8")[0], 200, 0.001)).toBeCloseTo(256);
});

test("Test getIntersectionPoints function", () => {
expect(getIntersectionPoints(getRPN("1 / x")[0], getRPN("0")[0], 1000, -5, 5)).toEqual([]);

  let receivedPoints = getIntersectionPoints(getRPN("sin(x)")[0], getRPN("cos(x)")[0], 1000, -5, 5);
  let expectedX = [Math.PI / 4 - Math.PI, Math.PI / 4, Math.PI / 4 + Math.PI];
  let expectedY = [-Math.sqrt(2) / 2, Math.sqrt(2) / 2, -Math.sqrt(2) / 2];
  comparePoints(receivedPoints, expectedX, expectedY);

  receivedPoints = getIntersectionPoints(getRPN("x^2 + 3*x")[0], getRPN("1")[0], 1000, -5, 5);
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