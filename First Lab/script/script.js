import { calcRPN, getRPN } from "./ReversePolishNotation.js";
import { getIntersectionPoints } from "./Intersection.js";

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
  const rpn = parseExpressions(expr);
  const xRes = +drawFuncForm.elements.xRes.value;
  const yRes = +drawFuncForm.elements.yRes.value;  

  drawFunc(rpn, xRes, yRes);
  drawCoordSystem(xRes, yRes);
}

areaForm.onsubmit = function(event) {
  event.preventDefault();
  context.clearRect(0, 0, cw, ch);
  
  const expr = areaForm.elements.userExpr.value.trim();
  const rpn = parseExpressions(expr);
  const xRes = +areaForm.elements.xRes.value;
  const yRes = +areaForm.elements.yRes.value;
  const lBound = +areaForm.elements.lBound.value;
  const rBound = +areaForm.elements.rBound.value;  
  const area = getArea(rpn, cw, lBound, rBound);

  if (!isNaN(area)) {
    drawArea(rpn, lBound, rBound, xRes, yRes);
  }  
  drawFunc(rpn, xRes, yRes);
  drawCoordSystem(xRes, yRes);

  document.getElementById("resultArea").innerHTML = `Result area: <b>${area.toFixed(ResultPrecision)}</b>`;
}

intersectionForm.onsubmit = function(event) {
  event.preventDefault();
  context.clearRect(0, 0, cw, ch);

  const expr1 = intersectionForm.elements.userExpr1.value.trim();
  const expr2 = intersectionForm.elements.userExpr2.value.trim();  
  const [rpn1, rpn2] = parseExpressions(expr1, expr2);
  const xRes = +intersectionForm.elements.xRes.value;
  const yRes = +intersectionForm.elements.yRes.value;
  const lBound = +intersectionForm.elements.lBound.value;
  const rBound = +intersectionForm.elements.rBound.value;
  const intersectionPoints = getIntersectionPoints(rpn1, rpn2, cw, lBound, rBound);
  
  context.beginPath();  

  drawFunc(rpn1, xRes, yRes);
  drawFunc(rpn2, xRes, yRes);
  drawCoordSystem(xRes, yRes);
  drawPoints(intersectionPoints, xRes, yRes);
  
  let pointsSet = new Set();

  for (let point of intersectionPoints) {
    pointsSet.add(`\n\tx: ${+point.x.toFixed(ResultPrecision)}, y: ${+point.y.toFixed(ResultPrecision)}`);
  }

  document.getElementById("intersectionPoints").innerHTML = `Intersection points:${[...pointsSet.values()].join("")}`;
}

function drawFunc(rpn, xRes, yRes) {
  let lastX = NaN, lastY = NaN, needToMoveTo = true;

  context.strokeStyle = FuncColor;  
  context.lineWidth = FuncWidth;
  context.beginPath();  

  for (let i = 0; i < cw; i++) {     
    const x = (i - cw / 2) * xRes / (cw / 2);
    const y = calcRPN(rpn, x).value;    
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

function parseExpressions(...exprs) {
  const rpnData = exprs.map(expr => getRPN(expr));

  for (let i = 0; i < rpnData.length; i++) {
    if (rpnData[i] === null || rpnData[i][1] < exprs[i].length) {
      throw new Error("Invalid Input");
    }
  }

  if (rpnData.length > 1) {
    return rpnData.map(data => data[0]);
  }
  return rpnData[0][0];
}

function getArea(rpn, numOfIntervals, lBound, rBound) {
  let resArea = 0;  

  const deltaX = (rBound - lBound) / numOfIntervals;    

  for (let i = 0; i < numOfIntervals; i++) { 
    const x = lBound + (i + 0.5) * deltaX;
    const y = calcRPN(rpn, x).value;

    if (!isFinite(y)) {
      resArea = NaN;
      break;
    }

    resArea += deltaX * y;
  }

  return resArea;
}

function drawArea(rpn, lBound, rBound, xRes, yRes) {
  const contextLBound = toContextX(lBound, xRes);
  const contextRBound = toContextX(rBound, xRes);

  context.fillStyle = AreaColor;
  context.beginPath();
  context.moveTo(contextLBound, ch / 2);

  for (let i = contextLBound; i <= contextRBound; i++) {     
    const x = (i - cw / 2) * xRes / (cw / 2);
    const y = calcRPN(rpn, x).value;
    const contextY = toContextY(y, yRes);     

    context.lineTo(i, contextY);
  }  

  context.lineTo(contextRBound, ch / 2);
  context.fill();  
}

function drawPoints(intersectionPoints, xRes, yRes) {
  context.fillStyle = IntersectionPointsColor;
  context.beginPath();

  for (let point of intersectionPoints) {
    context.beginPath();
    context.arc(toContextX(point.x, xRes), toContextY(point.y, yRes), IntersectionPointsRadius, 0, 2 * Math.PI);
    context.fill();
  }
}

function drawCoordSystem(xRes, yRes) {
  context.strokeStyle = CoordSystemColor;  
  context.fillStyle = CoordSystemColor;
  context.lineWidth = CoordSystemWidth;
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
  return Math.round(x * (cw / 2) / xRes + cw / 2);
}

function toContextY(y, yRes) {
  return Math.round(ch / 2 - y * (ch / 2) / yRes);
}