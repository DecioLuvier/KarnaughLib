class KTruth {
    constructor(targetTable) {
        this.variables;
        this.values;
        this.kMap;
        this.kAlgebra;
        this.kInput;

        this.refresh = function(){
            this.kMap.importTruthValues(this.values)
            this.kMap.drawGrid();
            this.kMap.searchIslands();
            this.kMap.drawBorders();
            this.kAlgebra.textContent = "Solução: " + this.kMap.getAlgebraExpression();
        }

        this.setVariables = function(newVariables){
            if(newVariables < 2) 
                throw new Error("It is impossible to make a Karnaugh map with less than two variables");

            this.variables = newVariables
            this.values = Array(getMaxBinaryCombinationsLength(newVariables.length)).fill(0);
        }

        this.draw = function(){      
            const table = document.getElementById(targetTable);
            table.innerHTML = "";
                const thead = document.createElement('thead');
                    const row = document.createElement('tr');
                    for (let i = 0; i < this.variables.length; i++) {
                        const thElement1 = document.createElement('th');
                        thElement1.textContent = this.variables[i];
                        row.appendChild(thElement1);
                    } 
                    const thElement2 = document.createElement('th');
                    thElement2.textContent = "S";
                    row.appendChild(thElement2);
                thead.appendChild(row);
            table.appendChild(thead);
            const tbody = document.createElement('tbody');
            for (let i = 0; i < getMaxBinaryCombinationsLength(this.variables.length); i++) {
                const column = document.createElement('tr');
                let binary = decimalToBinary(i, this.variables.length);
                for (let j = 0; j < this.variables.length; j++) {
                    const thElement3 = document.createElement('td');
                    thElement3.textContent = binary[j];
                    column.appendChild(thElement3);
                }
                const thElement4 = document.createElement('td');
                const buttonElement = document.createElement('button');
                buttonElement.textContent = this.values[i];
                buttonElement.classList.add('truth-button');
                buttonElement.style.backgroundColor = this.values[i] === 1 ? 'green' : 'rgb(200, 90, 60)';
                buttonElement.addEventListener('click', function(event) {
                    this.values[i] = this.values[i] === 0 ? 1 : 0;
                    buttonElement.textContent = this.values[i];
                    buttonElement.style.backgroundColor = this.values[i] === 1 ? 'green' : 'rgb(200, 90, 60)';
                    this.refresh();
                }.bind(this));
                thElement4.appendChild(buttonElement);
                column.appendChild(thElement4);
                tbody.appendChild(column);
            } 
            table.appendChild(tbody);
        }
    }
}