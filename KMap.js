class KMap {
    constructor(targetTable, isVerticalOrientation) {
        this.targetTable = targetTable
        this.values; // [[0 | 1 | 2 - Don't Care]]
        this.orientation = isVerticalOrientation; // true - Vertical | false - Horizontal
        this.variables; // ["A", "B", "C"]
        this.columnVariables; //["A","B"]
        this.columnMaxBinaryCombinationsLength; //2^2
        this.columnBinary;  //["00","01", "11", "10"]
        this.rowVariables;  //["C"]
        this.rowMaxBinaryCombinationsLength; //2^1
        this.rowBinary; //["00","01"]
        this.islands;

        let setupGrid = () => {  
            const middle = Math.ceil(this.variables.length / 2);
            const msbPart = this.variables.slice(0, middle);
            const lsbPart = this.variables.slice(middle);
            if(this.orientation)
                [this.rowVariables, this.columnVariables] = [msbPart, lsbPart]
            else
                [this.columnVariables, this.rowVariables] = [msbPart, lsbPart]

            this.columnMaxBinaryCombinationsLength = getMaxBinaryCombinationsLength(this.columnVariables.length);
            this.rowMaxBinaryCombinationsLength = getMaxBinaryCombinationsLength(this.rowVariables.length);
            this.columnBinary = []
            this.rowBinary = []
            for (let i = 0; i <  this.columnMaxBinaryCombinationsLength; i++)                    
                this.columnBinary.push(binaryToGray(decimalToBinary(i, this.columnVariables.length)))
            for (let i = 0; i <  this.rowMaxBinaryCombinationsLength; i++)                 
                this.rowBinary.push(binaryToGray(decimalToBinary(i, this.rowVariables.length))) 
        }
    
        this.setVariables = function(newVariables){
            if(newVariables < 2) 
                throw new Error("It is impossible to make a Karnaugh map with less than two variables");

            this.variables = newVariables
            this.values = Array(getMaxBinaryCombinationsLength(newVariables.length)).fill(0);
            setupGrid();
        }

        this.flip = function(){
            this.orientation = !this.orientation
            setupGrid();
        }

        /** 
         * K-MAP only converts to gray code (0,1,11,10) once, and does all subsequent logic in a simple row and column grid.
         * So this function is pretty useful for importing a KTruth that is NOT in the gray code(0,1,10,11), 
         * @param {Array<Number>} newValues **/
        this.importTruthValues = function(newValues){
            if(this.values.length != newValues.length)
                throw new Error("Incompatible importTruthValues newValues");

            for (let x = 0; x < this.columnBinary.length; x++) {
                for (let y = 0; y < this.rowBinary.length; y++) {
                    let kMapIndex  = binaryToDecimal(this.rowBinary[y] + this.columnBinary[x]);

                    if(this.orientation)
                        this.values[kMapIndex] = newValues[y * this.columnBinary.length + x]
                    else
                        this.values[kMapIndex] = newValues[x * this.rowBinary.length + y]
                }
            }
        }

        this.importMapValues = function(newValues){
            if(this.values.length != newValues.length)
                throw new Error("Incompatible importMapValues newValues");
            this.values = newValues
        }
        
        this.getAdjacentIndex = function(index, direction) {
            let adjacentIndex;
            switch (direction) {
                case 'right':
                    if ((index + 1) % this.columnBinary.length === 0) 
                        adjacentIndex = index + 1 - this.columnBinary.length;
                    else
                        adjacentIndex = (index + 1) % this.values.length;
                    break;
                case 'bottom':
                    adjacentIndex = (index + this.columnBinary.length) % this.values.length;
                    break;
                case 'left':
                    if (index % this.columnBinary.length === 0)
                        adjacentIndex = index - 1 + this.columnBinary.length;
                    else
                        adjacentIndex = (index - 1) % this.values.length;
                    break;
                case 'top':
                    adjacentIndex = (index - this.columnBinary.length + this.values.length) % this.values.length;
                    break;
            }

            return adjacentIndex;
        }
    
        //Temporario
        //Motivo: Isso aqui devia ser por return, não por push diretamente no objeto
        let horizontalDFS = (indexes) => {
            if(isPowerOfTwo(indexes.length))
                this.islands.push(indexes)

            let lastIndex = indexes[indexes.length - 1];
            let rightIndex = this.getAdjacentIndex(lastIndex, "right")
            let newIndexes =  [...indexes, ...[rightIndex]]

            if(this.values[rightIndex] && !hasDuplicates(newIndexes))
                return horizontalDFS(newIndexes)
        }

        let verticalDFS = (islandToTest, safeIslands) => {
            let buffer = [];
            for (let index of islandToTest) {
                let belowIndex = this.getAdjacentIndex(index, "bottom")

                if (this.values[belowIndex] && !hasDuplicates([belowIndex, ...safeIslands])) 
                    buffer.push(belowIndex); 
                else {
                    buffer = false
                    break;
                }
            }
            if (buffer){
                let newSafeIslands = [...safeIslands, ...buffer]

                if(isPowerOfTwo(newSafeIslands.length))
                    this.islands.push(newSafeIslands)  
                verticalDFS(buffer, newSafeIslands);
            }
        }

        this.searchIslands = function(){
            this.islands = []
            for (let i = 0; i < this.values.length; i++) 
                if(this.values[i])
                    horizontalDFS([i])
                        
            for (let island of [...this.islands]) 
                verticalDFS(island, island)

            this.islands = simplifyIslands(this.islands)
        }
        //

        this.getBinary = function(index){
            let x = index % this.columnBinary.length;
            let y = Math.floor(index / this.columnBinary.length);
            if(this.orientation)
                return this.rowBinary[y] + this.columnBinary[x];
            else
                return this.columnBinary[x] +  this.rowBinary[y];
        }

        this.getAlgebraExpression = function(){
            let resultWords = [];

            if(this.islands.length == 0)
                return "0"

            if(this.islands.length == 1 && this.islands[0].length == this.values.length)
                return "1"

            this.islands.forEach(island => {
                let binaryCoordinates = [];
                island.forEach(index => binaryCoordinates.push(this.getBinary(index)));

                let resultWord = []
                for (let i = 0; i < this.variables.length; i++) {
                    if(binaryCoordinates.every(bit => bit[i] == '0'))
                        resultWord.push(`${this.variables[i]}'`)
                    else if(binaryCoordinates.every(bit => bit[i] == '1'))
                        resultWord.push(`${this.variables[i]}`)
                }
                resultWords.push(resultWord.join(""));
            });

            return resultWords.join(" + ");
        }

        this.drawBorders = function(){
            var table = document.getElementById(targetTable);
            var tds = table.getElementsByTagName('td');
            const colors = ["red", "blue", "yellow", "green", "purple", "orange", "pink", "cyan", "lime", "magenta"];
   

            this.islands.forEach((island, islandIndex) => {
                const color = colors[islandIndex % colors.length];

                let borders = []
                let rightCorner = []
                let leftCorner = []
                let topCorner = []
                let bottomCorner = []

                island.forEach(index => {
                    let buffer = [];
                    let checkRight = this.getAdjacentIndex(index, "right");
                    let checkLeft = this.getAdjacentIndex(index, "left");
                    let checkBottom = this.getAdjacentIndex(index, "bottom");
                    let checkTop = this.getAdjacentIndex(index, "top");
        
                    if (index > checkRight) rightCorner.push(index);
                    if (index < checkLeft) leftCorner.push(index);
                    if (index > checkBottom) bottomCorner.push(index);
                    if (index < checkTop) topCorner.push(index);
        
                    if (!hasDuplicates([checkRight, ...island])) buffer.push("border-right");
                    if (!hasDuplicates([checkLeft, ...island])) buffer.push("border-left");
                    if (!hasDuplicates([checkBottom, ...island])) buffer.push("border-bottom");
                    if (!hasDuplicates([checkTop, ...island])) buffer.push("border-top");
        
                    borders.push([index, buffer]);
                });

                borders.forEach(tuple => {
                    let index = tuple[0]
                    let border = tuple[1]
                    border.forEach(edge => {
                        const overlay = document.createElement('div');
                        overlay.classList.add(edge);
                        overlay.style.backgroundColor = color; 
                        tds[index].appendChild(overlay);
                    })
                });

                //Temporario
                //Motivo: Falta melhorar a facilidade de leitura
                const requiredBorders = ["border-left", "border-bottom", "border-top", "border-right"];
                const missingBorders = new Set(requiredBorders);

                borders.forEach(item => {
                    const [, borders] = item;
                    borders.forEach(border => {
                        if (missingBorders.has(border)) {
                        missingBorders.delete(border);
                        }
                    });
                });

                missingBorders.forEach(border => {
                    let coordinates = [];
                    switch (border) {
                        case "border-left":
                            coordinates = leftCorner;
                            break;
                        case "border-right":
                            coordinates = rightCorner;
                            break;
                        case "border-top":
                            coordinates = topCorner;
                            break;
                        case "border-bottom":
                            coordinates = bottomCorner;
                            break;
                    }
    
                    coordinates.forEach(coordinate => {
                        const overlay = document.createElement('div');
                        overlay.classList.add(border);
                        overlay.style.backgroundColor = color;
                        tds[coordinate].appendChild(overlay);
                    });
                });
                //
                
            })
        }

        this.drawGrid = function(){
            const table = document.getElementById(this.targetTable);
            table.innerHTML = "";
                const thead = document.createElement('thead');
                    const rows = document.createElement('tr');
                        rows.appendChild(document.createElement('th'));
                        var thElement1 = document.createElement('th');
                        thElement1.setAttribute('colspan', this.columnMaxBinaryCombinationsLength)
                        thElement1.textContent = this.columnVariables.join('')
                        rows.appendChild(thElement1);
                    thead.appendChild(rows);
                    const columns = document.createElement('tr');
                        var thElement2 = document.createElement('th');
                        thElement2.textContent = this.rowVariables.join('');
                        columns.appendChild(thElement2);
                        for (let i = 0; i <  this.columnMaxBinaryCombinationsLength; i++) {
                            const thElement3 = document.createElement('th');
                            thElement3.textContent = this.columnBinary[i];
                            columns.appendChild(thElement3);
                        }
                thead.appendChild(columns);
            table.appendChild(thead);
                const tbody = document.createElement('tbody');
                for (let x = 0; x < this.rowMaxBinaryCombinationsLength ; x++) {
                    const bodyBox = document.createElement('tr');
                    var thElement4 = document.createElement('th');
                    thElement4.textContent = this.rowBinary[x];
                    bodyBox.appendChild(thElement4);
                    for (let y = 0; y < this.columnMaxBinaryCombinationsLength; y++) {
                        var tdElement = document.createElement('td'); 
                        tdElement.textContent = this.values[x * this.columnMaxBinaryCombinationsLength + y];
                        bodyBox.appendChild(tdElement);
                    }
                    tbody.appendChild(bodyBox);
                }
            table.appendChild(tbody);
        }
    }
}