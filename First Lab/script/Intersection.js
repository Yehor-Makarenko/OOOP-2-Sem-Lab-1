function getIntersectionPoints(reversePolishNotation1, reversePolishNotation2, numOfIntervals, lBound, rBound) {  
  const diff = rBound - lBound;
  const resultPoints = [];

  const resultReversePolishNotation = Queue.concat(reversePolishNotation1, reversePolishNotation2);
  resultReversePolishNotation.push(OPERATORS["-"]);

  for (let i = 0; i < numOfIntervals; i++) {
    const x1 = lBound + i * diff / numOfIntervals;
    const x2 = lBound + (i + 1) * diff / numOfIntervals;
    const y1 = calcReversePolishNotation(resultReversePolishNotation, x1).value;
    const y2 = calcReversePolishNotation(resultReversePolishNotation, x2).value;    
    let resultX;

    if (y1 === 0) {
      resultPoints.push(new Point(x1, calcReversePolishNotation(reversePolishNotation1, x1).value));
      continue;
    } else if (y2 === 0) {
      if (i === numOfIntervals - 1) resultPoints.push(new Point(x2, calcReversePolishNotation(reversePolishNotation1, x2).value));
      continue;
    }
    
    if (!isFinite(y1) || !isFinite(y2)) continue;

    if (y1 * y2 > 0) continue;

    resultX = newtonMethod(resultReversePolishNotation, x1 + 0.00001, 0.00001);
    resultPoints.push(new Point(resultX, calcReversePolishNotation(reversePolishNotation1, resultX).value));
  }

  return resultPoints;
}

function newtonMethod(reversePolishNotation, firstX, accuracy) {    
  let currX = firstX;
  let prevX = currX + accuracy + 1;

  while (Math.abs(currX - prevX) > accuracy) {    
    const derivative = (calcReversePolishNotation(reversePolishNotation, currX + accuracy).value 
      - calcReversePolishNotation(reversePolishNotation, currX - accuracy).value) / (2 * accuracy);
    [currX, prevX] = [currX - calcReversePolishNotation(reversePolishNotation, currX).value / derivative, currX];    
  }

  return currX;
}