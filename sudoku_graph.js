var Sudoku = {

    ROW_SIZE: 9,

    COLUMN_SIZE: 9,

    /*
     *  Tables is the 9 x 9 array backing the sudoku board, where Tables[i][j] returns the node for row i, column j.
     */
    Tables: [],

    /*
     *  AdjacencyMatrix is an 81 x 81 matrix used to determine if any two nodes are adjacent to each other.
     *  A "1" in AdjacencyMatrix[i][j] implies that the node with adjacencyIndex i is adjacent to the node with adjacencyIndex j.
     *  In general, adjacent nodes for the Sudoky game are those which cannot have the same values,
     *  So any given node is adjactent to every node (except itself) in it's column, row, and 3 x 3 grouping.
     *  The relationship between adjacencyIndex, column, and row for a given node N can be seen as follows:
     *      N.adjacencyIndex = N.row * Sudoku.ROW_SIZE + N.column
     *      N.column = N.adjacencyIndex % Sudoku.COLUMN_SIZE
     *      N.row = Math.floor((N.adjacencyIndex - N.column) / Sudoku.ROW_SIZE)
     */
    AdjacencyMatrix: [],

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
            this.AdjacencyMatrix.push([]);
            for (var o = 0; o < 81; o ++) {
                this.AdjacencyMatrix[i].push(0);
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
                this.AdjacencyMatrix[i][adjNode.adjacencyIndex] = 1;              
            }

            // Mark the adjacency matrix as one for each node in the same row
            for(var o = 0; o < 9; o++) {
                if(row == o)
                    continue;
                var adjNode = this.Tables[o][column];
                this.AdjacencyMatrix[i][adjNode.adjacencyIndex] = 1;
            }
            // Mark the adjacency matrix as one for each node in the same group
            var groupStartRow = Math.floor(node.groupID / 3) * 3;
            var groupStartColumn = (node.groupID % 3) * 3;
            for(var o = groupStartRow; o < groupStartRow + 3; o++) {
                for(var p = groupStartColumn; p < groupStartColumn + 3; p++) {
                    if(row == o && column == p)
                        continue;
                    var adjNode = this.Tables[o][p];
                    this.AdjacencyMatrix[i][adjNode.adjacencyIndex] = 1;
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
                str += (this.AdjacencyMatrix[i][o] + " ");
            }
            str += ("\n");
        }
    },


    /*
     *  Node is the data structure of any given "cell" of the game table.
     *  Coloring is the int value of a "color" assigned to the node
     *  Row is the index the element exists in inside Tables
     *  Column is the index the element exists in inside Tables[row]
     *  GroupID corresponds to 1 of 9 unique 3 x 3 groups and is used for setting up AdjacencyMatrix
     *  AdjacencyIndex corresponds to the Node's row/column location in AdjacencyMatrix
     */
    Node: function(row, column){
        this.coloring = 0;
        this.row = row;
        this.column = column;
        this.groupID = Math.floor(this.row / 3) * 3 + Math.floor(this.column / 3);
        this.adjacencyIndex = this.row * Sudoku.ROW_SIZE + this.column;
    },
    
    /*
     *  BindNodeFunctions attaches member functions to individual node objects
     */
    BindNodeFunctions: function() {
        /*
         *  GetProhibitedColors retrieves an array of colors that cannot be used.
         *  This is determined by adding a color to the list if it is not already accounted for, and is an adjacent node's coloring.
         *  Note that different neighbors can have the same color as each other, and that's okay.
         */
        Sudoku.Node.prototype.getProhibitedColors = function() {
            var colors = [];
            var index = this.adjacencyIndex;
            var testColumn = Sudoku.AdjacencyMatrix[index];
    
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

        /*
         *  GetValidColors is the set of all colors with the prohibited colors removed.
         */
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

    /*
     *  BuildTableHTML takes care of generating our table on the document.
     */
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

    /*
     *  UpdateColoring is called on input change for any table cell's input box.
     *  The function checks the inputted value to make sure it is valid (no adjacent nodes have the same coloring),
     *  And then updates the correspoinging Node in Tables[row][column] to have the new coloring.
     */
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

    /*
     *  TestColoring checks to be sure that a given potential node coloring isn't used by any of its neighbors.
     */
    testColoring: function(node, color) {
        var colors = node.getProhibitedColors();
        return colors.indexOf(parseInt(color)) == -1;
    },

    /*
     *  Solve is called when you hit the solve button on the document.
     *  This is where the recursive coloring function is called, and the html is modified depending on the result.
     */
    solve: function() {
        var success = this.attemptCellColoring(0, 0);
        var text = success? "I solved your puzzle!<br/>Feel free to try another one!" : "Something went wrong. I couldn't solve the puzzle.";
        var header = document.getElementById("heading"); 
        header.innerHTML = text;
    },

    /*
     *  Reset is called when you hit the reset button on the document.
     *  All inputs in the table are cleared and our colorings for each node are reset to 0.
     */
    reset: function() {
        var values = document.querySelectorAll(".sudokuValue");
        for(var i = 0; i < this.ROW_SIZE; i++) {
            for(var o = 0; o < this.COLUMN_SIZE; o++) {
                this.Tables[i][o].coloring = 0;
            }
        }
        for(var i = 0; i < values.length; i++) {
            values[i].value = "";
            values[i].style.backgroundColor = "white";
        }
        document.getElementById("heading").innerHTML = 'Welcome to the Sudoku Solver! <br/>Input some cells using basic sudoku rules (No repeating 1-9 value in the same row, column, or 3x3 grouping), and then hit "Solve Puzzle!"'
    },
    
    /*
     *  AttemptCellColoring is a recursive function that systematically colors each cell in the table with one of it's avaliable colors.
     *  Starting at Sudoku.Tables[0][0] move on to the next color (Sudoku.Tables[0][1]) if this cell has been set by user,
     *  Otherwise, set the current cell to be the first avaliable color (Node.getValidColors()) and then call attemptCellColoring(row, column+1).
     *  If at any point there are no avaliable colors, return false upstream until we get to a point there is another avaliable color.
     *  We will eventually finish the puzzel by backtracking when neccesary. At that point, we return true all the way back to the initial call.
     */
    attemptCellColoring: function(row, column) {
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