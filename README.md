# Sudoku_Solver
An app that finds a sudoku solution for any given input using graph theory principles

## What? 
This is a small web application I made experimenting with some basic graph theory concepts in order to solve a sudoku puzzle

## How? 
The k-coloring concept is described here: https://mathworld.wolfram.com/k-Coloring.html

A game of sudoku can be thought of as a graph. A given node has exactly 20 adjacent nodes (there are 8 other cells in a row, 8 other cells in a column, and 4 uncounted cells in the same 3x3 grouping). However, we know the k-coloring is 9. How? Because the whole point of sudoku is to find a way to properly color (erm... number) the cells with a k-coloring of 9. 

The implementation ultimately works out to a depth-first search solution to solve the sudoku game, but using some graph theory concepts, it is able to quickly lookup to check adjacency with other cells. Moreover, taking the approach of a graph theory problem can help you to see the sudoku game in a whole new light!

## Why?
I was bored one night in college, and wanted to apply some mathematical ideas to a software problem

## Where?

You can view the project by going to https://jacobhjustice.github.io/Sudoku_Solver/

You can view the solver locally by opening up the index.html page
