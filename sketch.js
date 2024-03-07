let edittingLine;

const circuit = new Circuit();

function setup() {
    createCanvas(600, 400);
    for (let i = 1; i <= 5; i++) {
        circuit.createNode(TYPE.INPUT, false, 100, 60 * i);
    }
    for (let i = 1; i <= 5; i++) {
        circuit.createNode(TYPE.OUTPUT, false, 400, 60 * i);
    }
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

    circuit.hoverCheck();
    circuit.draw();

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
            circuit.run();
            nodeHover = true;
        }
    }
    if (!nodeHover) { // クリックした時にノードにホバーしていなければ
        if (mode === MODE.EdittingLine) {
            circuit.edittingLine.setPoint(new Point(mouseX, mouseY));
        }
    }

}

function keyPressed() {
    if (key == "n") mode = MODE.Normal;
    if (key == "l") mode = MODE.AddLine;
}