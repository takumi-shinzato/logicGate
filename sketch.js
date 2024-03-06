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
    }

    createInputNode(status, x, y) {
        this.inputNodes.push(new InputNode(this.lastInputNodeId, status, x, y));
    }

    createOutputNode(status, x, y) {
        this.outputNodes.push(new OutputNode(this.lastOutputNodeId, status, x, y));
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

    click() {
        this.toggle();
    }

    toggle() {
        this.status = !this.status;
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
    constructor() {
        this.inputNodeId;
        this.outputNodeId;
        this.points = [];
    }

    setInput(inputNodeId) {
        this.inputNodeId = inputNodeId;
    }

    setOutput(outputNodeId) {
        this.outputNodeId = outputNodeId;
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
}

function draw() {
    background(0);
    push();
    stroke(trueColor);
    strokeWeight(5);
    for (let i = 1; i < points.length; i++) {
        line(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
    }
    if (points.length > 0) {
        line(points[points.length - 1].x, points[points.length - 1].y, mouseX, mouseY);
    }
    pop();

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
        }
    }
    for (let outputNode of circuit.outputNodes) {
        if (outputNode.hover) {
            outputNode.click();
        }
    }
    console.log(circuit.inputNodes);
    console.log(circuit.outputNodes);

    if (mode == "LINE") {
        points.push(new Point(mouseX, mouseY));
    }
}

function keyPressed() {
    if (key == "n") mode = "NORMAL";
    if (key == "l") mode = "LINE";
}