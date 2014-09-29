SearchAlgorithm
===============

 This is a program that makes a random "maze" in the grid. A start point, and an end point is 
 then randomly generated. The program then computes the shortest path from the start to the finish 
 using Dijkstra's algorithm.

There are two different kinds of searching algorithms implemented. The first is Breadth-First 
Search. This algorithm traverses the nodes in level-order. The second algorithm is Depth-First 
Search. In particular, pre-order traversal is used. Note that with depth-first search, the minimal 
path from the red node to the blue node will probably not be chosen. That is because an unweighted 
graph is being used.

When an algorithm starts, the visisted nodes are coloured with #999999, while the nodes that are in 
the active front are coloured with #555555 
