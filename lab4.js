// Lab 3 Spring 2015.  Add object-inside-object test and regular polygons.
// Based on lab 4 Fall 2014, basic version, with no extra credit code.

// Lab 4 Summer 2015.

var polyClass,rectClass,squareClass,triangleClass,regPolyClass;
var pointClass;  // Optional in students' solutions
var instance=[]; // Table of constructed geometric objects

// Swiped verbatim from PL/0
function textStream(initVal) { // closure for processing string as a stream
  var restOfString;
  var number=[];

  var funcs={
	eos: function() {
	  return restOfString=="";
	  },
	eoln: function() {
	  if (funcs.eos())
		throw("eoln with empty string");
	  return restOfString.charAt(0)=='\n';
	  },
	firstch: function() {
	  var ch;

	  if (funcs.eos())
		throw("firstch with empty string");
	  return restOfString.charAt(0);
	  },
	readch: function() {
	  var ch;

	  if (funcs.eos())
		throw("readch with empty string");
	  ch=restOfString.charAt(0);
	  restOfString=restOfString.slice(1);
	  return ch;
	  }
	};
	restOfString=initVal;
	return funcs;
  }

// Adapted from PL/0.  Loads number array
function get_numbers() {
  var inputText=textStream(lab4input.value);
  var ch,num,sign;
  var number=[];
  while (true)
  try {
	while (true) {
	  if (inputText.eos())
		throw "only whitespace";
	  ch=inputText.readch();
	  if (ch!=' ' && ch!='\n')
		break;
	  }

	  sign=1;
	  if (ch=='-') {
		sign=(-1);
		do {
		  ch=inputText.readch();
		  } while (ch==' ' || ch=='\n');
		}
	  if (ch<'0' || ch>'9')
		throw ch+" is not a digit";
	  num=ch-'0';
	  while (!inputText.eos() && !inputText.eoln() &&
		inputText.firstch()>='0' && inputText.firstch()<='9') {
		ch=inputText.readch();
		num=10*num+(ch-'0');
		}
	  number.push(sign*num);
	}
  catch (mesg) {
	if (mesg!="only whitespace")
	  alert(mesg);
	break;
	}

  return number;
  }

function leftTurn(a,b,c) { // Tests if a, b, c is three points making a left turn
  var area2;

  area2=(b.x-a.x)*(c.y-a.y)-(c.x-a.x)*(b.y-a.y);
  return area2>=0;
  }

function points2poly(count,num,proto) { // numpoints, array of coordinates, & prototype
  // Create a convex polygon of class proto
  // Build array of points
  var point=[],a,b,c,p0,p1;
  for (var i=0;i<count;i++)
	point.push(pointClass.construct(num[2*i],num[2*i+1]));

  // Check convexity/left-turnedness
  p0=a=point[0].get();
  p1=b=point[1].get();
  for (var i=2;i<count+2;i++) {
	c=point[i%count].get();
	if (!leftTurn(a,b,c))
	  throw "Found a right turn 1 in polyClass.construct "
		+a.x+" "+a.y+" "+b.x+" "+b.y+" "+c.x+" "+c.y;
	if (!leftTurn(c,p0,p1))
	  throw "Found a right turn 2 in polyClass.construct "
		+c.x+" "+c.y+" "+p0.x+" "+p0.y+" "+p1.x+" "+p1.y;
	a=b;
	b=c;
	}

  var obj=Object.create(proto);
  obj.get=
	function() {
	  return point;
	  };
  return obj;
  }

