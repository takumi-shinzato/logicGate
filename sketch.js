let edittingLine;
let mode = "NORMAL";

const circuit = new Circuit();

function setup() {
    createCanvas(600, 500);
    for (let i = 1; i <= 4; i++) {
        circuit.createNode("TOGGLE", 100, 100 * i);
    }
    for (let i = 1; i <= 4; i++) {
        circuit.createNode("RESULT", 500, 100 * i);
    }

    // 半加算器
    circuit.createGate("OR" , 230, 100);
    circuit.createGate("AND", 370, 100);
    circuit.createGate("AND", 230, 200);
    circuit.createGate("NOT", 370, 200);

    // フリップフロップ
    circuit.createGate("OR" , 230, 300);
    circuit.createGate("NOT", 370, 300);
    circuit.createGate("OR" , 230, 400);
    circuit.createGate("NOT", 370, 400);
}

function draw() {
    background(0);

    circuit.run();

    push();
    fill("white");
    textAlign(RIGHT, TOP);

    if (mode === "ADD LINE" || mode === "EDITTING LINE") {
        text("EDIT", width - 20, 20);
    } else {
        text(mode, width - 20, 20);
    }
    pop();
}

function mousePressed() {
    circuit.mousePressed();
}

function keyPressed() {
    if (key == "n") {
        mode = "NORMAL";
        circuit.edittingLine = new EdittingLine();
    };
    if (key == "l") mode = "ADD LINE";
}