/* --------------------------------------- */
/*               Point Class               */
/* --------------------------------------- */

function Point(x, y) {
    // Constructor
    this.x = x;
    this.y = y;
}

Point.prototype.x = 0;                              // Holds the x coordinate
Point.prototype.y = 0;                              // Holds the y cooddinate

Point.prototype.getX = function () {                // Retrieves the x coordinate
    return this.x;
}

Point.prototype.getY = function () {                // Retrieves the y coordinate
    return this.y;
}

Point.prototype.moveTo = function (x, y) {          // Moves the point to a new location
    this.x = x;
    this.y = y;
}

Point.prototype.toString = function () {            // For debugging purposes
    return "x: " + this.x + ", y: " + this.y;
}

/* --------------------------------------- */
/*             Point Constants             */
/* --------------------------------------- */

// Constant values that are assigned to a node's state
var STATE = {
    "EMPTY"        : 0,
    "WALL"         : 1,
    "VISITED"      : 2,
    "ACTIVE_FRONT" : 3,
    "PATH"         : 4
};

// Direction constants for visiting neighbouring nodes. 
// 0 = DOWN, 1 = RIGHT, 2 = UP, 3 = LEFT
var DIRECTION = [ new Point(0, 1), new Point(1, 0), new Point(0, -1), new Point(-1, 0) ];

if (Object.freeze) {
    Object.freeze(STATE);
    Object.freeze(DIRECTION);
}

/* --------------------------------------- */
/*               Node Class                */
/* --------------------------------------- */

function Node(x, y, state) {
    // Constructor
    Point.call(this, x, y);                     // Node extends Point
    this.state = state;
}

Node.prototype.state       = STATE.EMPTY;       // The state of a node
Node.prototype.distance    = 0;                 // How far this node is from the start node (UNUSED)
Node.prototype.predecessor = null;              // The predecessor of this node

/* --------------------------------------- */
/*               Grid Class                */
/* --------------------------------------- */

function Grid(columns, rows) {
    // Constructor
    this.columns = columns;
    this.rows    = rows;
}

Grid.prototype.columns         = 0;             // The number of columns in this grid
Grid.prototype.rows            = 0;             // The number of rows in this grid
Grid.prototype.adjacencyMatrix = [];            // The underlying 2D array
Grid.prototype.start           = null;          // The starting node
Grid.prototype.end             = null;          // The ending node

Grid.prototype.initialize = function () {                                   // Used to initialize the adjacency matrix, and draw the grid
    ctx.fillStyle = "#000000";
    this.adjacencyMatrix = new Array(this.columns);

    for (var i = 0; i < this.columns; i++) {                                // Iterate through all columns
        this.adjacencyMatrix[i] = new Array(this.rows);

        for (var j = 0; j < this.rows; j++) {                               // Iterate through all rows
            if (Math.random() > 0.70) {                                     // Each node has a 30% chance of being a wall in the maze
                this.adjacencyMatrix[i][j] = new Node(i, j, STATE.WALL);    // Set this cell as a wall
                ctx.fillRect(i * 20, j * 20, 20.5, 20.5);                   // Fill in the cell in the grid
            } else {
                this.adjacencyMatrix[i][j] = new Node(i, j, STATE.EMPTY);   // Set this cell as empty
            }

            ctx.rect(i * 20, j * 20, 20.5, 20.5);                           // Draw the outline for the grid
        }
    }

    ctx.stroke();                                       // Draw the changes to the canvas

    this.start = this.generateEndPoint("#FF0000");      // Generate the start point
    this.end   = this.generateEndPoint("#0000FF");      // Generate the end point
}

Grid.prototype.generateEndPoint = function (colour) {               // Used to generate an end point for the path
    ctx.fillStyle = colour;

    var x = 0;
    var y = 0;

    do {
        // Get a random value between [0, Width of the container in pixels / 20 - 1]
        var x = parseInt(Math.random() * Math.floor(document.querySelector('canvas').offsetWidth / 20) - 1);
        var y = parseInt(Math.random() * 20);                       // Get a random value between [0, 19]
    } while (!(this.adjacencyMatrix[x][y].state == STATE.EMPTY));   // Loop through until this node is an empty node
   
    ctx.fillRect(x * 20, y * 20, 20.5, 20.5);                       // Fill in the node with the colour from the parameter
    ctx.stroke();                                                   // Update the canvas

    return this.adjacencyMatrix[x][y];                              // Return this node
}

