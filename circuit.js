const trueColor = "#76FF03";
const falseColor = "#EEEEEE";

const TYPE = {
    INPUT: 0,
    OUTPUT: 1,
    TOGGLE: 2,
    LINE: 3,
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
        } else if (type === TYPE.TOGGLE) {
            this.nodes.push(new ToggleNode(this.lastNodeId, status, x, y));
            this.lastNodeId++;
        }
    }

    createLine(status, inputNodeIds, outputNodeIds, points) {
        this.edges.push(new Line(this.lastEdgeId, inputNodeIds, outputNodeIds, status, points));
        this.lastEdgeId++;
    }

    createGate(x, y) {
        this.edges.push(new NotGate(this.lastEdgeId, x, y));
        this.lastEdgeId++;
    }

    hoverCheck() {
        for (let node of this.nodes) {
            node.hoverCheck();
        }
    }

    run() {
        for (let node of this.nodes) {
            node.visited = node.start;
        }

        while(this.nodes.some(e => e.visited === false)) {
            for (let node of this.nodes) {
                if (node.visited) {
                    continue;
                }
                console.log(node.id);
                console.log(this.findEdgeByOutput(node.id));
                node.visited = true;
            }
        }

        // let target = [];
        // for (let node of this.nodes) {
        //     if (node.type === TYPE.TOGGLE) {
        //         if (this.findEdgeByOutput(node.id).length > 0) {
        //             target.push(this.findEdgeByOutput(node.id));
        //         }
        //     }
        // }
        // console.log(target);
        // while (target.length > 0) {
        //     let targetNodeId = target.shift();
        //     this.edges[targetNodeId].boolCheck();
        //     let newTargetNodes = this.edges[targetNodeId].outputNodeIds;
        //     for (let node of newTargetNodes) {
        //         if (this.findEdgeByOutput(node.id).length > 0) {
        //             target.push(this.findEdgeByOutput(node.id));
        //         }
        //     }
        // }
    }

    findLine(inputNodeId) {
        let edgeIds = [];
        for (let edge of this.edges) {
            if (edge.type === TYPE.LINE) {
                if (edge.inputNodeIds.includes(inputNodeId)) {
                    edgeIds.push(edge.id);
                }
            }
        }
        return edgeIds;
    }

    findEdgeByInput(inputNodeId) {
        let edgeIds = [];
        for (let edge of this.edges) {
            if (edge.inputNodeIds.includes(inputNodeId)) {
                edgeIds.push(edge.id);
            }
        }
        return edgeIds;
    }

    findEdgeByOutput(outputNodeId) {
        let edgeIds = [];
        for (let edge of this.edges) {
            if (edge.outputNodeIds.includes(outputNodeId)) {
                edgeIds.push(edge.id);
            }
        }
        console.log(`${outputNodeId}はエッジ${edgeIds}に繋がっている`);
        return edgeIds;
    }

    findGate(outputNodeId) {
        let edgeIds = [];
        for (let edge of this.edges) {
            if (edge.type !== TYPE.LINE) {
                if (edge.outputNodeIds.includes(outputNodeId)) {
                    edgeIds.push(edge.id);
                }
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
        this.visited = false;
        this.start = false;
    }

    draw(){}
    hoverCheck(){}

    click() {
        if (mode === MODE.Normal) { // 通常状態のとき
            // if (this.type === TYPE.INPUT) { // インプットはON/OFF切り替え不可
            //     return;
            // }
            // if (this.type === TYPE.OUTPUT && circuit.findGate(this.id).length > 0) { // アウトプットでゲート接続されているものはON/OFF切り替え不可
            //     return;
            // }
            if (this.type === TYPE.TOGGLE) {
                this.toggle();
            }
        } else if (mode === MODE.AddLine) { // ライン追加可能状態のとき
            if (this.type === TYPE.INPUT && circuit.findLine(this.id).length > 0) { // すでにエッジと繋がっているインプットノードには繋げない
                return;
            }
            circuit.edittingLine.setFirstNode(this);
            mode = MODE.EdittingLine;
        } else if (mode === MODE.EdittingLine) { // ライン編集中のとき
            if (this.type === circuit.edittingLine.firstNode.type) { // インプット同士、アウトプット同士は繋げないようにする
                return;
            }
            if (this.type === TYPE.INPUT && circuit.findLine(this.id).length > 0) { // すでにエッジと繋がっているインプットノードには繋げない
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
        this.width = 20;
        this.type = TYPE.INPUT;
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

class OutputNode extends Node {
    constructor(id, status, x, y) {
        super(id, status, x, y);
        this.radius = 10;
        this.type = TYPE.OUTPUT;
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

class ToggleNode extends OutputNode {
    constructor(id, status, x, y) {
        super(id, status, x, y);
        this.type = TYPE.TOGGLE;
        this.start = true;
        this.visited = true;
    }
}

class Edge {
    constructor(id) {
        this.id = id;
        this.inputNodeIds = [];
        this.outputNodeIds = [];
        this.hover = false;
    }

    draw(){}
    boolCheck(){}
}

class Line extends Edge {
    constructor(id, inputNodeIds, outputNodeIds, status, points) {
        super(id);
        this.inputNodeIds = inputNodeIds;
        this.outputNodeIds = outputNodeIds;
        this.status = status;
        this.points = points;
        this.type = TYPE.LINE;
        this.inputNode = circuit.nodes.find(e => e.id === this.inputNodeIds[0]);
        this.outputNode = circuit.nodes.find(e => e.id === this.outputNodeIds[0]);
    }

    boolCheck() {
        this.status = this.outputNode.status;
        this.inputNode.status = this.outputNode.status;
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

// const gateInfo = {
//     notGate: {
//         input: 1,
//         output: 1
//     }
// }

class NotGate extends Edge {
    constructor(id, x, y) {
        super(id);
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 35;
        this.inputNum = 1;
        this.outputNum = 1;
        
        for (let i = 0; i < this.inputNum; i++) {
            this.inputNodeIds.push(circuit.lastNodeId);
            circuit.nodes.push(new InputNode(circuit.lastNodeId, false, this.x - 45, this.y));
            circuit.lastNodeId++;
        }
        for (let i = 0; i < this.outputNum; i++) {
            this.outputNodeIds.push(circuit.lastNodeId);
            circuit.nodes.push(new OutputNode(circuit.lastNodeId, false, this.x + 45, this.y));
            circuit.lastNodeId++;
        }

        this.inputNode = circuit.nodes.find(e => e.id === this.inputNodeIds[0]);
        this.outputNode = circuit.nodes.find(e => e.id === this.outputNodeIds[0]);
    }

    boolCheck() {
        this.outputNode.status = !this.inputNode.status;
    }

    draw() {
        push();
        fill("red");
        rectMode(CENTER);
        rect(this.x, this.y, this.width, this.height, 3);
        fill("white");
        textAlign(CENTER, CENTER);
        textSize(14);
        textStyle(BOLD);
        text("NOT", this.x, this.y);
        pop();
    }
}