function start_classes() {
  polyClass={};
  var workPoly=
	(function () {
	   var instanceCount=0; // access in closure
	   return {
		 construct:
		   function (count,num) { // number of points and array of coordinates 
			 var obj;

			 obj=points2poly(count,num,polyClass);
			 instanceCount++;
			 return obj;
			 },
		 add:
		   function () { instanceCount++; },
		 count:
		   function () { return instanceCount; }
		 };
	   })();
  polyClass.construct=workPoly.construct;
  polyClass.add=workPoly.add;
  polyClass.count=workPoly.count;

  polyClass.area=
	function () { // area of convex polygon
	  var area2=0.0;
	  var x=[],y=[];
	  var point=this.get(),pt;

	  for (var i=0;i<point.length;i++) {
		pt=point[i].get();
		x.push(pt.x);
		y.push(pt.y);
		}
	  area2+=x[0]*(y[1]-y[point.length-1]);
	  for (var i=1;i<point.length-1;i++)
		area2+=x[i]*(y[i+1]-y[i-1]);
	  area2+=x[point.length-1]*(y[0]-y[i-1]);
	  return area2/2.0;
	  };

  polyClass.inside=
	function (x,y) { // Tests for point inside convex polygon
	  var point=this.get(),a=point[0].get(),b;

	  for (var i=1;i<=point.length;i++) {
		b=point[i%point.length].get();
		if (!leftTurn(a,b,{x: x,y: y}))
		  return false;
		a=b;
		}
	  return true;
	  };

  polyClass.boundingBox=
	function () {
	  var point=this.get();
	  var pt=point[0].get();
	  var lowX=pt.x,highX=pt.x,lowY=pt.y,highY=pt.y;
	  for (var i=1;i<point.length;i++) {
		pt=point[i].get();
		if (pt.x<lowX)
		  lowX=pt.x;
		if (pt.x>highX)
		  highX=pt.x;
		if (pt.y<lowY)
		  lowY=pt.y;
		if (pt.y>highY)
		  highY=pt.y;
		}
	  return {
		lowX: lowX,
		highX: highX,
		lowY: lowY,
		highY: highY
		};
	  };

  polyClass.insideObject=
	function (outside) {
	  var point=this.get(),pt;
	  for (var i=0;i<point.length;i++) {
		pt=point[i].get();
		if (!outside.inside(pt.x,pt.y))
		  return false;
		  }
	  return true;
	  };

  polyClass.draw=
	function (num,c) {
	  var point=this.get(),pt1,pt2,inside=c;
	  pt1=point[0].get();
	  for (var i=0;i<point.length-1;i++) {
		pt2=point[i+1].get();
		if (c)
		  drawing.drawLine(pt1.x,pt1.y,pt2.x,pt2.y,"blue");
		else
		  drawing.drawLine(pt1.x,pt1.y,pt2.x,pt2.y);
		pt1=pt2;
		}
	  pt2=point[0].get();
	  if (c)
		drawing.drawLine(pt1.x,pt1.y,pt2.x,pt2.y,"blue");
	  else
		drawing.drawLine(pt1.x,pt1.y,pt2.x,pt2.y);
	  drawing.printNum(num,pt2.x,pt2.y);
	  };

  polyClass.clone=
	function (deltaX,deltaY) {
	  var point=this.get(),coord=[],pt;
	  for (var i=0;i<point.length;i++) {
		pt=point[i].get();
		coord.push(pt.x+deltaX);
		coord.push(pt.y+deltaY);
		}
	  return polyClass.construct(point.length,coord);
	  };

  rectClass=Object.create(polyClass);
  var workRect=
	(function () {
	   var instanceCount=0; // access in closure
	   return {
		 construct:
		   function (lowX, highX, lowY, highY) { // bounding box 
			 if (lowX>highX || lowY>highY)
			   throw "bad input to rectClass.construct()";
			 polyClass.add(); // for total number of objects
			 instanceCount++;

			 var obj=Object.create(rectClass);
			 obj.get=
			   function() {
				 return {
				   lowX: lowX,
				   highX: highX,
				   lowY: lowY,
				   highY: highY
				   };
				 };
			 return obj;
			 },
		 add:
		   function () { instanceCount++; },
		 count:
		   function () { return instanceCount; }
		 };
	   })();
  rectClass.construct=workRect.construct;
  rectClass.add=workRect.add;
  rectClass.count=workRect.count;

  rectClass.area=
	function () {
	  var box=this.get();

	  return (box.highX-box.lowX)*(box.highY-box.lowY);
	  };

  rectClass.inside=
	function (x,y) {
	  var box=this.get();

	  return box.lowX<=x && x<=box.highX && box.lowY<=y && y<=box.highY;
	  };

  rectClass.boundingBox=
	function () {
	  return this.get()
	  };

  rectClass.insideObject=
	function (outside) {
	  var box=this.boundingBox();
	  return outside.inside(box.lowX,box.lowY) && 
			 outside.inside(box.highX,box.highY) &&
			 outside.inside(box.lowX,box.highY) &&
			 outside.inside(box.highX,box.lowY);
	  };

  rectClass.draw=
	function (num,c) {
	  var box=this.boundingBox();
	  if (c) {
		drawing.drawLine(box.lowX,box.lowY,box.highX,box.lowY,"blue");
		drawing.drawLine(box.highX,box.lowY,box.highX,box.highY,"blue");
		drawing.drawLine(box.highX,box.highY,box.lowX,box.highY,"blue");
		drawing.drawLine(box.lowX,box.highY,box.lowX,box.lowY,"blue");
		}
	  else {
		drawing.drawLine(box.lowX,box.lowY,box.highX,box.lowY);
		drawing.drawLine(box.highX,box.lowY,box.highX,box.highY);
		drawing.drawLine(box.highX,box.highY,box.lowX,box.highY);
		drawing.drawLine(box.lowX,box.highY,box.lowX,box.lowY);
		}
	  drawing.printNum(num,box.lowX,box.lowY);
	  };

  rectClass.clone=
	function (deltaX,deltaY) {
	  var box=this.get();
	  return rectClass.construct(box.lowX+deltaX,box.highX+deltaX,
								 box.lowY+deltaY,box.highY+deltaY);
	  };

  squareClass=Object.create(rectClass);
  var workSquare=
	(function () {
	   var instanceCount=0; // access in closure
	   return {
		 construct:
		   function (x, y, length) { // square properties 
			 if (length<0)
			   throw "bad input to workSquare.construct()";
			 polyClass.add(); // for total number of objects
			 rectClass.add(); // for total number of rectangles
			 instanceCount++;

			 var obj=Object.create(squareClass);
			 obj.get=
			   function() {
				 return {
				   x: x,
				   y: y,
				   length: length
				   };
				 };
			 return obj;
			 },
		 count:
		   function () { return instanceCount; }
		 };
	   })();
  squareClass.construct=workSquare.construct;
  squareClass.count=workSquare.count;

  squareClass.area=
	function () {
	  var sqr=this.get();

	  return sqr.length*sqr.length;
	  };

  squareClass.inside=
	function (x,y) {
	  var box=this.get();

	  return box.x<=x && x<=box.x+box.length && box.y<=y && y<=box.y+box.length;
	  };

  squareClass.boundingBox=
	function () {
	  var box=this.get();

	  return {
		lowX: box.x,
		highX: box.x+box.length,
		lowY: box.y,
		highY: box.y+box.length
		};
	  };

  squareClass.clone=
	function (deltaX,deltaY) {
	  var sqr=this.get();
	  return squareClass.construct(sqr.x+deltaX,sqr.y+deltaY,sqr.length);
	  };

  triangleClass=Object.create(polyClass);
  var workTri=
	(function () {
	   var instanceCount=0; // access in closure
	   return {
		 construct:
		   function (num) { // array of coordinates 
			 var obj;

			 obj=points2poly(3,num,triangleClass);
			 polyClass.add(); // for total number of objects
			 instanceCount++;
			 return obj;
			 },
		 count:
		   function () { return instanceCount; }
		 };
	   })();
  triangleClass.construct=workTri.construct;
  triangleClass.count=workTri.count;
  triangleClass.clone=
	function (deltaX,deltaY) {
	  var point=this.get(),coord=[],pt;
	  for (var i=0;i<3;i++) {
		pt=point[i].get();
		coord.push(pt.x+deltaX);
		coord.push(pt.y+deltaY);
		}
	  return triangleClass.construct(coord);
	  };

  regPolyClass=Object.create(polyClass);
  var workRegPoly=
	(function () {
	   var instanceCount=0; // access in closure
	   return {
		 construct:
		   function (count,num) { // number of points and array of coordinates 
			 // Build array of points
			 var point=[],a,b,c,p0,p1;
			 for (var i=0;i<2;i++)
			   point.push(pointClass.construct(num[2*i],num[2*i+1]));

			 polyClass.add(); // for total number of objects
			 instanceCount++;

			 var obj=Object.create(regPolyClass);
			 obj.get=
			   function() {
				 // Simpler computation of regular polygon - no poly centers
				 var theta,alpha,deltaX,deltaY,s,xold,yold,xnew,ynew;

				 var allPoint=[],a=point[0].get(),b=point[1].get();
				 allPoint.push(point[0]);
				 allPoint.push(point[1]);
				 //compute the other count-2 points
				 deltaX=b.x-a.x;
				 deltaY=b.y-a.y;
				 theta=Math.PI*(count-2)/count;   // Interior angle
				 alpha=Math.atan2(deltaY,deltaX); // Angle of x axis and first 2 pts
				 s=Math.sqrt(deltaX*deltaX+deltaY*deltaY);  // Length of side
				 xold=b.x;
				 yold=b.y;
				 // Polygon makes left turns
				 for (var i=2;i<count;i++) {
				   alpha=alpha+Math.PI-theta;
				   xnew=xold+s*Math.cos(alpha);
				   ynew=yold+s*Math.sin(alpha);
				   allPoint.push(pointClass.construct(xnew,ynew));
				   xold=xnew;
				   yold=ynew;
				   }
				 return allPoint;
				 };
			 return obj;
			 },
		 add:
		   function () { instanceCount++; },
		 count:
		   function () { return instanceCount; }
		 };
	   })();
  regPolyClass.construct=workRegPoly.construct;
  regPolyClass.add=workRegPoly.add;
  regPolyClass.count=workRegPoly.count;
  regPolyClass.clone=
	function (deltaX,deltaY) {
	  var rp=this.get(),coord=[],pt;
	  for (var i=0;i<2;i++) {
		pt=rp[i].get();
		coord.push(pt.x+deltaX);
		coord.push(pt.y+deltaY);
		}
	  return regPolyClass.construct(rp.length,coord);
	  };
  // Uses methods from polyClass as prototype

  pointClass={
	construct:
	  function (x,y) {
		return {
		  get: function () { return {x: x, y: y}; }
		  };
		}
	};

  } // end of function start_classes

