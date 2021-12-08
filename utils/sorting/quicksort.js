/**
 * Swap the places of two elements.
 *
 * @private
 * @param {array} array 
 * @param {number} i Primeiro elemento
 * @param {number} j Segundo elemento
 * @returns {array} 
 */
const swap = (array, i, j) => {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
    return array;
}

/**
 * Partitions given subarray using Lomuto's partitioning algorithm.
 *
 * @private
 * @param {array} array
 * @param {number} left Inicio do subarray
 * @param {number} right Fim do subarray
 */
const partition = (array, left, right, compare) => {
    var cmp = array[right - 1];
    var minEnd = left;
    var maxEnd;
    for (maxEnd = left; maxEnd < right - 1; maxEnd += 1) {
        if (compare(array[maxEnd], cmp) < 0) {
            swap(array, maxEnd, minEnd);
            minEnd += 1;
        }
    }
    swap(array, minEnd, right - 1);
    return minEnd;
}

/**
 * Recursive sorts given array.
 *
 * @private
 * @param {array} array
 * @param {number} left 
 * @param {number} right 
 * @returns {array} 
 */
const sort = (array, left, right, cmp) => {
    if (left < right) {
        var p = partition(array, left, right, cmp);
        sort(array, left, p, cmp);
        sort(array, p + 1, right, cmp);
    }
    return array;
}

/**
 * Quicksort algorithm.
 *
 * @public
 * @param {array} array
 * @returns {array}
 */
const quicksort = (array, cmp) => sort(array, 0, array.length, cmp);

export default quicksort;