Grid.prototype.findPathAnimation = function (searchType) {          // Used to find a path from start to end
    //this.start.distance = 0;
    this.start.state = STATE.ACTIVE_FRONT;                          // Set the state of the node
    var activeFront = [this.start];                                 // Add this node to a queue/stack
    var done = false;                                               // Create a variable for determining if a path has been found

    this.search(activeFront, done, searchType);                     // Recursive call to the search algorithm
}

Grid.prototype.search = function (activeFront, done, searchType) {  // Used to find a path from start to end
    var node = null;

    if (searchType == "breadth") node = activeFront.shift();        // If the search type is breadth firt search, use a Queue
    if (searchType == "depth")   node = activeFront.pop();          // If the search type is depth first search, use a Stack

    if (!done && node.state == STATE.ACTIVE_FRONT) {
        if (node != this.start) {                                   // Fill in this node if it is not the start (For visited nodes)
            ctx.fillStyle = "#999999";
            ctx.fillRect(node.x * 20, node.y * 20, 20.5, 20.5);
            ctx.stroke();
        }

        ctx.fillStyle = "#555555";                                  // Colour for nodes in the active front

        for (var i = 0; i < 4; i++) {                               // Iterate through all 4 directions
            // If the node is out of bounds
            if (!(node.x + DIRECTION[i].x > -1 && node.x + DIRECTION[i].x < this.columns && node.y + DIRECTION[i].y > -1 && node.y + DIRECTION[i].y < this.rows))
                continue;                                           // Skip this node

            // Save the address to the neighbouring node
            var neighbour = this.adjacencyMatrix[node.x + DIRECTION[i].x][node.y + DIRECTION[i].y];

            // Process the node (check its state, and set a predecessor if it is a valid path node).
            // This function returns whether or not this node is the end node
            if (this.processNode(neighbour, node)) {
                done = true;                                                    // Tell the algorithm that the end node has been found
            } else if (neighbour.state == STATE.ACTIVE_FRONT) {                 // If the node has the state ACTIVE_FRONT
                activeFront.push(neighbour);                                    // Push this node to the queue/stack
                ctx.fillRect(neighbour.x * 20, neighbour.y * 20, 20.5, 20.5);   // Fill in the cell
            }
        }

        node.state = STATE.VISITED;                                 // Set the node to VISITED
        ctx.stroke();                                               // Update the canvas

        if (activeFront.length > 0 && !done) {                      // If the active front is not empty and the end node has not been found
            // Recursively call this function again with a delay
            setTimeout((function () { this.search(activeFront, done, searchType); }).bind(this), 50);
        } else if (activeFront.length == 0) {                       // If the queue/stack is empty
            document.getElementById("breadthAni").disabled = false;
            document.getElementById("depthAni").disabled   = false;
            document.getElementById("breadth").disabled    = false;
            document.getElementById("depth").disabled      = false;
            document.getElementById("reset").disabled      = false;

            alert("No possible paths from red to blue!");           // Tell the user that there are no possible paths
            done = true;
        }
    } else {
        this.search(activeFront, done, searchType);                 // Call this function again with no delay
    }

    if (done) {             // If a path has been found
        this.drawPath();    // Draw the path
    }
}

Grid.prototype.processNode = function (node, parent, end) {         // Used to process the neighbouring nodes
    if (node.state == STATE.EMPTY) {                                // If the state of the node is EMPTY
        //node.distance = parent.distance + 1;
        node.predecessor = parent;                                  // Set the predecessor of this node

        if (node == this.end)                                       // Check if this node is the end node
            return true;                                            // Return that this node is the end node

        node.state = STATE.ACTIVE_FRONT;                            // Set the state of the node to ACTIVE_FRONT
    }

    return false;
}

Grid.prototype.drawPath = function () {                             // Draw the path from start to end
    ctx.fillStyle = "#00FF00";
    var node = this.end;                                            // Set the current node to the end node

    while (node.predecessor != null) {                              // Loop through while the current node is not the start node
        node = node.predecessor;                                    // Move backwards to the next node in the path

        if (node != this.start)                                     // If this node is not the start node
            ctx.fillRect(node.x * 20, node.y * 20, 20.5, 20.5);     // Fill in this node
    }

    ctx.stroke();                                                   // Update the canvas

    document.getElementById("reset").disabled = false;
}

