const canvas = document.getElementById("tutorial");
const context = canvas.getContext("2d");
const cw = canvas.width = 800;
const ch = canvas.height = 800;
const drawFuncForm = document.getElementById("drawFuncForm");
const areaForm = document.getElementById("areaForm");
const intersectionForm = document.getElementById("intersectionForm");
const FuncColor = "blue";
const FuncWidth = 2;
const AreaColor = "red";
const IntersectionPointsColor = "red";
const IntersectionPointsRadius = 4;
const CoordSystemColor = "black";
const CoordSystemWidth = 1;
const ResultPrecision = 5;

drawFuncForm.onsubmit = function(event) {
  event.preventDefault();
  context.clearRect(0, 0, cw, ch);

  const expr = drawFuncForm.elements.userExpr.value.trim();
  const reversePolishNotationData = getReversePolishNotation(expr);

  if (reversePolishNotationData === null || reversePolishNotationData[1] < expr.length) {
    console.log("Invalid input");
    return;
  }

  const reversePolishNotation = reversePolishNotationData[0];
  const xRes = +drawFuncForm.elements.xRes.value;
  const yRes = +drawFuncForm.elements.yRes.value;  

  drawFunc(reversePolishNotation, context, FuncColor, FuncWidth, cw, ch, xRes, yRes);

  drawCoordSystem(context, CoordSystemColor, CoordSystemWidth, cw, ch, xRes, yRes);
}

areaForm.onsubmit = function(event) {
  event.preventDefault();
  context.clearRect(0, 0, cw, ch);
  
  const expr = areaForm.elements.userExpr.value.trim();
  const reversePolishNotationData = getReversePolishNotation(expr);

  if (reversePolishNotationData === null || reversePolishNotationData[1] < expr.length) {
    console.log("Invalid input");
    return;
  }

  const reversePolishNotation = reversePolishNotationData[0];
  const xRes = +areaForm.elements.xRes.value;
  const yRes = +areaForm.elements.yRes.value;
  const lBound = +areaForm.elements.lBound.value;
  const rBound = +areaForm.elements.rBound.value;
  const contextLBound = Math.floor(lBound * (cw / 2) / xRes + cw / 2);
  const contextRBound = Math.floor(rBound * (cw / 2) / xRes + cw / 2);
  let resArea = 0;

  context.fillStyle = AreaColor;
  context.beginPath();
  context.moveTo(contextLBound, ch / 2);

  for (let i = contextLBound; i <= contextRBound; i++) {     
    const x = (i - cw / 2) * xRes / (cw / 2);
    const y = calcReversePolishNotation(reversePolishNotation, x).value;
    const contextY = toContextY(y, yRes);

    if (isNaN(y)) {
      resArea = NaN;
      break;
    }
    
    if (isFinite(y)) resArea += y;

    context.lineTo(i, contextY);
  }  

  if (isNaN(resArea)) {
    console.log("Wrong boundaries");
  } else {
    context.lineTo(contextRBound, ch / 2);
    context.fill();
  }  

  drawFunc(reversePolishNotation, context, FuncColor, FuncWidth, cw, ch, xRes, yRes);

  drawCoordSystem(context, CoordSystemColor, CoordSystemWidth, cw, ch, xRes, yRes);

  document.getElementById("resultArea").innerHTML = `Result area: <b>${+(resArea * (rBound - lBound) / (contextRBound - contextLBound)).toFixed(ResultPrecision)}</b>`;
}

