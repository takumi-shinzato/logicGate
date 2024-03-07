const trueColor = "#76FF03";
const falseColor = "#EEEEEE";

const TYPE = {
    INPUT: 0,
    OUTPUT: 1,
    LINE: 2,
}

const MODE = {
    Normal: 0,
    AddLine: 1,
    EdittingLine: 2,
}

let mode = MODE.Normal;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Circuit {
    constructor() {
        this.nodes = [];
        this.lastNodeId = 0;
        this.edges = [];
        this.lastEdgeId = 0;
        this.edittingLine = new EdittingLine();
    }

    createNode(type, status, x, y) {
        if (type === TYPE.INPUT) {
            this.nodes.push(new InputNode(this.lastNodeId, status, x, y));
            this.lastNodeId++;
        } else if (type === TYPE.OUTPUT) {
            this.nodes.push(new OutputNode(this.lastNodeId, status, x, y));
            this.lastNodeId++;
        }
    }

    createLine(status, inputNodeIds, outputNodeIds, points) {
        this.edges.push(new Line(this.lastEdgeId, inputNodeIds, outputNodeIds, status, points));
    }

    hoverCheck() {
        for (let node of this.nodes) {
            node.hoverCheck();
        }
    }

    run() {
        for (let edge of this.edges) {
            edge.boolCheck();
        }
    }

    findEdge(outputNodeId) {
        let edgeIds = [];
        for (let edge of this.edges) {
            if (edge.outputNodeIds.includes(outputNodeId)) {
                edgeIds.push(edge.id);
            }
        }
        return edgeIds;
    }

    draw() {
        for (let node of this.nodes) {
            node.draw();
        }
        for (let edge of this.edges) {
            edge.draw();
        }
        if (this.edittingLine.isActive()) {
            this.edittingLine.draw();
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

    draw(){}
    hoverCheck(){}

    click() {
        if (mode === MODE.Normal) { // 通常状態のとき
            if (this.type === TYPE.INPUT) {
                this.toggle();
            }
        } else if (mode === MODE.AddLine) { // ライン追加可能状態のとき
            if (this.type === TYPE.OUTPUT && circuit.findEdge(this.id).length > 0) { // すでにエッジと繋がっているアウトプットノードには繋げない
                return;
            }
            circuit.edittingLine.setFirstNode(this);
            mode = MODE.EdittingLine;
        } else if (mode === MODE.EdittingLine) { // ライン編集中のとき
            if (this.type === circuit.edittingLine.firstNode.type) { // インプット同士、アウトプット同士は繋げないようにする
                return;
            }
            if (this.type === TYPE.OUTPUT && circuit.findEdge(this.id).length > 0) { // すでにエッジと繋がっているアウトプットノードには繋げない
                return;
            }
            circuit.edittingLine.setSecondNode(this);
            circuit.createLine(circuit.edittingLine.status, [circuit.edittingLine.inputNode.id], [circuit.edittingLine.outputNode.id], circuit.edittingLine.points)
            circuit.edittingLine = new EdittingLine();
            mode = MODE.AddLine;
        }
    }

    toggle() {
        this.status = !this.status;
    }
}

class InputNode extends Node {
    constructor(id, status, x, y) {
        super(id, status, x, y);
        this.radius = 10;
        this.type = TYPE.INPUT;
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
        this.type = TYPE.OUTPUT;
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

class Edge {
    constructor(id, inputNodeIds, outputNodeIds) {
        this.id = id;
        this.inputNodeIds = inputNodeIds;
        this.outputNodeIds = outputNodeIds;
        this.hover = false;
    }

    draw(){}
    boolCheck(){}
}

class Line extends Edge {
    constructor(id, inputNodeIds, outputNodeIds, status, points) {
        super(id, inputNodeIds, outputNodeIds);
        this.status = status;
        this.points = points;
        this.type = TYPE.LINE;
        this.inputNode = circuit.nodes.find(e => e.id === this.inputNodeIds[0])
        this.outputNode = circuit.nodes.find(e => e.id === this.outputNodeIds[0])
    }

    boolCheck() {
        this.status = this.inputNode.status;
        this.outputNode.status = this.inputNode.status;
    }

    draw() {
        push();
        if (this.status) {
            stroke(trueColor);
        } else {
            stroke(falseColor);
        }
        strokeWeight(5);

        // インプットノード, アウトプットノード を取得
        let displayPoints = [];
        displayPoints.push(new Point(this.inputNode.x, this.inputNode.y));
        displayPoints = displayPoints.concat(this.points);
        displayPoints.push(new Point(this.outputNode.x, this.outputNode.y));

        // 線を表示
        for (let i = 1; i < displayPoints.length; i++) {
            line(displayPoints[i - 1].x, displayPoints[i - 1].y, displayPoints[i].x, displayPoints[i].y);
        }
        pop();
    }
}

class EdittingLine {
    constructor() {
        this.firstNode;
        this.secondNode;
        this.inputNode;
        this.outputNode;
        this.points = [];
        this.status = false;
        this.active = false;
    }

    isActive() {
        return this.active;
    }
    
    setFirstNode(firstNode) {
        this.firstNode = firstNode;
        this.status = firstNode.status;
        this.active = true;
    }

    setSecondNode(secondNode) {
        this.secondNode = secondNode;
        if (this.firstNode.type === TYPE.INPUT) {
            this.inputNode = this.firstNode;
            this.outputNode = this.secondNode;
        } else {
            this.inputNode = this.secondNode;
            this.outputNode = this.firstNode;
            this.points = this.points.reverse();
        }
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

        let displayPoints = [];
        displayPoints.push(new Point(this.firstNode.x, this.firstNode.y));
        displayPoints = displayPoints.concat(this.points);
        displayPoints.push(new Point(mouseX, mouseY));

        // 線を表示
        for (let i = 1; i < displayPoints.length; i++) {
            line(displayPoints[i - 1].x, displayPoints[i - 1].y, displayPoints[i].x, displayPoints[i].y);
        }
        pop();
    }
}