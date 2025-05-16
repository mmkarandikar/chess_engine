// Define a new object with in-built functionality of a bi-directionaly map,
// i.e., key-to-value and value-to-key conversions are possible. This stores all key-value pairs twice
// and thus sacrifices memory for computational complexity

export class BiDirectionalMap {
    constructor() {
        this.keyToValue = {}; // Object for key to value lookup
        this.valueToKey = {}; // Object for value to key lookup
    }
    
    set(key, value) {
        this.keyToValue[key] = value;
        this.valueToKey[value] = key;
    }

    getByKey(key) {
        return this.keyToValue[key];
    }

    getByValue(value) {
        return this.valueToKey[value];
    }

    remove(key) {
        const value = this.keyToValue[key];
        delete this.keyToValue[key];
        delete this.valueToKey[value];
    }

    hasKey(key) {
        return key in this.keyToValue;
    }

    hasValue(value) {
        return value in this.valueToKey;
    }
}