intersectionForm.onsubmit = function(event) {
  event.preventDefault();
  context.clearRect(0, 0, cw, ch);

  const expr1 = intersectionForm.elements.userExpr1.value.trim();
  const expr2 = intersectionForm.elements.userExpr2.value.trim();  
  const reversePolishNotationData1 = getReversePolishNotation(expr1);
  const reversePolishNotationData2 = getReversePolishNotation(expr2);

  if (reversePolishNotationData1 === null || reversePolishNotationData1[1] < expr1.length
    || reversePolishNotationData2 === null || reversePolishNotationData2[1] < expr2.length) {
    console.log("Invalid input");
    return;
  }

  const reversePolishNotation1 = reversePolishNotationData1[0];
  const reversePolishNotation2 = reversePolishNotationData2[0];
  const xRes = +intersectionForm.elements.xRes.value;
  const yRes = +intersectionForm.elements.yRes.value;
  const lBound = +intersectionForm.elements.lBound.value;
  const rBound = +intersectionForm.elements.rBound.value;
  const intersectionPoints = getIntersectionPoints(reversePolishNotation1, reversePolishNotation2, cw, lBound, rBound);
  
  context.beginPath();  

  drawFunc(reversePolishNotation1, context, FuncColor, 2, cw, ch, xRes, yRes);
  drawFunc(reversePolishNotation2, context, FuncColor, 2, cw, ch, xRes, yRes);

  drawCoordSystem(context, CoordSystemColor, 1, cw, ch, xRes, yRes);

  context.fillStyle = IntersectionPointsColor;
  context.beginPath();

  for (let point of intersectionPoints) {
    context.beginPath();
    context.arc(toContextX(point.x, xRes), toContextY(point.y, yRes), IntersectionPointsRadius, 0, 2 * Math.PI);
    context.fill();
  }
  
  let pointsSet = new Set();

  for (let point of intersectionPoints) {
    pointsSet.add(`\n\tx: ${+point.x.toFixed(ResultPrecision)}, y: ${+point.y.toFixed(ResultPrecision)}`);
  }

  document.getElementById("intersectionPoints").innerHTML = `Intersection points:${[...pointsSet.values()].join("")}`;
}

function drawFunc(reversePolishNotation, context, strokeStyle, lineWidth, cw, ch, xRes, yRes) {
  let lastX = NaN, lastY = NaN, needToMoveTo = true;

  context.strokeStyle = strokeStyle;  
  context.lineWidth = lineWidth;
  context.beginPath();  

  for (let i = 0; i < cw; i++) {     
    const x = (i - cw / 2) * xRes / (cw / 2);
    const y = calcReversePolishNotation(reversePolishNotation, x).value;    
    const contextY = toContextY(y, yRes);

    if (isNaN(y)) continue;

    if (contextY < 0 || contextY > ch) {            
      if (!needToMoveTo) context.lineTo(i, contextY);

      needToMoveTo = true;
      [lastX, lastY] = [i, contextY];
      continue;
    }

    if (needToMoveTo) {
      needToMoveTo = false;
      context.moveTo(lastX, lastY);    
    }

    context.lineTo(i, contextY);
  }  

  context.stroke();
  context.closePath();
}

function drawCoordSystem(context, strokeStyle, lineWidth, cw, ch, xRes, yRes) {
  context.strokeStyle = strokeStyle;  
  context.fillStyle = strokeStyle;
  context.lineWidth = lineWidth;
  context.font = "18px Arial";
  context.beginPath();    

  context.moveTo(cw / 2, 2);
  context.lineTo(cw / 2, ch);
  context.moveTo(0, ch / 2);
  context.lineTo(cw - 2, ch / 2);  

  context.stroke();

  context.beginPath();

  context.moveTo(cw / 2, 0);
  context.lineTo(cw / 2 - 7, 9);
  context.lineTo(cw / 2 + 7, 9);
  context.fill();

  context.beginPath();

  context.moveTo(cw, ch / 2);
  context.lineTo(cw - 9, ch / 2 - 7);
  context.lineTo(cw - 9, ch / 2 + 7);
  context.fill();
  
  context.fillText(-xRes, 4, ch / 2 + 20);
  context.fillText(xRes, cw - String(xRes).length * 11 - 8, ch / 2 + 20);
  context.fillText(-yRes, cw / 2 - String(yRes).length * 11 - 8, ch - 4);
  context.fillText(yRes, cw / 2 - String(yRes).length * 11 - 4, 24);
  
  context.closePath();
}

function toContextX(x, xRes) {
  return x * (cw / 2) / xRes + (cw / 2);
}

function toContextY(y, yRes) {
  return ch / 2 - y * (ch / 2) / yRes;
}