function getMaxBinaryCombinationsLength(number){
    return 1 << number;
}

/**
 * @param {number} num 
 * @returns {boolean}
 */
function isPowerOfTwo(num) {
    return num > 0 && (num & (num - 1)) === 0;
}

/**
 * @param {string} binary 
 * @returns {number} 
 */
function binaryToDecimal(binary) {
    return parseInt(binary, 2);
}

/**
 * @param {number} decimal 
 * @param {number} [offset=0] 
 * @returns {string} - The binary representation of the decimal number, possibly padded with leading zeros.
 */
function decimalToBinary(decimal, offset = 0) {
    return decimal.toString(2).padStart(offset, '0');
}

/**
 * @param {string} binary 
 * @returns {string} 
 */
function binaryToGray(binary) {
    let gray = '';
    gray += binary[0];
    for (let i = 1; i < binary.length; i++)
        gray += binary[i - 1] ^ binary[i];
    return gray;
}

/**
 * @param {Array} array
 * @returns {boolean} 
 */
function hasDuplicates(array) {
    let set = new Set(array);
    return set.size !== array.length;
}

function removeDuplicates(arr) {
    const seen = new Set();
    const result = [];
    
    arr.forEach(item => {
        const sortedItem = item.slice().sort();
        const stringified = JSON.stringify(sortedItem);
        
        if (!seen.has(stringified)) {
            seen.add(stringified);
            result.push(item);
        }
    });
    
    return result;
}

function simplifyIslands(islands) {
    let uniqueIndexes = Array.from(new Set(islands.flat()));
    let largestIslands = [] 
    
    uniqueIndexes.forEach(index => {
        let allIslandsWithIndex = islands.filter(island => island.includes(index));
        let islandsSortedBySize = allIslandsWithIndex.sort((a, b) => b.length - a.length);
        largestIslands.push(islandsSortedBySize[0]);
    });
    
    let uniqueLargestIslands = removeDuplicates(largestIslands)
    
    let finalArrays = [];
    for (let i = 0; i < uniqueLargestIslands.length; i++) {
        let remainingArrays = uniqueLargestIslands.slice(0, i).concat(uniqueLargestIslands.slice(i + 1));
        let remainingFlatArray = remainingArrays.flat();

        if (!uniqueLargestIslands[i].every(element => remainingFlatArray.includes(element))) {
            finalArrays.push(uniqueLargestIslands[i]);
        }
    }

    return finalArrays;
}
