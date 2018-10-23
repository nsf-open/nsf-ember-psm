
function enumeration(namesToValues) {
  const enumerationClass = function () {
    throw new Error("Can't Instantiate Enumerations");
  };
  // Enumerated values inherit from this object.
  const proto = enumerationClass.prototype = {
    constructor: enumerationClass, // Identify type
    toString() {
      return this.name;
    }, // Return name
    valueOf() {
      return this.value;
    }, // Return value
    toJSON() {
      return this.name;
    } // For serialization
  };

  enumerationClass.values = [];
  // An array of the enumerated value objects

  // Now create the instances of this new type.

  Object.keys(namesToValues).forEach((name) => {
    // For each value
    const e = Object.create(proto);
    // Create an object to represent it
    e.name = name; // Give it a name
    e.value = namesToValues[name]; // And a value
    enumerationClass[name] = e; // Make it a property of constructor
    enumerationClass.values.push(e); // And store in the values array
  });


  // A class method for iterating the instances of the class

  enumerationClass.forEach = function (f, c) {
    for (let i = 0; i < this.values.length; i += 1) f.call(c, this.values[i]);
  };

  // Return the constructor that identifies the new type
  return enumerationClass;
}


export default enumeration;
