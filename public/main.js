let posOne = new THREE.Vector3( 100, 0, 200 );
let drawingNumber = 0;
let sentanceNumber = 0;
let currColor = 0;
let camera, scene, renderer;
let mesh;
let targetMesh;
let phase = 4;
let delta = 5;
let deltaoneNumber = 0;
let timecounter = 0;
let pos = { x : 0, y: 0, z:0 };
let newPos = {x: 0, y: 0, z:0 }
let targetPos = { x : 0, y: 0, z: 0 };
let phasesin = 0;
let blinkOpacity = 0;
let gameTime = 60;
let gameOn = false;
let startingValue = 120;
let similarSentences = [];
let similaritiesArray = [];
let sketchColor;
let maxSentences = 9;


let lstm;
let textInput;
let tempSlider;
let lengthSlider;
let netTemperature;

let userStory = [];
let storyBuild = [];
let currIllustration = 'lion';

let fablesJson;

let sentanceContainer = [];

////// sketchRnnDrawing stuff

let sketchmodel;
let previous_pen = 'down';
let x, y;
let startX = 300;
let startY = 200;
let sketch;



let drawingClasses = ["alarm_clock",	"ambulance",	"angel", "ant", "antyoga",
"backpack",	"barn",	"basket",	"bear",	"bee",
"beeflower",	"bicycle",	"bird",	"book",	"brain",
"bridge",	"bulldozer",	"bus",	"butterfly",	"cactus",
"calendar",	"castle",	"cat",	"catbus",	"catpig",
"chair",	"couch", "crab",	"crabchair",	"crabrabbitfacepig",
"cruise_ship",	"diving_board",	"dog",	"dogbunny",	"dolphin",
"duck",	"elephant",	"elephantpig", "eye",	"face",
"fan",	"fire_hydrant",	"firetruck",	"flamingo",	"flower",
"floweryoga",	"frog",	"frogsofa",	"garden",	"hand",
"hedgeberry",	"hedgehog",	"helicopter",	"kangaroo",	"key",
"lantern",	"lighthouse",	"lion",	"lionsheep",	"lobster",
"map",	"mermaid",	"monapassport",	"monkey",	"mosquito",
"octopus",	"owl",	"paintbrush",	"palm_tree",	"parrot",
"passport",	"peas",	"penguin",	"pig",	"pigsheep",
"pineapple",	"pool",	"postcard",	"power_outlet",	"rabbit",
"rabbitturtle",	"radio",	"radioface",	"rain",	"rhinoceros",
"rifle",	"roller_coaster",	"sandwich",	"scorpion",	"sea_turtle",
"sheep",	"skull",	"snail",	"snowflake",	"speedboat",
"spider",	"squirrel",	"steak",	"stove",	"strawberry",
"swan",	"swing_set",	"the_mona_lisa",	"tiger",	"toothbrush",
"toothpaste",	"tractor",	"trombone",	"truck	whale",
"windmill",	"yoga",	"yogabicycle",	"everything"];


function convertRange( value, r1, r2 ) {
  return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}
//
// ///// speech part
//
// const SpeechRecognition = webkitSpeechRecognition;
// const getSpeech = () => {
//   const recognition = new SpeechRecognition();
//   recognition.lang = 'en-US';
//   recognition.start();
//   // recognition.continuous = false;
//   recognition.interimResults = true;
//   // console.log('started rec');
//
//   recognition.onresult = event => {
//     const speechResult = event.results[0][0].transcript;
//     // console.log('result: ' + speechResult);
//     // console.log('confidence: ' + event.results[0][0].confidence);
//
//     generateNewInput(speechResult);
//
//   };
//
//   recognition.onend = () => {
//     // console.log('it is over');
//     // for "endless" mode, comment out the next line and uncomment getSpeech()
//     // recognition.stop();
//     getSpeech();
//   };
//
//   recognition.onerror = event => {
//     // console.log('something went wrong: ' + event.error);
//   };
// };
//
// function splitInput(inputText){
//   var newtextArr = inputText.toLowerCase().split(" ");
//
//   for (var i = 0; i < newtextArr.length; i++) {
//     storyBuild.push(newtextArr[i]);
//   }
//   // console.log(newtextArr);
//   // console.log('textarray input', newtextArr);
// }
//
//
// function generateNewInput(text){
//
//   walk(text); // word2vec
//
//   let thistextToString = text.toLowerCase().split(" ");
//   splitInput(text);
//   let storyBuildText = storyBuild.toString();
//   // console.log(storyBuildText);
//   let replace = storyBuildText.replace(/,/g, " "); // replace ','
//   // console.log(replace);
//   generate(replace);
//
//   addSentence(text, "voice / input");
//
// }
//
//
// ///// speech part

init();

