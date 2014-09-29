Searching Algorithm
===============

 This is a program that makes a random "maze" in the grid. A start point, and an end point is 
 then randomly generated. The program then computes the shortest path from the start to the finish 
 using Dijkstra's algorithm.

There are two different kinds of searching algorithms implemented. The first is Breadth-First 
Search. This algorithm traverses the nodes in level-order. The second algorithm is Depth-First 
Search. In particular, pre-order traversal is used. Note that with depth-first search, the minimal 
path from the red node to the blue node will probably not be chosen. That is because an unweighted 
graph is being used.

When an algorithm starts, the visisted nodes are coloured with ```#999999```, while the nodes that are in 
the active front are coloured with ```#555555```

Here is the algorithm that drives this script

```javascript
this.start.state = STATE.ACTIVE_FRONT;
var activeFront  = [this.start];
var done         = false;

while (activeFront.length > 0 && !done) {
    var node = null;

    if (searchType == "breadth") node = activeFront.shift();
    if (searchType == "depth")   node = activeFront.pop();

    if (node.state == STATE.ACTIVE_FRONT) {
        for (var i = 0; i < 4; i++) {
            if (!(node.x + DIRECTION[i].x > -1 && 
                  node.x + DIRECTION[i].x < this.columns && 
                  node.y + DIRECTION[i].y > -1 && 
                  node.y + DIRECTION[i].y < this.rows))
                continue;

            var neighbour = this.adjacencyMatrix[node.x + DIRECTION[i].x][node.y + DIRECTION[i].y];

            if (this.processNode(neighbour, node)) {
                done = true;
                break;
            } else if (neighbour.state == STATE.ACTIVE_FRONT) {
                activeFront.push(neighbour);
            }
        }

        node.state = STATE.VISITED;

        if (activeFront.length == 0) {
            document.getElementById("breadthAni").disabled = false;
            document.getElementById("depthAni").disabled   = false;
            document.getElementById("breadth").disabled    = false;
            document.getElementById("depth").disabled      = false;
            document.getElementById("reset").disabled      = false;

            alert("No possible paths from red to blue!");
        }
    }
}

if (done) {
    this.drawPath();
}
```

For a working example, please visit http://www.tomfischer.ca/maze.html
