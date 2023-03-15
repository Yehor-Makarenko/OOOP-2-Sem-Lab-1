import Point from "./classes/Point.js";
import Queue from "./classes/Queue.js";
import { calcRPN, OPERATORS } from "./ReversePolishNotation.js";
export { getIntersectionPoints, newtonMethod };

// lBound and rBound on x axis
function getIntersectionPoints(rpn1, rpn2, numOfIntervals, lBound, rBound) {  
  const deltaX = (rBound - lBound) / numOfIntervals;
  const resultPoints = [];

  const resultRPN = Queue.concat(rpn1, rpn2);
  resultRPN.push(OPERATORS["-"]);

  for (let i = 0; i < numOfIntervals; i++) {
    const x1 = lBound + i * deltaX;
    const x2 = lBound + (i + 1) * deltaX;
    const y1 = calcRPN(resultRPN, x1).value;
    const y2 = calcRPN(resultRPN, x2).value;    
    let resultX;

    if (y1 === 0) {
      resultPoints.push(new Point(x1, calcRPN(rpn1, x1).value));
      continue;
    } else if (y2 === 0) {
      if (i === numOfIntervals - 1) resultPoints.push(new Point(x2, calcRPN(rpn1, x2).value));
      continue;
    }
    
    if (!isFinite(y1) || !isFinite(y2)) continue;

    if (y1 * y2 > 0) continue;

    resultX = newtonMethod(resultRPN, x1 + 0.00001, 0.00001);
    resultPoints.push(new Point(resultX, calcRPN(rpn1, resultX).value));
  }

  return resultPoints;
}

function newtonMethod(rpn, firstX, accuracy) {    
  let currX = firstX;
  let prevX = currX + accuracy + 1;

  while (Math.abs(currX - prevX) > accuracy) {    
    const derivative = (calcRPN(rpn, currX + accuracy).value 
      - calcRPN(rpn, currX - accuracy).value) / (2 * accuracy);
    [currX, prevX] = [currX - calcRPN(rpn, currX).value / derivative, currX];    
  }

  return currX;
}