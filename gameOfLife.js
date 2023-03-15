const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = 800;
const HEIGHT = 800;
const CELL_SIZE = 4;
const NUM_CRITTERS = 50;
const POOPING_PROBABILITY = 0.003;
const POOPING_GROUP_SIZE = 5;
const MIN_STEPS_BEFORE_TURN = 5;
const MAX_STEPS_BEFORE_TURN = 15;

const BACKGROUND_COLOR = "#0A0A0A";
const CELL_COLOR = "#FFFFFF";
const CRITTER_COLOR = "#FF0000";

const rows = HEIGHT / CELL_SIZE;
const cols = WIDTH / CELL_SIZE;

let grid = Array.from(Array(rows), () => new Array(cols).fill(0));

let critters = [];
for (let i = 0; i < NUM_CRITTERS; i++) {
    critters.push({
        y: Math.floor(Math.random() * rows),
        x: Math.floor(Math.random() * cols),
        direction: Math.floor(Math.random() * 4),
        stepsLeft: Math.floor(Math.random() * (MAX_STEPS_BEFORE_TURN - MIN_STEPS_BEFORE_TURN + 1)) + MIN_STEPS_BEFORE_TURN
    });
}

function drawGrid() {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x]) {
                ctx.fillStyle = CELL_COLOR;
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    critters.forEach(critter => {
        ctx.fillStyle = CRITTER_COLOR;
        ctx.fillRect(critter.x * CELL_SIZE, critter.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
}

function poopGroup(critter) {
    for (let i = 0; i < POOPING_GROUP_SIZE; i++) {
        let dy = Math.floor(Math.random() * 3) - 1;
        let dx = Math.floor(Math.random() * 3) - 1;
        let y = critter.y + dy;
        let x = critter.x + dx;
        if (y >= 0 && y < rows && x >= 0 && x < cols) {
            grid[y][x] = 1;
        }
    }
}

function moveCritters() {
    critters.forEach(critter => {
        switch (critter.direction) {
            case 0:
                critter.y = (critter.y - 1 + rows) % rows;
                break;
            case 1:
                critter.x = (critter.x + 1) % cols;
                break;
            case 2:
                critter.y = (critter.y + 1) % rows;
                break;
            case 3:
                critter.x = (critter.x - 1 + cols) % cols;
                break;
        }

        critter.stepsLeft -= 1;
        if (critter.stepsLeft <= 0) {
            critter.direction = Math.floor(Math.random() * 4);
            critter.stepsLeft = Math.floor(Math.random() * (MAX_STEPS_BEFORE_TURN - MIN_STEPS_BEFORE_TURN + 1)) + MIN_STEPS_BEFORE_TURN;
        }

        if (Math.random() < POOPING_PROBABILITY) {
            poopGroup(critter);
        }
    });
}

function step() {
    let newGrid = Array.from(Array(rows), () => new Array(cols).fill(0));

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const state = grid[y][x];
            let neighbors = 0;

            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dy === 0 && dx === 0) continue;
                    const newY = (y + dy + rows) % rows;
                    const newX = (x + dx + cols) % cols;
                    neighbors += grid[newY][newX];
                }
            }

            if (state && (neighbors === 2 || neighbors === 3)) {
                newGrid[y][x] = 1;
            } else if (!state && neighbors === 3) {
                newGrid[y][x] = 1;
            }
        }
    }

    grid = newGrid;
    moveCritters();
    drawGrid();
}

drawGrid();
setInterval(step, 100);

let drawingCritters = false;

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);

    if (event.button === 0) { // Left mouse button
        drawingCritters = true;
        critters.push({
            y: y,
            x: x,
            direction: Math.floor(Math.random() * 4),
            stepsLeft: Math.floor(Math.random() * (MAX_STEPS_BEFORE_TURN - MIN_STEPS_BEFORE_TURN + 1)) + MIN_STEPS_BEFORE_TURN
        });
    } else if (event.button === 2) { // Right mouse button
        grid[y][x] = 1 - grid[y][x];
    }
});

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);

    if (event.buttons === 1) { // Left mouse button is pressed
        if (drawingCritters) {
            critters.push({
                y: y,
                x: x,
                direction: Math.floor(Math.random() * 4),
                stepsLeft: Math.floor(Math.random() * (MAX_STEPS_BEFORE_TURN - MIN_STEPS_BEFORE_TURN + 1)) + MIN_STEPS_BEFORE_TURN
            });
        } else {
            grid[y][x] = 1;
        }
    } else if (event.buttons === 2) { // Right mouse button is pressed
        grid[y][x] = 1 - grid[y][x];
    }
});

canvas.addEventListener('mouseup', (event) => {
    if (event.button === 0) {
        drawingCritters = false;
    }
});

canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});