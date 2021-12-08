/**
 * Finds the correct place of given element in given max heap.
 *
 * @private
 * @param {Array} array
 * @param {Number} index 
 * @param {Number} heapSize 
 * @param {function} cmp
 */
const heapify = (array, index, heapSize, cmp) => {
    var left = 2 * index + 1;
    var right = 2 * index + 2;
    var largest = index;

    if (left < heapSize && cmp(array[left], array[index]) > 0) {
        largest = left;
    }

    if (right < heapSize && cmp(array[right], array[largest]) > 0) {
        largest = right;
    }

    if (largest !== index) {
        var temp = array[index];
        array[index] = array[largest];
        array[largest] = temp;
        heapify(array, largest, heapSize, cmp);
    }
}

/**
 * Builds max heap from given array.
 *
 * @private
 * @param {array} array
 * @param {Function} cmp
 * @return {array}
 */
const buildMaxHeap = (array, cmp) => {
    for (var i = Math.floor(array.length / 2); i >= 0; i -= 1) {
        heapify(array, i, array.length, cmp);
    }
    return array;
}

/**
 * Heapsort. Turns the input array into max
 * heap and after that sorts it.
 * Time complexity: O(N log N).
 *
 * @public
 * @param {array} array
 * @param {Function} cmp
 * @return {array} 
 */
const heapsort = (array, cmp) => {
    cmp = cmp || comparator;
    let size = array.length;
    let temp;
    buildMaxHeap(array, cmp);
    for (var i = array.length - 1; i > 0; i -= 1) {
        temp = array[0];
        array[0] = array[i];
        array[i] = temp;
        size -= 1;
        heapify(array, 0, size, cmp);
    }
    return array;
};

export default heapsort;