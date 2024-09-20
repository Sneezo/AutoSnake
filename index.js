const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvas2 = document.getElementById("canvas2");
const ctx2 = canvas2.getContext("2d");
canvas.width = 1500;
canvas.height = 1500;
canvas2.width = canvas.width;
canvas2.height = canvas.height;
var moveThroughWalls = false;
var FPS = 100;
var frameLength = 1000/FPS;

function drawCauseOfDeath(snake, fruit){
    snake.draw(ctx2);
    fruit.draw(ctx2);
}

function isValidPosition(x,y,snake){
    if(x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return false;

    for (let segment of snake.body){
        if(segment.x === x && segment.y === y) return false;
    }

    return true;
}

function bfs(snake,fruit){
    let queue = [];
    let visited = new Set();
    let longestValidPath = [];

    let head = snake.body[0];
    queue.push({x:head.x, y:head.y, path:[]});
    visited.add(`${head.x},${head.y}`);

    let directions = [
        {x:1, y:0},
        {x:-1, y:0},
        {x:0, y:1},
        {x:0, y:-1},
    ];

    while (queue.length > 0){
        let current = queue.shift();

        if(current.x === fruit.x && current.y === fruit.y) {
            return current.path;
        }

        if(current.path.length > longestValidPath.length){
            longestValidPath = current.path;
        }

        for(let dir of directions) {
            let newX = current.x + dir.x * snake.size;
            let newY = current.y + dir.y * snake.size;

            let newKey = `${newX},${newY}`;

            if(isValidPosition(newX, newY, snake) && !visited.has(newKey)){
                queue.push({
                    x: newX,
                    y: newY,
                    path: [...current.path, dir]
                });
                visited.add(newKey);
            }
        }

    }
    return longestValidPath.length > 0 ? longestValidPath : null;
}

class Snake {
    constructor(x,y,size){
        this.x = x;
        this.y = y;
        this.size = size;
        this.direction = {x:1, y:0};
        this.body = [{x:x, y:y, dir:this.direction}];
        this.alive = true;
    }
    moveThroughWalls(){
        if(!this.alive) return;
        let head = {
            x:this.body[0].x + this.direction.x * this.size,
            y:this.body[0].y + this.direction.y * this.size
        }
        this.body.unshift(head);
        if(this.body[0].x > canvas.width -this.size) this.body[0].x = 0;
        if(this.body[0].x < 0) this.body[0].x = canvas.width-this.size;
        if(this.body[0].y > canvas.height -this.size) this.body[0].y = 0;
        if(this.body[0].y < 0) this.body[0].y = canvas.height - this.size;
        this.body.pop();
    }

    die(){
        this.alive = false;
        ctx2.clearRect(0,0,canvas2.width,canvas2.height);
        drawCauseOfDeath(snake, fruit);
        setTimeout(() => {
            init();
        }, 500);
    }

    move(){
        if(!this.alive) return;
        let head = {
            x:this.body[0].x + this.direction.x * this.size,
            y:this.body[0].y + this.direction.y * this.size
        }
        this.body.unshift(head);
        this.body[1].dir = this.direction;
        if (
            this.body[0].x > canvas.width - this.size ||
            this.body[0].x < 0 ||
            this.body[0].y > canvas.height - this.size ||
            this.body[0].y < 0
        ) {
            console.log(`Ate the wall. dirX: ${this.direction.x} dirY: ${this.direction.y}
                     positionX: ${this.body[0].x} positionY: ${this.body[0].y}`)
            this.die();
        }
        

        for(let i = 1; i < this.body.length; i++){
            if(this.body[0].x === this.body[i].x && this.body[0].y === this.body[i].y){
                console.log(`Ate myself. dirX: ${this.direction.x} dirY: ${this.direction.y}
                     positionX: ${this.body[0].x} positionY: ${this.body[0].y}`)
                this.die();
            }
        }
        this.body.pop();
    }

    changeDirection (newDirection){
        this.direction = newDirection;
    }

    grow(){
        let tail = this.body[this.body.length-1];
        this.body.push({...tail});
    }

    draw(ctx){
        for (let segment of this.body){
            if(segment === this.body[0]) continue;
            ctx.fillStyle = "green";
            ctx.fillRect(segment.x, segment.y, this.size, this.size);
            if(segment.dir.x === 1){
                ctx.fillStyle = "blue";
                ctx.beginPath();
                ctx.moveTo(segment.x,segment.y);
                ctx.lineTo(segment.x+this.size,segment.y+this.size/2);
                ctx.lineTo(segment.x,segment.y+this.size);
                ctx.stroke();
            } else if(segment.dir.x === -1){
                ctx.fillStyle = "blue";
                ctx.beginPath();
                ctx.moveTo(segment.x+this.size,segment.y);
                ctx.lineTo(segment.x,segment.y+this.size/2);
                ctx.lineTo(segment.x+this.size,segment.y+this.size);
                ctx.stroke();
            } else if(segment.dir.y === -1){
                ctx.fillStyle = "blue";
                ctx.beginPath();
                ctx.moveTo(segment.x,segment.y+this.size);
                ctx.lineTo(segment.x+this.size/2,segment.y);
                ctx.lineTo(segment.x+this.size,segment.y+this.size);
                ctx.stroke();
            } else {
                ctx.fillStyle = "blue";
                ctx.beginPath();
                ctx.moveTo(segment.x,segment.y);
                ctx.lineTo(segment.x+this.size/2,segment.y+this.size);
                ctx.lineTo(segment.x+this.size,segment.y);
                ctx.stroke();
            }
        }
        ctx.fillStyle = "black";
        ctx.fillRect(this.body[0].x,this.body[0].y,this.size,this.size);
    }
}
function drawPath(path, snake) {
    if(!path) return;
    ctx.strokeStyle = "black";  // Set stroke color to yellow
    ctx.lineWidth = 2;  // Set the thickness of the border

    let currentX = snake.body[0].x;  // Start from the snake's head
    let currentY = snake.body[0].y;

    // Iterate through each direction in the path
    for (let i = 0; i < path.length; i++) {
        let direction = path[i];  // Get the current direction (e.g., {x: 1, y: 0})

        // Calculate the next position based on the direction
        currentX += direction.x * snake.size;
        currentY += direction.y * snake.size;

        // Draw a rectangle at the next position
        ctx.strokeRect(
            currentX,  // x position (next position)
            currentY,  // y position (next position)
            snake.size,  // width of the rectangle (snake size)
            snake.size   // height of the rectangle (snake size)
        );
    }
}




class Fruit{
    constructor(x,y,size,color="red"){
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }

    respawn() {
        let isColliding = true;
        
        // Keep generating new positions until there's no collision
        while (isColliding) {
            this.x = Math.floor(Math.random() * (canvas.width / this.size)) * this.size;
            this.y = Math.floor(Math.random() * (canvas.height / this.size)) * this.size;
            isColliding = false;
    
            // Check for collisions with the snake's body
            for (let segment of snake.body) {
                if (collides(this, segment)) {
                    isColliding = true;
                    break; // Break out of the loop if a collision is found
                }
            }
        }
    }
    

    draw(ctx){
        ctx.fillStyle=this.color;
        ctx.fillRect(this.x,this.y,this.size,this.size);
    }

}

function collides(snakeHead, fruit) {
    return snakeHead.x === fruit.x && snakeHead.y === fruit.y;
/*     return (
        snakeHead.x < fruit.x + fruit.size &&
        snakeHead.x + snake.size > fruit.x &&
        snakeHead.y < fruit.y + fruit.size &&
        snakeHead.y + snake.size > fruit.y
    ); */
}


let snake = new Snake(Math.floor(canvas.width/2),Math.floor(canvas.height/2),50);
let fruit = new Fruit(Math.floor(canvas.width/3),Math.floor(canvas.height/3),50);

function init (){
    snake = new Snake(Math.floor(canvas.width/2),Math.floor(canvas.height/2),50);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    fruit = new Fruit(Math.floor(canvas.width/3),Math.floor(canvas.height/3),50);
}

function autoPilot(snake, fruit){
    if(snake.body[0].x < fruit.x + fruit.size && snake.body[0].x + snake.size > fruit.x){
        if(snake.y < fruit.y){
            snake.changeDirection({x:0,y:1});
        } else {
            snake.changeDirection({x:0,y:-1});
        }
    } else if (snake.body[0].y < fruit.y + fruit.size && snake.body[0].y + snake.size > fruit.y){
        if(snake.x < fruit.x){
            snake.changeDirection({x:1,y:0});
        } else {
            snake.changeDirection({x:-1,y:0});
        }
    }
}

function bfsAutoPilot(snake, fruit){
    let path = bfs(snake, fruit);

    if(path && path.length > 0){
        let nextMove = path[0];
        snake.changeDirection(nextMove);
        return path;
    }
}

let lastTime = 0;
function gameLoop(currentTime){
    const dTime = currentTime - lastTime;
    if (dTime >= frameLength && snake.alive){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        //autoPilot(snake,fruit);
        let path = bfsAutoPilot(snake,fruit);
        if(moveThroughWalls) snake.moveThroughWalls();
        else snake.move();
        snake.draw(ctx);
        fruit.draw(ctx);
        drawPath(path, snake);
        if(collides(snake.body[0],fruit)){
            snake.grow();
            fruit.respawn();
        }
        lastTime = currentTime;
    }

    requestAnimationFrame(gameLoop);
}

function toggleWalls(){
    moveThroughWalls = !moveThroughWalls;
    document.getElementById("walltoggle").classList.toggle("pressed");
}

function start(){
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
    if ((event.key === "ArrowUp" || event.key === "w") && snake.direction.y === 0) {
        snake.changeDirection({ x: 0, y: -1 });
    } else if ((event.key === "ArrowDown" || event.key === "s") && snake.direction.y === 0) {
        snake.changeDirection({ x: 0, y: 1 });
    } else if ((event.key === "ArrowLeft" || event.key === "a") && snake.direction.x === 0) {
        snake.changeDirection({ x: -1, y: 0 });
    } else if ((event.key === "ArrowRight" || event.key === "d") && snake.direction.x === 0) {
        snake.changeDirection({ x: 1, y: 0 });
    }
});
