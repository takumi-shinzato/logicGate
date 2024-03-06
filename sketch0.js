class Switch {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.output = false;
    }

    draw() {
        noStroke();
        if (this.output) {
            fill("#00FF00");
        } else {
            fill("#757575");
        }
        rect(this.x, this.y, this.width, this.height);
    }

    toggle() {
        if (this.output) {
            this.output = false;
        } else {
            this.output = true;
        }
    }

    detectCollision() {
        if (this.x <= mouseX && 
            mouseX <= this.x + this.width && 
            this.y <= mouseY && 
            mouseY <= this.y + this.height) {
            return true;
        }
        return false;
    }
}

class LogicGate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 30;
        this.inputA = false;
        this.inputB = false;
        this.output = false;
    }

    draw() {
        stroke("#42A5F5");
        fill("#1565C0");
        rect(this.x, this.y, this.width, this.height, 5);

        noStroke();
        fill("#757575");
        // rect(this.x - 12, this.y, 13, 13);
        // rect(this.x - 12, this.y + 17, 13, 13);
        circle(this.x - 2, this.y + this.height / 4, 13);
        circle(this.x - 2, this.y + this.height * 3 / 4, 13);

        textAlign(CENTER, CENTER);
        noStroke();
        fill("#FFFFFF");
        text("AND", this.x + this.width / 2, this.y + this.height / 2);
    }
}

const gate = new LogicGate(200, 100);
const switchA = new Switch(50, 50);
function setup() {
    createCanvas(600, 400);
}

function draw() {
    background(0);
    gate.draw();
    switchA.draw();
    stroke("#00FF00");
    strokeWeight(3)
    line(100, 150, 300, 350);
}

function mousePressed() {
    if (switchA.detectCollision()) {
        switchA.toggle();
    }
}