function modelReady() {
  // document.getElementById('status').innerHTML = 'Model Loaded';
  console.log("model loaded");
}

function init() {
  //getSpeech(); //for speech enable this
  loadJsonfile();

}



function loadJsonfile(){
  console.log("loadjson");
  fetch('/aesopFables.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    // console.log(myJson);
    fablesJson = myJson;
  });
}


socket.on('sentencesResults', function(result){
  similarSentences = result;
});


function runjsonCheck(json, checkword){

  // add a regex search for a specific given word
  let regex = new RegExp(checkword);

  //reset a sentance container that will hold all sentances related to the search
  sentanceContainer = [];

  //rin through all the sentences in the json file.
  for (var key in json.stories) {

    for (var i = 0; i < json.stories[key].story.length; i++) {

      //convert line to lower case
      let lineInStory = json.stories[key].story[i];
      lineInStory = lineInStory.toLowerCase();

      //does line contain search?
      if (lineInStory.match(regex)){
        //push all the right sentences to an array.
        sentanceContainer.push(json.stories[key].story[i]);
      }
    }
  }

  // pick a randon sentance from that array.
  let randomSentance = Math.floor(Math.random() * Math.floor(sentanceContainer.length));

  socket.emit('sendSeedSentance', {'animal': checkword, 'randomSentance': sentanceContainer[randomSentance]});

  // add the sentance to the page

  addSentence(sentanceContainer[randomSentance], 'notnet');

  // add the sketch to the page
  window.setTimeout(() => {
    loadASketch(checkword);
  }, 600);
}




function addSentence(result, source){

  console.log("sentanceNumber1", sentanceNumber);

  if (sentanceNumber <= maxSentences ){
    console.log("add a sentence");

    sentanceNumber ++;
    var div = document.createElement("div");
    div.id = `paragraph${sentanceNumber}`;
    div.style.background = "white";
    div.style.color = "white";
    div.style.opacity = 0;
    div.style.filter = 'alpha(opacity=' + 0 * 0 + ")";

    // console.log(result," " ,source);
    if (source == "net"){
      // console.log("Net");
      let para = document.createElement("p");
      para.classList.add("net");
      let node = document.createTextNode(result);
      para.appendChild(node);
      document.getElementById("story").appendChild(div).appendChild(para);

    } else {
      // console.log("Voice")
      let para = document.createElement("p");
      para.classList.add("voice");
      let node = document.createTextNode(result);
      para.appendChild(node);
      document.getElementById("story").appendChild(div).appendChild(para);

      let fadeinElement = document.getElementById(`paragraph${sentanceNumber}`);
      console.log("adding Content!");

      let elm  = document.getElementById(`paragraph${sentanceNumber}`);
      elm.scrollIntoView({ behavior: 'smooth', block: 'center' });



      // let dimThis  = document.getElementById(`paragraph${sentanceNumber-1}`);
      // dimElement(dimThis);

      // add the sketch to the page after a second
      window.setTimeout(() => {
        fadein(fadeinElement);
      }, 1200);
    }
  } else {
    console.log("the end!")

    var div = document.createElement("div");
    div.id = `paragraph${sentanceNumber+1}`;
    div.style.background = "white";
    div.style.color = "white";
    div.style.opacity = 0;
    div.style.filter = 'alpha(opacity=' + 0 * 0 + ")";

    let para = document.createElement("p");
    para.classList.add("voice");
    let node = document.createTextNode("The End.");
    para.appendChild(node);
    document.getElementById("story").appendChild(div).appendChild(para);

    let fadeinElement = document.getElementById(`paragraph${sentanceNumber+1}`);


    // add the sketch to the page after a second
    window.setTimeout(() => {
      fadein(fadeinElement);
    }, 1200);
  }
}



function buttonPressed(clicked_id){

  let animalOne = document.getElementById(clicked_id).innerHTML;
  //convert to lowercase
  let animalOneLower = animalOne.toLowerCase();
  currIllustration = animalOneLower;

  //run the check function
  runjsonCheck(fablesJson, animalOneLower);

  window.setTimeout(() => {
    let fadeoutComponent = document.getElementById("characterOne");
    fadeout(fadeoutComponent);
  }, 500);
}


function startbuttonPressed(clicked_id){

console.log("hello!");
window.setTimeout(() => {
  let fadeoutComponent = document.getElementById("start-button");
  fadeout(fadeoutComponent);
}, 500);

window.setTimeout(() => {
  let fadeinComponent1 = document.getElementById("prompt");
  let fadeinComponent2 = document.getElementById("characterOne");

  fadein(fadeinComponent1);
  fadein(fadeinComponent2);


}, 1000);



}




///////sketchrnn


