const initialData = {
    nodes: [
        {type: "TOGGLE", x: 100, y: 100},
        {type: "TOGGLE", x: 100, y: 200},
        {type: "TOGGLE", x: 100, y: 300},
        {type: "TOGGLE", x: 100, y: 400},
        {type: "RESULT", x: 500, y: 100},
        {type: "RESULT", x: 500, y: 200},
        {type: "RESULT", x: 500, y: 300},
        {type: "RESULT", x: 500, y: 400},
    ],
    gates: [
        // 半加算器
        {type: "OR" , x: 230, y: 100},
        {type: "AND", x: 370, y: 100},
        {type: "AND", x: 230, y: 200},
        {type: "NOT", x: 370, y: 200},
        // フリップフロップ
        {type: "OR" , x: 230, y: 300},
        {type: "NOT", x: 370, y: 300},
        {type: "OR" , x: 230, y: 400},
        {type: "NOT", x: 370, y: 400},
    ]
}

const circuit = new Circuit(initialData);

function setup() {
    createCanvas(600, 500);
}

function draw() {
    background(0);
    circuit.run();
}

function mousePressed() {
    circuit.mousePressed();
}

const $radioButtons = document.getElementById("modeButton");
$radioButtons.addEventListener("change", e => {
    circuit.mode = e.target.id;
    circuit.edittingLine = new EdittingLine();
});