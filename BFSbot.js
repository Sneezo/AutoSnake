export function isValidPosition(x,y,snake){
    if(x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return false;

    for (let segment of snake.body){
        if(segment.x === x && segment.y === y) return false;
    }

    return true;
}

export function bfs(snake,fruit){
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