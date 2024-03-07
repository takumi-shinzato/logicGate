const trueColor = "#76FF03";
const falseColor = "#EEEEEE";
let mode = "NORMAL";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Circuit {
    constructor() {
        this.inputNodes = [];
        this.outputNodes = [];
        this.lastInputNodeId = 0;
        this.lastOutputNodeId = 0;
        this.lines = [];
    }

    createInputNode(status, x, y) {
        this.inputNodes.push(new InputNode(this.lastInputNodeId, status, x, y));
        this.lastInputNodeId++;
    }

    createOutputNode(status, x, y) {
        this.outputNodes.push(new OutputNode(this.lastOutputNodeId, status, x, y));
        this.lastOutputNodeId++;
    }

    createLine(status, inputNodeId, outputNodeId, points) {
        this.lines.push(new Line(status, inputNodeId, outputNodeId, points));
    }

    hoverCheck() {
        for (let inputNode of this.inputNodes) {
            inputNode.hoverCheck();
        }
        for (let outputNode of this.outputNodes) {
            outputNode.hoverCheck();
        }
    }

    draw() {
        for (let inputNode of this.inputNodes) {
            inputNode.draw();
        }
        for (let outputNode of this.outputNodes) {
            outputNode.draw();
        }
        for (let line of this.lines) {
            line.draw();
        }
    }

    lineBooleanCheck() {
        for (let line of this.lines) {
            let inputNode = this.inputNodes.find(e => e.id === line.inputNodeId);
            let outputNode = this.outputNodes.find(e => e.id === line.outputNodeId);
            line.status = inputNode.status;
            outputNode.status = inputNode.status;
        }
    }
}

class Node {
    constructor(id, status, x, y) {
        this.status = status;
        this.x = x;
        this.y = y;
        this.hover = false;
        this.id = id;
    }
}

class InputNode extends Node {
    constructor(id, status, x, y) {
        super(id, status, x, y);
        this.radius = 10;
        this.type = "INPUT";
    }

    draw() {
        push();
        noStroke();
        if (!this.status) {
            fill(falseColor);
        } else {
            fill(trueColor);
        }
        if (this.hover) {
            stroke("#F44336");
            strokeWeight(3);
        }
        circle(this.x, this.y, this.radius * 2);
        pop();
    }

    hoverCheck() {
        this.hover = dist(mouseX, mouseY, this.x, this.y) < this.radius;
    }

    click() {
        this.toggle();
    }

    toggle() {
        this.status = !this.status;
    }
}

class OutputNode extends Node {
    constructor(id, status, x, y) {
        super(id, status, x, y);
        this.width = 24;
        this.type = "OUTPUT";
    }

    draw() {
        push();
        if (!this.status) {
            fill(falseColor);
        } else {
            fill(trueColor);
        }
        if (this.hover) {
            stroke("#F44336");
            strokeWeight(3);
        }
        rectMode(CENTER);
        rect(this.x, this.y, this.width, this.width);
        pop();
    }

    hoverCheck() {
        this.hover = (
            this.x - this.width / 2 < mouseX &&
            mouseX < this.x + this.width / 2 &&
            this.y - this.width / 2 < mouseY &&
            mouseY < this.y + this.width / 2
        );
    }
}

class Line {
    constructor(status, inputNodeId, outputNodeId, points) {
        this.status = status;
        this.inputNodeId = inputNodeId;
        this.outputNodeId = outputNodeId;
        this.points = points;
    }

    setInput(inputNodeId) {
        this.inputNodeId = inputNodeId;
    }

    setOutput(outputNodeId) {
        this.outputNodeId = outputNodeId;
    }

    setPoint(point) {
        this.points.push(point);
    }

    draw() {
        push();
        if (this.status) {
            stroke(trueColor);
        } else {
            stroke(falseColor);
        }
        strokeWeight(5);

        // インプットノード, アウトプットノード, 中継点の末尾のインデックス を取得
        let inputNode = circuit.inputNodes.find(e => e.id === this.inputNodeId);
        let outputNode = circuit.outputNodes.find(e => e.id === this.outputNodeId);
        // let lastIndex =  this.points.length - 1;
        let displayPoints = [];
        displayPoints.push(new Point(inputNode.x, inputNode.y));
        displayPoints = displayPoints.concat(this.points);
        displayPoints.push(new Point(outputNode.x, outputNode.y));

        // 線を表示
        for (let i = 1; i < displayPoints.length; i++) {
            line(displayPoints[i - 1].x, displayPoints[i - 1].y, displayPoints[i].x, displayPoints[i].y);
        }

        // if (points.length > 0) {
        //     line(points[points.length - 1].x, points[points.length - 1].y, mouseX, mouseY);
        // }
        pop();
    }
}

let points = [];
let nodes = [];
let outNodes = [];
const circuit = new Circuit();

function setup() {
    createCanvas(600, 400);
    for (let i = 1; i <= 5; i++) {
        circuit.createInputNode(false, 100, 60 * i);
        circuit.createOutputNode(false, 200, 60 * i);
    }
    circuit.createLine(false, 0, 3, [
        new Point(150, 60),
        new Point(150, 240)
    ]);
    circuit.createLine(false, 1, 0, [
        new Point(170, 120),
        new Point(170, 60)
    ]);
    circuit.createLine(false, 2, 2, []);
    circuit.createLine(false, 4, 1, [
        new Point(140, 300),
    ]);
    circuit.createLine(false, 3, 4, []);
}

function draw() {
    background(0);

    circuit.hoverCheck();
    circuit.draw();

    push();
    fill("white");
    textAlign(RIGHT, TOP);
    text(mode, width - 20, 20);
    pop();
}

function mousePressed() {
    for (let inputNode of circuit.inputNodes) {
        if (inputNode.hover) {
            inputNode.click();
            circuit.lineBooleanCheck();
        }
    }

    if (mode == "LINE") {
        points.push(new Point(mouseX, mouseY));
    }
}

function keyPressed() {
    if (key == "n") mode = "NORMAL";
    if (key == "l") mode = "LINE";
}