var drawing=(function () {
  var baseX,baseY,scale,ctx;

  return {
	scale: function () {
	  var canvasBB=instance[0].boundingBox(),BB;

	  for (var i=1;i<instance.length;i++) {
		BB=instance[i].boundingBox();
		canvasBB.lowX=Math.min(canvasBB.lowX,BB.lowX);
		canvasBB.highX=Math.max(canvasBB.highX,BB.highX);
		canvasBB.lowY=Math.min(canvasBB.lowY,BB.lowY);
		canvasBB.highY=Math.max(canvasBB.highY,BB.highY);
		}

	  baseX=canvasBB.lowX;
	  baseY=canvasBB.lowY;
	  scale=Math.min(graphic.width/(canvasBB.highX-canvasBB.lowX),
					 graphic.height/(canvasBB.highY-canvasBB.lowY));

	  graphic.onmousemove=
		function (evt) {
		  var rect=evt.currentTarget.getBoundingClientRect(),x,y;
		  x=((evt.clientX - rect.left)/scale+baseX) | 0;
		  y=((graphic.height-(evt.clientY - rect.top))/scale+baseY) | 0;
		  xybox.innerHTML=x+" "+y;
		  drawing.draw(x,y);
		  };

	  graphic.onmouseout=
		function () {
		  xybox.innerHTML=" ";
		  drawing.draw();
		  };
	  },
	draw: function (x,y) {
  // Draw background grid
	  ctx=graphic.getContext('2d');
	  ctx.textAlign="center";
	  ctx.font="14px Geneva";
	  ctx.clearRect(0,0,graphic.width,graphic.height);
	  ctx.beginPath();
	  for (var i=20;i<graphic.width;i+=20) {
		ctx.moveTo(i,0);
		ctx.lineTo(i,graphic.height);
		ctx.moveTo(0,i);
		ctx.lineTo(graphic.width,i);
		}
	  ctx.strokeStyle="gray";
	  ctx.lineWidth=1;
	  ctx.stroke();
		
		if (!x || !y) {// No cursor position
			for (var i=0;i<instance.length;i++) {
				instance[i].draw(i,false);
			}
		}
		else {
			var highlighted=[];
			var insidels=[];
			var colorThese=[];
			// Find indices of objects containing cursor position
			for (var i=0;i<instance.length;i++){
				highlighted[i]=false;
				if(instance[i].inside(x,y)){
					insidels.push(i);
				}
			}
			// Sort by ascending object area
			insidels.sort(function(a, b){return instance[b].area()-instance[a].area()});
			// Throw away objects containing other objects
			for (var x=0;x<insidels.length;x++){
				colorThese.push(insidels[x]);
				for (var y=x+1;y<insidels.length;y++){
					if(instance[insidels[y]].insideObject(instance[insidels[x]])){
						colorThese.pop();
						break;
					}
				}
			}
			// Update table of indicators for highlighting
			for (var i=0;i<colorThese.length;i++){
				highlighted[colorThese[i]]=true;
			}
			for (var i=0;i<instance.length;i++) {
				instance[i].draw(i,highlighted[i]);
			}
		}
      },
	drawLine: function (x0,y0,x1,y1,color) {
	  // Draw first point
	  ctx.beginPath();
	  ctx.arc((x0-baseX)*scale,graphic.height-(y0-baseY)*scale,3,0,Math.PI*2,true);
	  ctx.closePath();
	  ctx.fillStyle="green";
	  ctx.fill();

	  ctx.beginPath();
	  ctx.moveTo((x0-baseX)*scale,graphic.height-(y0-baseY)*scale);
	  ctx.lineTo((x1-baseX)*scale,graphic.height-(y1-baseY)*scale);
	  ctx.closePath();
	  ctx.strokeStyle=color || "red";
	  ctx.lineWidth=1;
	  ctx.stroke();
	  },
	printNum: function (num,x,y) {
	  ctx.fillStyle="black";
	  ctx.fillText(String(num),(x-baseX)*scale,graphic.height-(y-baseY)*scale);
	  }
	};
  })();

