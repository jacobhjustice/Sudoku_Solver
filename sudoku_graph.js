var Sudoku = {

    ROW_SIZE: 9,

    COLUMN_SIZE: 9,

    /*
     *  Tables is a 9 x 9 array, where Tables[i][j] returns the node for row i, column j
     */
    Tables: [],

    /*
     * Adjacency Matrix is 
     * 
     * 
     */
    adjacency_matrix: [],

    /*
     * Initialize sets up the Tables array with empty node values
     */
    initialize: function() {
        this.BindNodeFunctions();
        for (var i = 0; i < this.ROW_SIZE; i++) {
            this.Tables.push([]);
            for (var o = 0; o < this.COLUMN_SIZE; o++) {
                var node = new this.Node(i, o)
                this.Tables[i].push(node);
            }
        }
        this.initialize_adjacency();
    },

    initialize_adjacency: function () {
        // Create an empty matrix and leave each vertex unadjacent
        for (var i = 0; i < 81; i++) {
            this.adjacency_matrix.push([]);
            for (var o = 0; o < 81; o ++) {
                this.adjacency_matrix[i].push(0);
            }
        }

        // Now for each vertex, set value of 1 for every other vertex that is connected
        // Can half this workload in the future
        for (var i = 0; i < 81; i++) {
            // Get the corresponding node based on the adjacency index
            var column = i % this.COLUMN_SIZE;
            var row = Math.floor((i - column) / this.ROW_SIZE);
            var node = this.Tables[row][column];

            // Mark the adjacency matrix as one for each node in the same column
            for(var o = 0; o < 9; o++) {
                if(column == o)
                    continue;
                var adjNode = this.Tables[row][o];
                this.adjacency_matrix[i][adjNode.adjacencyIndex] = 1;              
            }

            // Mark the adjacency matrix as one for each node in the same row
            for(var o = 0; o < 9; o++) {
                if(row == o)
                    continue;
                var adjNode = this.Tables[o][column];
                this.adjacency_matrix[i][adjNode.adjacencyIndex] = 1;
            }
            // Mark the adjacency matrix as one for each node in the same group
            var groupStartRow = Math.floor(node.groupID / 3) * 3;
            var groupStartColumn = (node.groupID % 3) * 3;
            for(var o = groupStartRow; o < groupStartRow + 3; o++) {
                for(var p = groupStartColumn; p < groupStartColumn + 3; p++) {
                    if(row == o && column == p)
                        continue;
                    var adjNode = this.Tables[o][p];
                    this.adjacency_matrix[i][adjNode.adjacencyIndex] = 1;
                    if(adjNode.groupID != node.groupID) {
                        console.log("ERROR: THE WRONG GROUPS ARE BEING PAIRED:");
                        console.log(node);
                        console.log(adjNode);
                    }
                }
            }
        }

        var str = "";
        for(var i = 0; i < 81; i++) {
            for(var o = 0; o < 81; o ++) {
                str += (this.adjacency_matrix[i][o] + " ");
            }
            str += ("\n");
        }
        //console.log(str);
    },


    /*
     *  Node is the data structure of any given "cell" of the game.
     *  Coloring is the int value of a "color" assigned to the node
     *  ProbibitedColors is the array of integers that cannot be assigned to this node
     *                      and is used to determine the coloring
     *  Row is the index the element exists in inside Tables
     *  Column is the index the element exists in inside Tables[row]
     */
    Node: function(row, column){
        this.coloring = 0;
        this.row = row;
        this.column = column;
        this.groupID = Math.floor(this.row / 3) * 3 + Math.floor(this.column / 3);
        this.adjacencyIndex = this.row * Sudoku.ROW_SIZE + this.column;
        this.potentialColor = 0;
    },
    
    BindNodeFunctions: function() {
        Sudoku.Node.prototype.getAdjacentNodes = function() {
            var adjColumn = Sudoku.adjacency_matrix[this.adjacencyIndex];
            var adjNodes = [];
            for(var i = 0; i < adjColumn.length; i++) {
                if(adjColumn[i] == 0)
                    continue;
                var column = i % Sudoku.COLUMN_SIZE;
                var row = Math.floor((i - column) / Sudoku.ROW_SIZE);
                var adjNode = Sudoku.Tables[row][column];
                adjNodes.push(adjNode);
            }  
            return adjNodes;
        };

        Sudoku.Node.prototype.getProhibitedColors = function() {
            var colors = [];
            var index = this.adjacencyIndex;
            var testColumn = Sudoku.adjacency_matrix[index];
    
            for(var i = 0; i < testColumn.length; i++) {
                // Only consider nodes that are adjacent
                if(testColumn[i] != 1) {
                    continue;
                }
    
                // Get the corresponding node based on the adjacency index
                var column = i % Sudoku.COLUMN_SIZE;
                var row = Math.floor((i - column) / Sudoku.ROW_SIZE);
                var testNode = Sudoku.Tables[row][column];
                
                // If there is no coloring, we can move on
                if(testNode.coloring == 0 || isNaN(testNode.coloring)) {
                    continue;
                }

                // If the adjacent node's color hasn't been accounted for, add that
                if(colors.indexOf(testNode.coloring) == -1) {
                    colors.push(testNode.coloring);
                }
            }
            return colors;
        };

        Sudoku.Node.prototype.getValidColors = function() {
            // Start with array of all colors
            var colors = [];
            for(var i = 0; i < Sudoku.ROW_SIZE; i++) {
                colors.push(i + 1);
            }

            // Reject all colors that are invalid
            var invalid = this.getProhibitedColors();
            colors = colors.filter(function(c) {
                return invalid.indexOf(c) == -1;
            });
            return colors;
        }
    },


    BuildTableHTML: function() {
        var html = "";
        for (var i = 0; i < 9; i++) {
            html += '<div class = "gridRow">'
            for (var o = 0; o < 9; o++) {
                html += '<div class = "gridCell ' + ((o == 2 || o == 5 ) ? 'strongRight ' : '') + ((i == 2 || i == 5) ? ' strongBottom ' : '') + '"><input type = "number" min = "1" max = "9" class = "sudokuValue" data-row = "' + i +'" data-column = "' + o + '" onfocusout="Sudoku.updateColoring(this)" /></div>';
            }
            html += '</div>'
        }
        document.getElementById("grid").innerHTML = html;
    },

    updateColoring: function(input){
        var value = input.value;
        var row = input.dataset.row;
        var column = input.dataset.column; 
        var node = this.Tables[row][column];

        // If we are clearing the value, then that is always approved
        if(value == "") {
            node.coloring = 0;
            input.style.backgroundColor = "white";
            return; 
        }
 
        // Make sure the value is within our bounds
        if(isNaN(value) || value < 1 || value > 9) {
            input.value = "";
            node.coloring = 0;
            input.style.backgroundColor = "white";
            return;
        }


        // Make sure this coloring is avaliable 
        if(!this.testColoring(node, value)) {
            input.value = "";
            node.coloring = 0;
            input.style.backgroundColor = "white";
            return;
        }

        node.coloring = parseInt(value);
        input.style.backgroundColor = "lightgrey";

    },

    testColoring: function(node, color) {
        var colors = node.getProhibitedColors();
        return colors.indexOf(parseInt(color)) == -1;
    },

    /* 
     *  Utility functions for the Node class
     *  getGroupID, getAdjacencyIndex, getPotentialColors
     */

    solve: function() {
        var success = this.attemptCellColoring(0, 0);

        var text;
        var header = document.getElementById("heading");
        if(success) {
            text = "I solved your puzzle! Feel free to try another one!";
        } else {
            text = "Something went wrong. I couldn't solve the puzzle."
        }
        header.innerHTML = text;
    },

    attemptCellColoring: function(row, column, changeStack) {
        // Check for done, handle next row
        if(row == 8 && column == 9) {
            return true;
        } else if(column == 9) {
            row++;
            column = 0;
        }
 
        // Get the current node, valid colors, and the corresponding html cell
        var node = this.Tables[row][column];
        var colors = node.getValidColors();
        var cell = document.querySelector(".sudokuValue[data-row='" + row +"'][data-column='" + column + "']");

        // If this cell was already colored, move on (this means it's user input)
        if(!isNaN(node.coloring) && node.coloring > 0) {
            var success = this.attemptCellColoring(row, column + 1);
            return success;
        }

        // For each valid color of node (starting at the first avaliable) set the current node to the current color
        // Move on to the next cell working off of the assumption that the past colors are all valid for the rest of the puzzle
        // If at any point there are no avaliable colors (or we are out of colors), we know the present solution is not valid
        // So we will return false and try the next color for the layer above.
        for(var i = 0; i < colors.length; i++) {
            
            node.coloring = colors[i];
            cell.value = colors[i];
            var success = this.attemptCellColoring(row, column + 1);
            if(success) {
                return true;
            }
        }

        cell.value = "";
        node.coloring = 0;
        return false;

    }
};