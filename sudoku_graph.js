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
            str += ("\n")
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
        this.prohibitedColors = [];
        this.row = row;
        this.column = column;
        this.groupID = Math.floor(this.row / 3) * 3 + Math.floor(this.column / 3);
        this.adjacencyIndex = this.row * Sudoku.ROW_SIZE + this.column;
    },
    
    BindNodeFunctions: function() {
        Sudoku.Node.prototype.getAdjacentNodes = function(){
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
            return; 
        }
 
        // Make sure the value is within our bounds
        if(isNaN(value) || value < 1 || value > 9) {
            input.value = "";
            node.coloring = 0;
            return;
        }


        // Make sure this coloring is avaliable 
        if(!this.testColoring(node, value)) {
            input.value = "";
            node.coloring = 0;
            return;
        }

        node.coloring = parseInt(value);

    },

    testColoring: function(node, color) {
        var index = node.adjacencyIndex;
        var testColumn = this.adjacency_matrix[index];

        for(var i = 0; i < testColumn.length; i++) {
            // Only consider nodes that are adjacent
            if(testColumn[i] != 1) {
                continue;
            }

            // Get the corresponding node based on the adjacency index
            var column = i % this.COLUMN_SIZE;
            var row = Math.floor((i - column) / this.ROW_SIZE);
            var testNode = this.Tables[row][column];

            // if the adjacent node already has our desired color, then it isn't avaliable
            if(testNode.coloring == color) {
                return false;
            }
        }
        // If we get to this point, all adjacent nodes have not taken the color yet
        return true;
    }

    /* 
     *  Utility functions for the Node class
     *  getGroupID, getAdjacencyIndex, getPotentialColors
     */
};