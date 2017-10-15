const E = require('./config.js').edamam
const e_key = E.key;
const e_id = E.id;
const f = require('util').format;
const request = require('request');
const fs = require('fs');
const searchRecipes = function(search, callback=()=>{},
    options={min:1, max:3, ingr:5}) {
  let url = f("https://api.edamam.com/search?q=%s", search)
    + f("&app_id=%s&app_key=%s", e_id, e_key)
    + f("&from=%s&to=%s", options.min, options.max)
    + f("&ingr=%s", options.ingr);
  request(url, { json: true }, (err, res, body) => {
    if (err)
      throw err;
    recipes = body.hits.map(el => {
      return el.recipe;
    });
    return callback(recipes);
  });
}

const dummySearch = function(fixture="fix.json", callback=()=>{},
    options={min:1, max:3, ingr:4}) {
  fs.readFile(fixture, (err, data) => {
    if (err)
      throw err;
    let body = JSON.parse(data);
    recipes = body.hits.map(el => {
      return el.recipe;
    });
    return callback(recipes);
  });
}

const listToString = (total, current, i, a) => {
  let cm = (i + 1 == a.length) ? "" : ", ";
  let tcm = (i == 1) ? ", " : "";
  return total + tcm + current + cm;
}

const ingredientToString = function(ingr) {
  let tokens = ingr.text.split(",");
  return tokens[0];
  // tokens = tokens[0].split(" ");
  // let qml = ["", "", ""]; // quantity, measure, label
  // let i = 0;
  // for (let s of tokens) {
  //   if (s != "of"){
  //     if (!(/[A-Z]/i.test(s)) && i == 0) { // if it isn't entirely alpha
  //       if (s == "--") {
  //         i++;
  //       }
  //       qml[i] += s;
  //       i++;
  //     } else if (/[A-Z]/i.test(s) && i == 1) { // if it is a word
  //       if (s == "or") {
  //         i--;
  //       }
  //       qml[i] += s;
  //       i++;
  //     } else if (i == 2) {
  //       qml[i] += s + " ";
  //     }
  //   }
  // }
  // return f("%s(%s %s)", qml[2], qml[0], qml[1]);
}

const recipeToString = function(recipe) {
  if (recipe === undefined) {
    return;
  }
  let s = "\n";
  s += f("[%s]\n",recipe.label);
  s += "\t" + recipe.healthLabels.reduce(listToString) + "\n";
  s += "\t" + recipe.ingredients.map(ingredientToString).reduce(listToString);
  s += "\n";
  return s;
}

const recipesToString = function(recipes) {
  return recipes.reduce((t, r, i) => {
    if (i == 1) {
      t = recipeToString(t);
      t += "-----------------------\n";
    }
    t += recipeToString(r);
    t += "-----------------------\n";
    return t;
  });
}

dummySearch("chicken_fix.json", (recipes) => {
  console.log(recipesToString(recipes))
});
