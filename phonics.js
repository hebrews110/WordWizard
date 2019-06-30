/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var $slick;

var wordLists = [
    [
        [ "There was a loud {0} and then* silence.", "crash" ],
        [ "Can you show me that {0} you're reading?", "page" ],
        [ "It looks like the money is {0}.", "gone" ],
        [ "This {0} is beautiful!", "place" ],
        [ "That is a {0} shirt you're wearing.", "nice" ],
        [ "Don't touch the {0}!", "plug" ]
    ],
    [
        [ "That kid always wants to {0}.", "brag" ],
        [ "Did you wash your {0}?", "face"],
        [ "He lives in the {0}.", "city" ],
        [ "Setting a {0} is a great way to accomplish something.", "goal"],
        [ "Tonight you will sleep on this {0}.", "cot"],
        [ "I go to the {0} every week!", "gym"]
    ],
    [
        [ "Please be patient. I am on a phone {0}.", "call" ],
        [ "That {0} is huge!", "log" ],
        [ "Beware of the {0}.", "dog", ],
        [ "You should always be careful when using a {0}.", "saw" ],
        [ "She loves to {0}.", "draw"],
        [ "That man is very {0}.", "tall"]
    ],
    [
        [ "What is that {0} you are reading?", "book"],
        [ "This is my {0}.", "room"],
        [ "What is on your {0}?", "foot"],
        [ "Hurry! We are leaving {0}.", "soon"],
        [ "That plant {0} so fast!", "grew"],
        [ "{0} is there?", "Who"]
    ]
];

var currentWord = 0;

var currentWordStr;
var currentSentence;
var currentWrittenSentence;

var currentQuestion;

var currentWordList;

$.fn.numSlides = function() {
    return $(this).find(".slick-track").children().length;
};
function isVowelLike(c)
{
    if(c === undefined)
        return false;
    c = c.toLowerCase();
    return (c === 'a') || (c === 'e') || (c === 'i') || (c === 'o') || (c === 'u') || (c === 'y');
}

function isConsonant(c) {
    return !isVowelLike(c);
}

function makeSlider($slider) {
    return $slider.slick({
        dots: false,
        arrows: true,
        vertical: true,
        verticalSwiping: true,
        infinite: false,
        easing: 'linear',
        draggable: false
    });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hiddenVersion(word) {
    var str = "<u>";
    for(var i = 0; i < word.length; i++) {
        str += "&nbsp;";
    }
    str += "</u>";
    return str;
}

function speakText(str, callback) {
    if(str === undefined || str === null)
        return;
    responsiveVoice.speak(str.replace('*', ','), "US English Female", { rate: 0.9, onend: callback });
}

function generateWordLists(wordList) {
    var tmpWordList = wordList;
    /* Split each of the words in the list into an array of vowel and consonant chunks. */
    for(var j = 0; j < tmpWordList.length; j++) {
        var tmpArray = [];
        var startOfChunk = 0;
        var currentMode;
        if(isConsonant(tmpWordList[j][1][0]))
            currentMode = true; /* consonant */
        else
            currentMode = false; /* vowel */
        var numChars = 0;
        for(var i = 0; i < tmpWordList[j][1].length;) {
            if(currentMode === isConsonant(tmpWordList[j][1][i])) {
                numChars++;
                i++;
                if(i !== tmpWordList[j][1].length)
                    continue;
            }
            /* About to swap modes - store the current chunk into an array */
            if(numChars === 0)
                throw "Should never have 0 chars";
            console.log(tmpWordList[j][1]);
            var theSubStr = tmpWordList[j][1].substr(startOfChunk, numChars);
            tmpArray.push(theSubStr);
            startOfChunk = i;
            currentMode = !currentMode; /* swap modes */
            numChars = 0;
        }
        
        
        tmpWordList[j][1] = tmpArray;
    }
}
function generateQuestion(wordList) {
    var tmpWordList = wordList;
    
    
    currentWord =  currentQuestion;
    currentWordStr = wordList[currentWord][1].join('');
    currentSentence = wordList[currentWord][0];
    if(currentSentence !== null) {
        currentWrittenSentence = currentSentence.replace(
            /\{([0-9]+)\}/g,
            function (_, index) { return hiddenVersion(currentWordStr); });
        currentWrittenSentence = currentWrittenSentence.replace(/\*/g, '');
        currentSentence = currentSentence.replace(
            /\{([0-9]+)\}/g,
            function (_, index) { return currentWordStr; });
    } else {
        currentWrittenSentence = null;
    }

    $(".word-builder-sentence").find("span").first().html(currentWrittenSentence);
    replayWordInfo();
}

function generateSliders(tmpWordList) {
    $("#word-sliders").empty();
    var existingStrs = [];
    var largestLength = 0;
    for(var j = 0; j < tmpWordList.length; j++) {
        if(tmpWordList[j][1].length > largestLength)
            largestLength = tmpWordList[j][1].length;
    }
    
    var numSlides = [];
    for(var i = 0; i < largestLength; i++) {
        existingStrs[i] = [];
        numSlides[i] = 0;
        var $slider = $("<div class='word-slider' id='word-slider-" + (i + 1) + "'></div>");
        $("#word-sliders").append($slider);
        makeSlider($slider);
        for(var j = 0; j < tmpWordList.length; j++) {
            var str;
            if(i >= tmpWordList[j][1].length) {
                str = "";
            } else
                str = tmpWordList[j][1][i];
            if(existingStrs[i].indexOf(str) === -1) {
                console.log("Random int between 0 and " + (numSlides[i] - 1));
                $slider.slick('slickAdd', '<div>' + str + '</div>', getRandomInt(0, numSlides[i] - 1), true);
                existingStrs[i].push(str);
                numSlides[i]++;
                console.log("numSlides[i (" + i + ")] is now "+ numSlides[i]);
            }
            
        }
        
    }
}

function replayWordInfo() {
    speakText(currentWordStr, function() {
        setTimeout(function() {
            speakText(currentSentence);
        }, 500);
    });
}

function sliderVal() {
    var str = "";
    $(".word-slider").each(function(index, slider_el) {
        var $slider = $(slider_el);
        str += $slider.find(".slick-current").text();
    });
    return str;
}

jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px");
    return this;
}

