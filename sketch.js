let edittingLine;

const circuit = new Circuit();

function setup() {
    createCanvas(600, 400);
    for (let i = 1; i <= 5; i++) {
        circuit.createNode("TOGGLE", false, 100, 60 * i);
    }
    for (let i = 1; i <= 5; i++) {
        circuit.createNode("INPUT", false, 500, 60 * i);
    }

    // 半加算器
    circuit.createGate("OR", 210, 100);
    circuit.createGate("AND", 210, 200);
    circuit.createGate("NOT", 350, 190);
    circuit.createGate("AND", 400, 100);

    // フリップフロップ
    // circuit.createGate("OR", 210, 100);
    // circuit.createGate("OR", 210, 250);
    // circuit.createGate("NOT", 360, 100);
    // circuit.createGate("NOT", 360, 250);


    // circuit.createLine(false, [0], [8], [
    //     new Point(150, 60),
    //     new Point(150, 240)
    // ]);
    // circuit.createLine(false, [1], [5], [
    //     new Point(170, 120),
    //     new Point(170, 60)
    // ]);
    // circuit.createLine(false, [2], [6], []);
    // circuit.createLine(false, [4], [7], [
    //     new Point(140, 300),
    // ]);
    // circuit.createLine(false, [3], [9], []);
}

function draw() {
    background(0);

    circuit.run();

    push();
    fill("white");
    textAlign(RIGHT, TOP);
    text(mode, width - 20, 20);
    pop();
}

function mousePressed() {
    let nodeHover = false;
    for (let node of circuit.nodes) {
        if (node.hover) {
            node.click();
            nodeHover = true;
        }
    }
    if (!nodeHover) { // クリックした時にノードにホバーしていなければ
        if (mode === MODE.EdittingLine) {
            circuit.edittingLine.setPoint(new Point(mouseX, mouseY));
        }
    }
    // console.log(circuit.nodes);
    // console.log(circuit.edges);
}

function keyPressed() {
    if (key == "n") mode = MODE.Normal;
    if (key == "l") mode = MODE.AddLine;
}