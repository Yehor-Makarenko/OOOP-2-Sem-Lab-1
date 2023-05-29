import OneVariableRPN from "./classes/OneVariableRPN";

test("Test Newton's method", () => {
  const rpn = new OneVariableRPN();
  expect(rpn._newtonMethod(new OneVariableRPN("2/x + 5"), -0.1, 0.001)).toBeCloseTo(-0.4);
  expect(rpn._newtonMethod(new OneVariableRPN("2*x - 2^0.5"), 1, 0.001)).toBeCloseTo(Math.sqrt(2) / 2);
  expect(rpn._newtonMethod(new OneVariableRPN("x^2 + 3*x - 1"), 1, 0.001)).toBeCloseTo((-3 + Math.sqrt(13)) / 2);
  expect(rpn._newtonMethod(new OneVariableRPN("x^2 + 3*x - 1"), -5, 0.001)).toBeCloseTo((-3 - Math.sqrt(13)) / 2);
  expect(rpn._newtonMethod(new OneVariableRPN("sin(x-1)"), 2, 0.001)).toBeCloseTo(1);
  expect(rpn._newtonMethod(new OneVariableRPN("cos(x)"), 1, 0.001)).toBeCloseTo(Math.PI / 2);
  expect(rpn._newtonMethod(new OneVariableRPN("tan(x)"), 3, 0.001)).toBeCloseTo(Math.PI);
  expect(rpn._newtonMethod(new OneVariableRPN("cot(x)"), 1.5, 0.001)).toBeCloseTo(Math.PI / 2);
  expect(rpn._newtonMethod(new OneVariableRPN("arcsin(x+5)"), -5.5, 0.001)).toBeCloseTo(-5);
  expect(rpn._newtonMethod(new OneVariableRPN("arccos(x) - pi / 4"), 0, 0.001)).toBeCloseTo(Math.sqrt(2) / 2);
  expect(rpn._newtonMethod(new OneVariableRPN("arctan(x)"), 1, 0.001)).toBeCloseTo(0);
  expect(rpn._newtonMethod(new OneVariableRPN("arccot(x) - 2"), 0, 0.001)).toBeCloseTo(Math.tan(Math.PI / 2 - 2));
  expect(rpn._newtonMethod(new OneVariableRPN("e^x - 1"), 1, 0.001)).toBeCloseTo(0);
  expect(rpn._newtonMethod(new OneVariableRPN("3^x - 2"), 1, 0.001)).toBeCloseTo(Math.log(2) / Math.log(3));
  expect(rpn._newtonMethod(new OneVariableRPN("ln(x)"), 2, 0.001)).toBeCloseTo(1);
  expect(rpn._newtonMethod(new OneVariableRPN("lg(x) - 1"), 9, 0.001)).toBeCloseTo(10);
  expect(rpn._newtonMethod(new OneVariableRPN("log(2, x) - 8"), 200, 0.001)).toBeCloseTo(256);
});

test("Test getIntersectionPoints function", () => {  
  expect(OneVariableRPN.getIntersectionPoints(new OneVariableRPN("1 / x"), new OneVariableRPN("0"), 1000, -5, 5)).toEqual([]);

  let receivedPoints = OneVariableRPN.getIntersectionPoints(new OneVariableRPN("sin(x)"), new OneVariableRPN("cos(x)"), 1000, -5, 5);
  let expectedX = [Math.PI / 4 - Math.PI, Math.PI / 4, Math.PI / 4 + Math.PI];
  let expectedY = [-Math.sqrt(2) / 2, Math.sqrt(2) / 2, -Math.sqrt(2) / 2];
  comparePoints(receivedPoints, expectedX, expectedY);

  receivedPoints = OneVariableRPN.getIntersectionPoints(new OneVariableRPN("x^2 + 3*x"), new OneVariableRPN("1"), 1000, -5, 5);
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