$.fn.mindim = function() {
    var w = $(this).width();
    var h = $(this).height();
    return h < w ? w : h;
};

function endGame() {
    $("#end-screen").addClass("invisible-object");
    $("#options").removeClass("invisible-object");
}
$(window).load(function() {
    
    
    //correctMargins();
    //$('.word-slider').on('slideNumChange', correctMargins);

    $(".slick-slide").click(function() {
        var data = {message: 'index', index: parseInt($(this).attr("data-slick-index"))};
        var evt = { data: data };
        $(this).closest('.word-slider').slick('changeSlide', evt, false);
    });
    $("#check-button").click(function() {
        
        console.log("Slider val: " + sliderVal());
        if(sliderVal() === currentWordStr) {
            
            console.log("isCorrect");
            var $clone = $(this).clone();
            $("#check-button").prop("disabled", "disabled");
            $clone.insertAfter($(this));
            $clone.prop('id', 'check-button-anim');
            $clone.css({ 'z-index': 2, 'position': 'absolute', 'pointer-events': 'none' });
            $clone.offset($(this).offset());
            $clone.text("Correct!");
            $clone.css({ 'padding': 0, 'background-color': 'green', 'border-color': 'green' });
            $clone.center();
            $clone.effect( "scale",
                { percent: 2000 },
                1000,
                function() {
                    
                    $clone.remove();
                    currentQuestion++;
                    console.log("This is now question " + currentQuestion);
                    if(currentQuestion < 6) {
                        generateQuestion(wordLists[currentWordList]);
                    } else {
                        $("#word-builder").addClass("invisible-object");
                        $("#end-screen").removeClass("invisible-object");
                        $("#end-words").empty();
                        for(var i = 0; i < wordLists[currentWordList].length; i++) {
                            $("#end-words").append("<span>" + wordLists[currentWordList][i][1].join('').toLowerCase() + "</span>");
                        }
                    }
                    $("#check-button").removeProp("disabled");
                }
            );
            
        } else {
            $("#check-button").effect("shake");
            console.log("Incorrect");
            return;
        }
        /* Check for correctness here */
        
    });
    $(".option-button").click(function() {
        currentWordList = parseInt($(this).attr("data-val"));
        if(currentWordList === undefined || currentWordList === null || isNaN(currentWordList))
            return;
        
        $("#options").addClass("invisible-object");
        currentQuestion = 0;
        generateSliders(wordLists[currentWordList]);
        generateQuestion(wordLists[currentWordList]);
        $("#word-builder").removeClass("invisible-object");
    });
    $(".word-builder-sentence ").find(".fa-volume-up").click(function() {
        replayWordInfo();
    });
    for(var i = 0; i < wordLists.length; i++) {
        generateWordLists(wordLists[i]);
    }
    $("#options").removeClass("invisible-object");
});