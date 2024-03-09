const trueColor = "#76FF03";
const falseColor = "#9E9E9E";

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
        this.gates = [];
        this.lastGateId = 0;
        this.edittingLine = new EdittingLine();
    }

    createNode(type, x, y) {
        let newNode;
        if (type === "INPUT") {
            newNode = new InputNode(this.lastNodeId, x, y);
        } else if (type === "OUTPUT") {
            newNode = new OutputNode(this.lastNodeId, x, y);
        } else if (type === "TOGGLE") {
            newNode = new ToggleNode(this.lastNodeId, x, y);
        } else if (type === "RESULT") {
            newNode = new ResultNode(this.lastNodeId, x, y);
        } else {
            console.error(`${type}ノードは定義されていません。`);
            return;
        }
        this.nodes.push(newNode);
        this.lastNodeId++;
        console.log(this.nodes);
        return newNode;
    }

    getNode(id) {
        return this.nodes.find(node => node.id === id);
    }

    getNodeStatuses(nodeIds) {
        let statuses = [];
        for (let nodeId of nodeIds) {
            statuses.push(this.getNode(nodeId).status);
        }
        return statuses;
    }

    createLine(status, inputNodeIds, outputNodeIds, points) {
        this.gates.push(new Line(this.lastGateId, inputNodeIds, outputNodeIds, status, points));
        this.lastGateId++;
    }

    createGate(type, x, y) {
        let newGate
        if (type === "NOT") {
            newGate = new NotGate(this.lastGateId, [], [], x, y);
        } else if (type === "AND") {
            newGate = new AndGate(this.lastGateId, [], [], x, y);
        } else if (type === "OR") {
            newGate = new OrGate(this.lastGateId, [], [], x, y);
        } else {
            console.error(`${type}ゲートは定義されていません。`);
            return;
        }
        newGate.inputPositions.forEach((inputPosition) => {
            let newNode = this.createNode("INPUT", inputPosition.x, inputPosition.y);
            newGate.addInputNodeIds(newNode.id);
        });
        newGate.outputPositions.forEach((outputPosition) => {
            let newNode = this.createNode("OUTPUT", outputPosition.x, outputPosition.y);
            newGate.addOutputNodeIds(newNode.id);
        });
        this.gates.push(newGate);
        this.lastGateId++;
    }

    hoverCheck() {
        for (let node of this.nodes) {
            node.hoverCheck();
        }
    }

    compute() {
        for (let gate of this.gates) {
            // inputStatuses を配列で取得
            let inputStatuses = this.getNodeStatuses(gate.inputNodeIds);
            if (gate.type === "LINE") {
                gate.setStatus(inputStatuses[0]);
            }

            // outputStatus を配列で取得
            let outputStatuses = gate.getOutputStatuses(inputStatuses);

            // 各種ゲートのアウトプットノードの状態を更新
            gate.outputNodeIds.forEach((outputNodeId, i) => {
                this.getNode(outputNodeId).status = outputStatuses[i];
            });
        }
    }

    findLine(outputNodeId) {
        let gateIds = [];
        for (let gate of this.gates) {
            if (gate.type === "LINE") {
                if (gate.outputNodeIds.includes(outputNodeId)) {
                    gateIds.push(gate.id);
                }
            }
        }
        return gateIds;
    }

    findGateByInput(inputNodeId) {
        let gateIds = [];
        for (let gate of this.gates) {
            if (gate.inputNodeIds.includes(inputNodeId)) {
                gateIds.push(gate.id);
            }
        }
        return gateIds;
    }

    findGateByOutput(outputNodeId) {
        let gateIds = [];
        for (let gate of this.gates) {
            if (gate.outputNodeIds.includes(outputNodeId)) {
                gateIds.push(gate.id);
            }
        }
        console.log(`${outputNodeId}はエッジ${gateIds}に繋がっている`);
        return gateIds;
    }

    findGate(outputNodeId) {
        let gateIds = [];
        for (let gate of this.gates) {
            if (gate.type !== "LINE") {
                if (gate.outputNodeIds.includes(outputNodeId)) {
                    gateIds.push(gate.id);
                }
            }
        }
        return gateIds;
    }

    mousePressed() {
        let isHoveringNode = false;
        for (let node of this.nodes) {
            if (node.hover) { // クリックされたノードだったら
                isHoveringNode = true;
                if (mode === "NORMAL") { // 通常状態のとき
                    if (node.type === "TOGGLE") {
                        node.toggle();
                    }
                } else if (mode === "ADD LINE") { // ライン追加可能状態のとき
                    if (node.category === "INPUT" && this.findLine(node.id).length > 0) { // すでにエッジと繋がっているインプットノードには繋げない
                        return;
                    }
                    this.edittingLine.setFirstNode(node);
                    mode = "EDITTING LINE";
                } else if (mode === "EDITTING LINE") { // ライン編集中のとき
                    if (node.category === this.edittingLine.firstNode.category) { // 同じ種類のノード同士は繋げない
                        return;
                    }
                    if (node.category === "INPUT" && this.findLine(node.id).length > 0) { // すでにエッジと繋がっているインプットノードには繋げない
                        return;
                    }
                    this.edittingLine.setSecondNode(node);
                    this.createLine(this.edittingLine.status, [this.edittingLine.inputNode.id], [this.edittingLine.outputNode.id], this.edittingLine.points);
                    this.edittingLine = new EdittingLine();
                    mode = "ADD LINE";
                }
            }
        }
        if (!isHoveringNode) { // クリックした時にノードにホバーしていなければ
            if (mode === "EDITTING LINE") {
                this.edittingLine.setPoint(new Point(mouseX, mouseY));
            }
        }
    }

    draw() {
        for (let node of this.nodes) {
            node.draw();
        }
        for (let gate of this.gates) {
            if (gate.type === "LINE") {
                let inputNode = this.getNode(gate.inputNodeIds[0]);
                let outputNode = this.getNode(gate.outputNodeIds[0]);
                gate.draw(inputNode, outputNode);
            } else {
                gate.draw();
            }
        }
        if (this.edittingLine.isActive()) {
            this.edittingLine.draw();
        }
    }

    run() {
        this.hoverCheck();
        this.compute();
        this.draw();
    }
}

