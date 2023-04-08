const canvas = document.getElementById("game");
const context = canvas.getContext("2d");


// Game Variables
let score;
let scoreBoard;
let player;
let gravity;
let obstacles = [];
let speed;
let keys = {};

document.addEventListener("keydown", function (e) {
    keys[e.code] = true;
    console.log(e.code)
});
document.addEventListener("keyup", function (e) {
    keys[e.code] = false;
});

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
        if(keys["KeyA"] && this.x > 0){
            this.x = this.x - this.dx
        }
        if(keys["KeyD"] && this.x < canvas.width - this.width){
            this.x = this.x + this.dx
        }
        
        // Ducking
        if (keys["ShiftLeft"]) {
            this.height = this.origHeight / 2;
        } else {
            this.height = this.origHeight;
        }  
        this.y = this.y + this.dy;

        // Gravity
        if (this.y + this.height < canvas.height) {
            this.dy += gravity;
            this.earthed = false;
        } else {
            this.dy = 0;
            this.earthed = true;
            this.y = canvas.height - this.height;
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
        context.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
}

class Obstacle {
    constructor(x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.dx = -speed;
        this.image = document.getElementById("flyImage");
    }
    Update() {
        this.x += this.dx;
        this.Draw();
        this.dx = -speed;
    }

    Draw() {
        context.drawImage(this.image, this.x, this.y, this.w, this.h)
        // context.beginPath();
        // context.fillStyle = this.color;
        // context.fillRect(this.x, this.y, this.w, this.h);
        // context.closePath();
    }
}
class Ground {
    constructor(x,y,w,h){
        this.x =x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.image = document.getElementById("ground")
    }
    Draw(){
        context.drawImage(this.image, this.x, this.y, this.w, this.h) 
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

function SpawnObst() {
    let type = RandomIntBetween(0, 1);
    let size = RandomIntBetween(20, 70);
    let obst = new Obstacle(
        canvas.width + size,
        canvas.height - size,
        size,
        size,
        "#0099ff"
    );
    if (type == 1) {
        obst.y -= player.origHeight - 10;
    }
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
    let ground = new Ground(25, 0, 100, 70)

    requestAnimationFrame(Update);
}

let startSpawnTimer = 200;
let spawnTimer = startSpawnTimer;
function Update() {
    requestAnimationFrame(Update);
    context.clearRect(0, 0, canvas.width, canvas.height);

    spawnTimer--;
    if (spawnTimer <= 0) {
        SpawnObst();
        console.log(obstacles);
        spawnTimer = startSpawnTimer - speed * 8;
        if (spawnTimer < 60) {
            spawnTimer = 60;
        }
    }

    // Spawning Danger
    for (let i = 0; i < obstacles.length; i++) {
        let ob = obstacles[i];
        if (ob.x + ob.w < 0) {
            obstacles.splice(i, 1);
        }
        if (
            player.x < ob.x + ob.w &&
            player.x + player.width > ob.x &&
            player.y < ob.y + ob.h &&
            player.y + player.height > ob.y
        ) {
            obstacles = [];
            score = 0;
            spawnTimer = startSpawnTimer;
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

StartGame();
