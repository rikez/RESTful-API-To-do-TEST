var Person = {
  name: 'rico',
  age: 19
}

function updatePerson(object) {
  object.age = 23;
}
updatePerson(Person);

var grades = [1.0, 5.0, 9.0];

function updateGrades(object, index) {
    object[index] = 7.0;
}
updateGrades(grades, 2);

console.log(grades);

function addGrade(grades) {
    grades.push(5.5);
    debugger;
}

addGrade(grades);
console.log(grades);
