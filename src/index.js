import Tone from "tone";
import $ from "jQuery";
import { note , } from "@tonaljs/tonal";
import { scale , } from "@tonaljs/scale";
import { chord, transpose } from "@tonaljs/chord";
import * as progression from "@tonaljs/progression";
import {simplify} from "@tonaljs/note"

import Matter from "matter-js"
import "./setupCanvas.js";
import MatterCanvas from "./setupCanvas";



window.chord = chord;
window.transpose = transpose;
window.note = note;
window.scale = scale;
window.progression = progression;

console.log();

// create a new synth and route the output to master
const drumSynth = new Tone.Synth().toMaster();
const allnotes = ["Ab", "A", "Bb", "B", "C", "C#", "D", "Eb" , "E", "F", "F#", "G"];

var tremolo = new Tone.Tremolo(5, 0.1).toMaster().start();
var pitchshift = new Tone.PitchShift ( 0 );

window.pitchshift = pitchshift;
pitchshift.windowSize = 0.001;
//route an oscillator through the tremolo and start it

var distortion = new Tone.Distortion(0.1);
var vibrato = new Tone.Vibrato ( 8 , 0.1 );

let Volume = new Tone.Volume(-12);
const pianoSynth = new Tone.PolySynth(12, Tone.Synth).chain(Volume, Tone.Master);

let melodyType = 0;
let notes;

let isComplicated = true;

pianoSynth.set({
    oscillator: {
        type: "sine"
    },
    envelope: {
        decay: 0.5,
        sustain: 0.1,
        release: 1
    }
});

const timeDOM = $("#time");

function updateTime() {
    requestAnimationFrame(updateTime);
    timeDOM.text(Tone.Transport.seconds.toFixed(3));
}

function startPlaying() {
    Tone.Transport.toggle();
}


function getNotesFromAChord(chordName, pitch = 4) {
    let notes = chord(chordName).notes;
    for (let i = 0; i < notes.length; i++) {
        notes[i] = simplify(notes[i]) + "" + pitch;
    }
    return notes;
}

function generateCircleChordNotes(noteName) {
    let tonals = progression.fromRomanNumerals(noteName, ["I", "IV", "VII°", "IIIm", "VIm", "IIm", "V", "I"]);

    let chords = [];
    for (let i = 0; i < tonals.length; i++) {
        chords.push(getNotesFromAChord(tonals[i]));
    }
    console.log(chords);
    return chords;
}

function get_random (list) {
    return list[Math.floor((Math.random()*list.length))];
}

window.getNotesFromAChord = getNotesFromAChord;
window.generateCircleChordNotes = generateCircleChordNotes;

function drumLoop(time) {
    drumSynth.triggerAttackRelease('C2', '8n', time);
    drumSynth.triggerAttackRelease('C2', '8n', time + Tone.Time("4n"));
    drumSynth.triggerAttackRelease('C2', '8n', time + 2 * Tone.Time("4n"));
    drumSynth.triggerAttackRelease('C2', '8n', time +  3 * Tone.Time("4n"));
}

function toggleIsComplicated() {
    isComplicated = !isComplicated;
}

window.toggleIsComplicated = toggleIsComplicated;

function setupSynthLoop() {

    notes = generateCircleChordNotes("Bb");

    Tone.Transport.schedule(function(time) {
        melodyType = melodyType % 1;


        pianoSynth.triggerAttackRelease(notes[0], Tone.Time('32t'), time);
        drumSynth.triggerAttackRelease(notes[0][2].substring(0, notes[0][2].length - 1) + "1", '32t', time);

    }, 0);


    Tone.Transport.schedule(function(time) {

        if (isComplicated) {
            pianoSynth.triggerAttackRelease(notes[1][0], Tone.Time('32t'), time);
            drumSynth.triggerAttackRelease(notes[1][1].substring(0, notes[1][1].length - 1) + "1", '4t', time);
        }

    }, Tone.Time("8n"));

    Tone.Transport.schedule(function(time) {

        if (isComplicated) {
            pianoSynth.triggerAttackRelease(notes[2][0], Tone.Time('32t'), time);
            drumSynth.triggerAttackRelease(notes[2][1].substring(0, notes[2][1].length - 1) + "1", '4t', time);
        }


    }, Tone.Time("8n") * 2);

    Tone.Transport.schedule(function(time) {

        if (isComplicated) {
            pianoSynth.triggerAttackRelease(notes[3][0], Tone.Time('4t'), time);
        }

    }, Tone.Time("8n") * 3);

    Tone.Transport.schedule(function(time) {

        if (isComplicated)
        pianoSynth.triggerAttackRelease(notes[4][0], Tone.Time('32t'), time);

    }, Tone.Time("8n") * 4);

    Tone.Transport.schedule(function(time) {

        if (isComplicated) {
            pianoSynth.triggerAttackRelease(notes[5][0], Tone.Time('32t'), time);
            drumSynth.triggerAttackRelease(notes[0][2].substring(0, notes[0][2].length - 1) + "1", '4n', time);
        }

    }, Tone.Time("8n") * 5);

    Tone.Transport.schedule(function(time) {

        pianoSynth.triggerAttackRelease(notes[6][1], Tone.Time('4t'), time);

    }, Tone.Time("8n") * 6);

    Tone.Transport.schedule(function(time) {

        if (isComplicated) {
            pianoSynth.triggerAttackRelease(notes[7][0], Tone.Time('32t'), time);
        }

        melodyType++;
    }, Tone.Time("8n") * 7);
}

window.MatterCanvas = MatterCanvas;

const Events = Matter.Events;

$(function() {



    // play a note with the synth we setup
    //drumSynth.triggerAttackRelease("C2", "8n", '8n');
    //drumSynth.triggerAttackRelease("C2", "8n", '32n');



    // Tone.Transport.schedule(drumLoop, 0);

    // setupSynthLoop();

    Tone.Transport.loop = true;
    Tone.Transport.loopEnd = Tone.Time("1m");

    window.Transport = Tone.Transport;

    startPlaying();

    updateTime();

    let avalanche = MatterCanvas.avalanche();



    Events.on(avalanche.engine, 'collisionStart', function(event) {
        var pairs = event.pairs;



        // change object colours to show those starting a collision
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];


            if (pair.bodyA.wall || pair.bodyB.wall) {
                continue;
            }

            let shouldMakeSound = false;

            if (pair.bodyA.shouldMakeSound) {
                if (pair.bodyA.render.fillStyle !== '#333') {
                    pair.bodyA.originalFill = pair.bodyB.render.fillStyle;
                }
                    pair.bodyA.render.fillStyle = '#333';

                shouldMakeSound = true;
            }

            if (pair.bodyB.shouldMakeSound) {
                if (pair.bodyB.render.fillStyle !== '#333') {
                    pair.bodyB.originalFill = pair.bodyB.render.fillStyle;
                }
                pair.bodyB.render.fillStyle = '#333';

                shouldMakeSound = true;
            }

            if (shouldMakeSound) {
                if (pair.bodyA.ground || pair.bodyB.ground)
                pianoSynth.triggerAttackRelease(get_random(allnotes) + "4", Tone.Time('128t'));
            }
        }
    });

    Events.on(avalanche.engine, 'collisionEnd', function(event) {
        var pairs = event.pairs;
        // change object colours to show those starting a collision
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];

            if (pair.bodyA.shouldMakeSound && pair.bodyB.ground) {
                pair.bodyA.render.fillStyle = "#FFF";
            }
            if (pair.bodyB.shouldMakeSound && pair.bodyA.ground) {
                pair.bodyB.render.fillStyle = "#FFF";
            }

        }
    });

});