Grid.prototype.findPath = function (searchType) {                   // Used to find a path from start to end (without an animation)
    this.start.state = STATE.ACTIVE_FRONT;                          // Set the state of the first node
    var activeFront  = [this.start];                                // Add the first node to the queue/stack
    var done         = false;                                       // Used to determine if the end node has been found

    while (activeFront.length > 0 && !done) {                       // Loop through until the end node has been found or the queue/stack is empty
        var node = null;

        if (searchType == "breadth") node = activeFront.shift();    // If the search type is breadth firt search, use a Queue
        if (searchType == "depth")   node = activeFront.pop();      // If the search type is depth firt search, use a Stack

        if (node.state == STATE.ACTIVE_FRONT) {                     // Check if this node in in the active front
            for (var i = 0; i < 4; i++) {                           // Iterate through all neighbouring nodes
                // If the neighbouring node is out-of-bounds
                if (!(node.x + DIRECTION[i].x > -1 && node.x + DIRECTION[i].x < this.columns && node.y + DIRECTION[i].y > -1 && node.y + DIRECTION[i].y < this.rows))
                    continue;                                       // Skip this node

                // Save the address of the neighbouring node
                var neighbour = this.adjacencyMatrix[node.x + DIRECTION[i].x][node.y + DIRECTION[i].y];

                // Process the node (check its state, and set a predecessor if it is a valid path node).
                // This function returns whether or not this node is the end node
                if (this.processNode(neighbour, node)) {
                    done = true;                                        // Tell the algorithm that the end node has been found
                    break;                                              // Break out of this for-loop
                } else if (neighbour.state == STATE.ACTIVE_FRONT) {     // If the node is not the end node, but it is in the active front
                    activeFront.push(neighbour);                        // Push this node to the queue/stack
                }
            }

            node.state = STATE.VISITED;                                 // Set the node state to VISITED

            if (activeFront.length == 0) {                              // If the active front is empty
                document.getElementById("breadthAni").disabled = false;
                document.getElementById("depthAni").disabled   = false;
                document.getElementById("breadth").disabled    = false;
                document.getElementById("depth").disabled      = false;
                document.getElementById("reset").disabled      = false;

                alert("No possible paths from red to blue!");           // Alert the user that there are not valid paths from start to end
            }
        }
    }

    if (done) {             // If a path was found
        this.drawPath();    // Draw the path
    }
}

//////////////////////////////////////////////////////

var ctx       = document.getElementById("ctx").getContext("2d");    // Define the canvas
ctx.fillStyle = "#000000";                                          // Set the fill style to black

var grid = null;                                                    // Initialize a new grid

function initialize(canvas) {                                       // Runs when the page loads
    document.getElementById("breadthAni").disabled = false;
    document.getElementById("depthAni").disabled   = false;
    document.getElementById("breadth").disabled    = false;
    document.getElementById("depth").disabled      = false;
    document.getElementById("reset").disabled      = false;

    canvas.style.width='100%';                                      // Set the width of the canvas to match the width of the parent
    canvas.width  = canvas.offsetWidth;                             // Gets the width of th canvas in pixels

    grid = new Grid(Math.floor(canvas.offsetWidth / 20) - 1, 20);   // Calculate how many columns there are and create a new grid

    grid.initialize();                                              // Initialize the grid/draw it
}

function run(searchType, animation) {                               // Runs the search algorithm
    document.getElementById("breadthAni").disabled = true;
    document.getElementById("depthAni").disabled   = true;
    document.getElementById("breadth").disabled    = true;
    document.getElementById("depth").disabled      = true;
    document.getElementById("reset").disabled      = true;

    if (animation)
        grid.findPathAnimation(searchType);
    else
        grid.findPath(searchType);
}

function reset() {                                                  // Resets the grid
    grid = null;
    grid = new Grid(Math.floor(document.querySelector('canvas').offsetWidth / 20) - 1, 20);
    ctx.clearRect(0, 0, document.querySelector('canvas').offsetWidth, 420);

    document.getElementById("breadthAni").disabled = false;
    document.getElementById("depthAni").disabled   = false;
    document.getElementById("breadth").disabled    = false;
    document.getElementById("depth").disabled      = false;

    grid.initialize();                                              // Initializes the grid
}

window.onload = initialize(document.querySelector('canvas'));       // Initialize the grid when the page loads