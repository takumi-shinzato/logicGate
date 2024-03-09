class Node {
    constructor(id, gate, start) {
        this.id = id;
        this.value = id;
        this.inputIds = [];
        this.gateType = "TOGGLE";
        this.start = true;
        this.visited = true;
        this.finished = false;
    }

    setInputIds(inputIds) {
        this.inputIds = this.inputIds.concat(inputIds);
    }

    setGateType(gateType) {
        this.gateType = gateType;
        this.start = gateType === "TOGGLE"? true: false;
        this.visited = gateType === "TOGGLE"? true: false;
    }

    showInfo() {
        console.log(`${this.inputIds} -- ${this.gateType} --> ${this.id}`);
    }
}

class Circuit {
    constructor() {
        this.nodes = [];
        this.lastNodeId = 0;
    }

    createNode() {
        const newNode = new Node(this.lastNodeId);
        this.lastNodeId++;
        this.nodes.push(newNode);
        return newNode;
    }

    addEdge(id1, id2) { // node1 -> node2 を追加
        let node2 = this.getNode(id2);
        node2.setInputIds(id1);
    }

    createGate(inputIds, outputId, gateType) {
        let outputNode = this.getNode(outputId);
        outputNode.setInputIds(inputIds);
        outputNode.setGateType(gateType);
    }

    getNode(id) {
        return this.nodes[id];
    }

    getNextNodes(id) {
        return this.nodes.filter(node => node.inputIds.includes(id));
    }

    run() {
        let targetNodes = this.nodes.filter(node => node.start);
        // while (targetNodes.length > 0) {
        //     let targetNode = targetNodes.shift();
        //     targetNodes = targetNodes.concat(this.getNextNodes(targetNode.id));
        //     console.log(targetNode);
        // }
        while (this.nodes.some(e => e.finished === false)) {
            for (let node of this.nodes) {
                node.finished = true;
            }
        }
    }
}

const circuit = new Circuit();


// 半加算器
for (let i = 0; i < 15; i++) {
    circuit.createNode();
}
circuit.createGate([4, 5], 6, "OR");
circuit.createGate([7, 8], 9, "AND");
circuit.createGate([10], 11, "NOT");
circuit.createGate([12, 13], 14, "AND");
circuit.createGate([0], 4, "ECHO");
circuit.createGate([0], 7, "ECHO");
circuit.createGate([1], 5, "ECHO");
circuit.createGate([1], 8, "ECHO");
circuit.createGate([9], 10, "ECHO");
circuit.createGate([9], 3, "ECHO");
circuit.createGate([11], 13, "ECHO");
circuit.createGate([14], 2, "ECHO");
circuit.createGate([6], 12, "ECHO");

// フリップフロップ回路
// for (let i = 0; i < 14; i++) {
//     circuit.createNode();
// }
// circuit.createGate([4, 5], 6, "OR");
// circuit.createGate([7, 8], 9, "OR");
// circuit.createGate([10], 11, "NOT");
// circuit.createGate([12], 13, "NOT");
// circuit.createGate([0], 4, "ECHO");
// circuit.createGate([1], 8, "ECHO");
// circuit.createGate([6], 10, "ECHO");
// circuit.createGate([9], 12, "ECHO");
// circuit.createGate([11], 7, "ECHO");
// circuit.createGate([13], 5, "ECHO");
// circuit.createGate([11], 2, "ECHO");
// circuit.createGate([13], 3, "ECHO");

for (let node of circuit.nodes) {
    // node.showInfo();
    // console.log(node);
}

// circuit.run();