function main() {

  function nextNumber() {
	if (numIndex>=number.length)
	  throw "Out of numbers!!!";

	return number[numIndex++];
  }

  var constructNum,i,constructClass,methodNum,method,k,p,pt1,pt2;
  var numPoints,coordNum,bb;
  var number=get_numbers(),numIndex=0; // numbers from HTML
  instance=[];
  start_classes();

  lab4output.innerHTML="";
  graphic.onmousemove=undefined;

  constructNum=nextNumber();
  for (i=0;i<constructNum;i++) {
	constructClass=nextNumber();
	if (constructClass==1) {
	  numPoints=nextNumber();
	  coordNum=[];
	  for (var k=0;k<2*numPoints;k++)
		coordNum.push(nextNumber());
	  instance.push(polyClass.construct(numPoints,coordNum));
	  }
	else if (constructClass==2)
	  instance.push(rectClass.construct(nextNumber(),nextNumber(),nextNumber(),
										nextNumber()));
	else if (constructClass==3)
	  instance.push(squareClass.construct(nextNumber(),nextNumber(),nextNumber()));
	else if (constructClass==4) {
	  coordNum=[];
	  for (var k=0;k<6;k++)
		coordNum.push(nextNumber());
	  instance.push(triangleClass.construct(coordNum));
	  }
	else if (constructClass==5) {
	  numPoints=nextNumber();
	  coordNum=[];
	  for (var k=0;k<4;k++)
		coordNum.push(nextNumber());
	  instance.push(regPolyClass.construct(numPoints,coordNum));
	  }
	else
	  throw "bad constructClass "+constructClass;
	}
  if (constructNum>0)
	drawing.scale();
  drawing.draw();
  methodNum=nextNumber();
  for (i=0;i<methodNum;i++) {
	method=nextNumber();
	k=nextNumber();
	if (method==1) {
	  if (k<0 || k>=constructNum)
		throw "Bad object index "+k;
	  lab4output.innerHTML+="area of "+k+"="+instance[k].area()+"\n";
	  }
	else if (method==2) {
	  if (k<0 || k>=constructNum)
		throw "Bad object index "+k;
	  pt1=nextNumber();
	  pt2=nextNumber();
	  lab4output.innerHTML+="inside for "+k+" "+pt1+" "+pt2+
							"="+instance[k].inside(pt1,pt2)+"\n";
	  }
	else if (method==3) {
	  if (k<1 || k>5)
		throw "Bad class index "+k;
	  lab4output.innerHTML+="count of "+k+"="+
		[undefined,polyClass,rectClass,squareClass,triangleClass,regPolyClass][k].
		  count()+"\n";
	  }
	else if (method==4) {
	  if (k<0 || k>=constructNum)
		throw "Bad object index "+k;
	  bb=instance[k].boundingBox();
	  lab4output.innerHTML+="bounding box for "+k+"="+bb.lowX+" "+bb.highX+" "
							+bb.lowY+" "+bb.highY+"\n";
	  }
	else if (method==5) {
	  if (k<0 || k>=constructNum)
		throw "Bad object index "+k;
	  p=nextNumber();
	  if (p<0 || p>=constructNum)
		throw "Bad object index "+p;
	  lab4output.innerHTML+="inside for "+k+" "+p+
							"="+instance[k].insideObject(instance[p])+"\n";
	  }
	else if (method==6) {
	  if (k<0 || k>=constructNum)
		throw "Bad object index "+k;
	  pt1=nextNumber();
	  pt2=nextNumber();
	  instance.push(instance[k].clone(pt1,pt2));
	  constructNum++;
	  }
	else
	  throw "bad method "+method;
	lab4output.scrollTop=99999;
	}
  if (numIndex!=number.length)
	alert("unconsumed input");
  if (constructNum>0)
	drawing.scale();
  drawing.draw();
  }

function run() {
  try {
	main();
	}
  catch (exc) {
	alert("crashed: "+exc);
	throw exc;
	}
  }