class Node {
    constructor(id, x, y) {
        this.status = false;
        this.x = x;
        this.y = y;
        this.hover = false;
        this.id = id;
    }

    draw(){}
    hoverCheck(){}
    toggle() {
        this.status = !this.status;
    }
}

class InputNode extends Node {
    constructor(id, x, y) {
        super(id, x, y);
        this.width = 16;
        this.type = "INPUT";
        this.category = "INPUT";
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
        rect(this.x, this.y, this.width, this.width, 3);
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
    constructor(id, x, y) {
        super(id, x, y);
        this.radius = 8;
        this.type = "OUTPUT";
        this.category = "OUTPUT";
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
    constructor(id, x, y) {
        super(id, x, y);
        this.type = "TOGGLE";
        this.category = "OUTPUT";
    }
}

class ResultNode extends InputNode {
    constructor(id, x, y) {
        super(id, x, y);
        this.type = "RESULT";
        this.category = "INPUT";
    }
}

class Gate {
    constructor(id, inputNodeIds, outputNodeIds) {
        this.id = id;
        this.inputNodeIds = inputNodeIds;
        this.outputNodeIds = outputNodeIds;
        this.type;
        this.hover = false;
    }

    setInputNodeIds(ids) {
        this.inputNodeIds = ids;
    }

    setOutputNodeIds(ids) {
        this.outputNodeIds = ids;
    }

    addInputNodeIds(id) {
        this.inputNodeIds.push(id);
    }

    addOutputNodeIds(id) {
        this.outputNodeIds.push(id);
    }

    draw(){}
    compute(){}
}

class Line extends Gate {
    constructor(id, inputNodeIds, outputNodeIds, status, points) {
        super(id, inputNodeIds, outputNodeIds);
        this.inputNodeIds = inputNodeIds;
        this.outputNodeIds = outputNodeIds;
        this.type = "LINE";
        this.status = status;
        this.points = points;
    }

    setStatus(s) {
        this.status = s;
    }

    getOutputStatuses(s) {
        return [s[0]];
    }

    draw(inputNode, outputNode) {
        push();
        if (this.status) {
            stroke(trueColor);
        } else {
            stroke(falseColor);
        }
        strokeWeight(5);

        // インプットノード, アウトプットノード を取得
        let displayPoints = [];
        displayPoints.push(new Point(inputNode.x, inputNode.y));
        displayPoints = displayPoints.concat(this.points);
        displayPoints.push(new Point(outputNode.x, outputNode.y));

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
        if (this.firstNode.category === "OUTPUT") {
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

class NotGate extends Gate {
    constructor(id, inputNodeIds, outputNodeIds, x, y) {
        super(id, inputNodeIds, outputNodeIds);
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 35;
        this.inputPositions = [new Point(x - 44, y)];
        this.outputPositions = [new Point(x + 43, y)];
    }

    getOutputStatuses(s) {
        return [!s[0]];
    }

    draw() {
        push();
        fill("#F44336");
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

class AndGate extends Gate {
    constructor(id, inputNodeIds, outputNodeIds, x, y) {
        super(id, inputNodeIds, outputNodeIds);
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 50;
        this.inputPositions = [new Point(x - 43, y - 15), new Point(x - 43, y + 15)];
        this.outputPositions = [new Point(x + 44, y)];
    }

    getOutputStatuses(s) {
        return [s[0] && s[1]];
    }

    draw() {
        push();
        fill("#2196F3");
        rectMode(CENTER);
        rect(this.x, this.y, this.width, this.height, 3);
        fill("white");
        textAlign(CENTER, CENTER);
        textSize(14);
        textStyle(BOLD);
        text("AND", this.x, this.y);
        pop();
    }
}

class OrGate extends Gate {
    constructor(id, inputNodeIds, outputNodeIds, x, y) {
        super(id, inputNodeIds, outputNodeIds);
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 50;
        this.inputPositions = [new Point(x - 43, y - 15), new Point(x - 43, y + 15)];
        this.outputPositions = [new Point(x + 44, y)];
    }

    getOutputStatuses(s) {
        return [s[0] || s[1]];
    }

    draw() {
        push();
        fill("#FFAB00");
        rectMode(CENTER);
        rect(this.x, this.y, this.width, this.height, 3);
        fill("white");
        textAlign(CENTER, CENTER);
        textSize(14);
        textStyle(BOLD);
        text("OR", this.x, this.y);
        pop();
    }
}