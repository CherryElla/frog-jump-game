const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const menu = document.getElementById("menu")
// Game Variables
let score;
let scoreBoard;
let ground;
let groundHeight = 50;
let player;
let gravity;
let obstacles = [];
let speed;
let keys = {};

startBtn.addEventListener("click",  (e) => {
    menu.style.display = "none"
    StartGame()
})

window.addEventListener("resize", function (e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ground.onResize();
});

// Event listeners to grab key pressed / unpressed
document.addEventListener("keydown", function (e) {
    keys[e.code] = true;
    console.log(e.code);
});
document.addEventListener("keyup", function (e) {
    keys[e.code] = false;
});

function groundTopCalc(canvas, ground) {
    return canvas.height - ground.height;
}

// Frog player
class Player {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.dy = 0;
        this.dx = 3;
        this.jumpForce = 15;
        this.origHeight = height;
        this.earthed = false;
        this.jumpTimer = 0;
        this.image = document.getElementById("playerImage");
    }
    Animate() {
        // Jumping
        if (keys["Space"]) {
            this.Jump();
        } else {
            this.jumpTimer = 0;
        }
        // Moving
        if (keys["KeyA"] && this.x > 0) {
            this.x = this.x - this.dx;
        }
        if (keys["KeyD"] && this.x < canvas.width - this.width) {
            this.x = this.x + this.dx;
        }
        // Ducking
        if (keys["ShiftLeft"]) {
            this.height = this.origHeight / 2;
        } else {
            this.height = this.origHeight;
        }
        this.y = this.y + this.dy;

        // Gravity
        let groundY = groundTopCalc(canvas, ground); //canvas.height;
        if (this.y + this.height < groundY) {
            this.dy += gravity;
            this.earthed = false;
        } else {
            this.dy = 0;
            this.earthed = true;
            this.y = groundY - this.height;
        }
        this.Draw();
    }
    Jump() {
        if (this.earthed && this.jumpTimer == 0) {
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
        } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
            this.jumpTimer++;
            this.dy = -this.jumpForce - this.jumpTimer / 50;
        }
    }

    Draw() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Obstacle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.dx = -speed;
        this.image = null;
    }
    Update() {
        this.x += this.dx;
        this.Draw();
        this.dx = -speed;
    }

    Draw() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Rock extends Obstacle {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.image = document.getElementById("rockImage");
    }
}
class Bird extends Obstacle {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.image = document.getElementById("birdImage");
    }
}
class Ground {
    constructor(x, y, w, h, c) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.c = c;
        // this.image = document.getElementById("ground")
    }

    onResize() {
        ground.width = window.innerWidth;
        ground.height = groundHeight;
        ground.y = groundTopCalc(canvas, this);
    }

    Draw() {
        // context.drawImage(this.image, this.x, this.y, this.w, this.h)
        context.beginPath();
        context.fillStyle = this.c;
        context.fillRect(this.x, this.y, this.width, this.height);
        context.closePath();
    }
}

class Text {
    constructor(text, x, y, align, color, s) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.align = align;
        this.color = color;
        this.s = s;
    }

    Draw() {
        context.beginPath();
        context.fillStyle = this.color;
        context.font = this.s + "px ariel";
        context.textAlign = this.align;
        context.fillText(this.text, this.x, this.y);
        context.closePath();
    }
}

function SpawnRock() {
    // let type = RandomIntBetween(0, 1);
    let size = RandomIntBetween(20, 70);
    let obst = new Rock(
        canvas.width + size,
        groundTopCalc(canvas, ground) - size,
        size,
        size
    );
    // if (type == 1) {
    //     obst.y -= player.origHeight - 10;
    // }
    obstacles.push(obst);
}

function SpawnBird() {
    let size = RandomIntBetween(20, 70);
    let obst = new Bird(
        canvas.width + size,
        groundTopCalc(canvas, ground) - size,
        size,
        size
    );
    obst.y -= player.origHeight - 10;
    obstacles.push(obst);
}

function RandomIntBetween(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function StartGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.font = "20px ariel";
    speed = 3;
    gravity = 1;
    score = 0;
    player = new Player(25, 0, 50, 50, "#9966ff");
    scoreBoard = new Text("Score: " + score, 25, 25, "left", "#660066", "20");
    ground = new Ground(0, canvas.height - 50, canvas.width, 50, "#864d2d");

    requestAnimationFrame(Update);
}

function hitCheck(object1, object2) {
    return (
        object1.x < object2.x + object2.width &&
        object1.x + object1.width > object2.x &&
        object1.y < object2.y + object2.height &&
        object1.y + object1.height > object2.y
    );
}

let startSpawnTime = 200;
let spawnBirdTimer = RandomIntBetween(150,450)
let spawnTimer = startSpawnTime;
function Update() {
    requestAnimationFrame(Update);
    context.clearRect(0, 0, canvas.width, canvas.height);
    ground.Draw();
    spawnTimer--;
    spawnBirdTimer--;
    if (spawnTimer <= 0) {
        SpawnRock();

        spawnTimer = startSpawnTime - speed * 8;
        if (spawnTimer < 60) {
            spawnTimer = 60;
        }
    }
    if(spawnBirdTimer <= 0) {
        SpawnBird(); 
        low = 150 - speed * 8;
        high = 450 - speed * 8;
        spawnBirdTimer = RandomIntBetween(low, high)
    }

    // Spawning Danger
    for (let i = 0; i < obstacles.length; i++) {
        let ob = obstacles[i];
        if (ob.x + ob.width < 0) {
            obstacles.splice(i, 1);
        }
        if (hitCheck(player, ob)) {
            obstacles = [];
            score = 0;
            spawnTimer = startSpawnTime;
            speed = 3;
        }
        ob.Update();
    }

    player.Animate();
    score++;
    scoreBoard.text = "Score: " + score;
    scoreBoard.Draw();
    speed += 0.003;
}

// StartGame();
