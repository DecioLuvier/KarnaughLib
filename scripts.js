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


//Temporario
//Motivo: Por algum motivo funciona, mas preciso estudar calculo
function removeDuplicates(arr) {
    const uniqueStrings = arr.map(subArr => JSON.stringify(subArr.sort()));
    const uniqueSet = new Set(uniqueStrings);
    const uniqueArrays = Array.from(uniqueSet).map(str => JSON.parse(str));
    return uniqueArrays;
}


function simplifyIslands(islands) {
    let uniqueIndexes = Array.from(new Set(islands.flat()));

    let largestIslands = [];
    uniqueIndexes.forEach(index => {
        let allIslandsWithIndex = islands.filter(island => island.includes(index));
        let islandsSortedBySize = allIslandsWithIndex.sort((a, b) => b.length - a.length);
        largestIslands.push(...allIslandsWithIndex.filter(island => island.length === islandsSortedBySize[0].length));
    });

    let uniqueLargestIslands = removeDuplicates(largestIslands);


    let uniqueSet = new Set(uniqueIndexes);

    function coversAllIndexes(combination) {
        let combinedIndexes = new Set(combination.flat());
        return uniqueSet.size === combinedIndexes.size && [...uniqueSet].every(value => combinedIndexes.has(value));
    }

    let minCombinations = [];

    function generateCombinations(startIndex, currentCombination) {
        if (coversAllIndexes(currentCombination)) {
            if (minCombinations.length === 0 || currentCombination.length < minCombinations.length) {
                minCombinations = [...currentCombination];
            }
        }
        for (let i = startIndex; i < uniqueLargestIslands.length; i++) {
            generateCombinations(i + 1, [...currentCombination, uniqueLargestIslands[i]]);
        }
    }

    generateCombinations(0, []);

    return minCombinations;
}

//