var sketchRnnDrawing = function( drawingOne ) {
  // var x = 100;
  // var y = 100;

  drawingOne.setup = function() {
    drawingOne.createCanvas(600, 450);
    drawingOne.background(255);
    previous_pen = 'down';
    drawingOne.loop();
    sketchColor = getRandomColor();
  };

  drawingOne.draw = function() {
    if (sketch) {
      if (previous_pen == 'down') {
        drawingOne.stroke(sketchColor);
        drawingOne.strokeWeight(6);
        drawingOne.line(x, y, x + sketch.dx/1.3, y + sketch.dy/1.3);
      }
      x += sketch.dx/1.3;
      y += sketch.dy/1.3;
      previous_pen = sketch.pen;

      if (sketch.pen !== 'end') {
        sketch = null;
        sketchmodel.generate(gotSketch);
      } else {
        //when finished --> add another sentence
        window.setTimeout(() => {
          console.log("add new sentance");
          enhanceStory(sentanceNumber);
        }, 7000);

        drawingOne.noLoop();
        previous_pen = sketch.pen;
        sketch = null;
        sketchmodel = null;
      }
    }
  };
};


function loadASketch(drawing){

  sketchmodel = ml5.SketchRNN(drawing, function() {
    // console.log("sketchmodelReady");
    startDrawing();
  });

  //create a div container for drawing

  drawingNumber ++;

  var div = document.createElement("div");
  div.id = `drawing${sentanceNumber}`;
  div.style.background = "white";
  div.style.color = "white";
  div.style.paddingBottom = "25px";
  document.getElementById("story").appendChild(div);

  var drawingCanvas = new p5(sketchRnnDrawing, document.getElementById(`drawing${sentanceNumber}`));
  if( sentanceNumber != 1){
    let elm  = document.getElementById(`drawing${sentanceNumber}`);
    elm.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // let dimThis  = document.getElementById(`paragraph${sentanceNumber-1}`);
    // dimElement(dimThis);
  }
}

function startDrawing() {
  x = startX ;
  y = startY;

  sketchmodel.reset();
  sketchmodel.generate(gotSketch);
  previous_pen = 'down';
}

function gotSketch(err, s) {
  sketch = s;
}





function enhanceStory(){
  //check if lower than length
  if(sentanceNumber <= 10){
    //reset similarityArray
    similaritiesArray = [];
    //add centance
    addSentence(similarSentences[sentanceNumber], 'sentence2Vec');
    console.log("add new sentance");
    window.setTimeout(() => {
      ifInClass(similarSentences[sentanceNumber]);
    }, 9000);
  }
}


// drawingClasses
function ifInClass(theSentance){
  if (sentanceNumber <= maxSentences ){
    let sentance = theSentance.toLowerCase();
    let sentenceToArray = sentance.split(" ");
    similaritiesArray = [];

    for (var i = 0; i < sentenceToArray.length; i++) {
      if (drawingClasses.indexOf(sentenceToArray[i].toLowerCase()) > -1) {
        console.log(sentenceToArray[i], "<-------is in the array!")
        similaritiesArray.push(sentenceToArray[i]);
      } else {
        console.log("not in sentance");
        //Not in the array
      }
    }

    if (similaritiesArray.length > 0){
      loadASketch(similaritiesArray[0].toLowerCase());
      // window.setTimeout(() => {
      //
      // }, 5000);

    }else{

      // add a sentence
      addSentence(similarSentences[sentanceNumber], 'sentence2Vec');

      //focus on sentence
      let elm  = document.getElementById(`paragraph${sentanceNumber}`);
      elm.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // let dimThis  = document.getElementById(`paragraph${sentanceNumber-1}`);
      // dimElement(dimThis);

      //trigger the loop
      window.setTimeout(() => {
        console.log("add new sentance");
        ifInClass(similarSentences[sentanceNumber]);
      }, 8000);
    }

  }else{
    // if it' the end trigger the end
    console.log("TheEnd");
    addSentence('The End', 'EndOfStory');
  }
}


///Utils


function fadeout(element) {
  var op = 1;  // initial opacity
  var timer = setInterval(function () {
    if (op <= 0.001){
      clearInterval(timer);
      element.style.display = 'none';
    }
    element.style.opacity = op;
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    op -= op * 0.4;
  }, 20);
}


function dimElement(element) {
  var op = 1;  // initial opacity
  var timer = setInterval(function () {
    if (op <= 0.2){
      clearInterval(timer);
      // element.style.display = 'none';
    }
    // element.style.opacity = op;
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    op -= op * 0.4;
  }, 20);
}




function fadein(element) {
  var op = 0.1;  // initial opacity
  element.style.display = 'block';
  var timer = setInterval(function () {
    if (op >= 1){
      clearInterval(timer);
    }
    element.style.opacity = op;
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    op += op * 0.1;
  }, 10);
}



function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
