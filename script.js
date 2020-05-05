let N = 10; // oszlop, sor
let bubbleSize = 600 / N; // mert 600px a gameareank
let gamearea;
let pad;
let nextBubbleColor, waitingBubbleColor;
let gameAreaOffset; // gamearea offsetje
let targetX, targetY;   // annak koordinataja, ahova loni fogunk

// kiindulasi golyok lerakasa
function initBubbles() {
    for (let i = 0; i < N/2; i++) {   // sorokon
        for (let j = 0; j < N; j++) {   // oszlopokon
            let bubble = $('<div></div>');
            bubble.addClass('bubble');
            bubble.addClass(getColor());
            bubble.css({
                width: bubbleSize,
                height: bubbleSize,
                top: i * bubbleSize,
                left: j * bubbleSize
            });
            bubble.appendTo(gamearea);
        }
    }
}

// random class (szin) valasztasa a golyoknak
function getColor() {
    let randomValue = Math.random() * 100;
    switch (true) {
        case (randomValue > 83):
            return('yellow');
        case (randomValue > 66):
            return('red');
        case (randomValue > 50):
            return('green');
        case (randomValue > 33):
            return('blue');
        case (randomValue > 16):
            return('violet');
        default:
            return('turquoise');
    }
}

// legalso sor legyen elkulonitve
function initShooterPad() {
    // maga a pad
    pad = $('<div></div>');
    pad.addClass('pad');
    pad.css({
        width: bubbleSize * N,
        height: bubbleSize,
        marginTop: bubbleSize * (N-1),
        backgroundColor: 'goldenrod' 
    });
    pad.appendTo(gamearea);
}

// legyen a kilovendo golyo a padon
function addNextBubble() {
    let bubble = $('<div></div>');
    nextBubbleColor = getColor(); // eltaroljuk a kilovendo golyo szinet
    bubble.addClass('bubble');
    bubble.addClass('nextBubble');  // ez alapjan fogjuk megkulonboztetni
    bubble.addClass(nextBubbleColor);
    bubble.css({
        width: bubbleSize,
        height: bubbleSize,
        left: bubbleSize * (N/2) - (bubbleSize/2),
        top: bubbleSize * (N-1)
    });
    bubble.appendTo(gamearea);
}

// legyen a most kilovendo utan kovetkezo golyo a pad szelen
function addWaitingBubble() {
    let bubble = $('<div></div>');
    waitingBubbleColor = getColor(); //eltaroljuk a varakozo golyo szinet
    bubble.addClass('bubble');
    bubble.addClass('waitingBubble'); // ez alapjan fogjuk megkulonboztetni
    bubble.addClass(waitingBubbleColor);
    bubble.css({
        width: 0,
        height: 0,
        left: 0,
        top: bubbleSize * (N-1) + (bubbleSize/2)
    });
    bubble.animate({
        width: bubbleSize,
        height: bubbleSize,
        top: bubbleSize * (N-1)
    }, 750);
    bubble.appendTo(gamearea);
}

// egerkattintas pozicioja a gamearean belul
function setBubbleTarget(e) {
    targetX = e.pageX - gameAreaOffset.left - bubbleSize/2;
    targetY = e.pageY - gameAreaOffset.top;
    // kovetkezo golyo odamozgatasa
    $('.nextBubble').animate({
        left: targetX,
        top: targetY
    }, 750).removeClass('nextBubble');
    // varakozo golyo legyen a kovetkezo golyo, jojjon uj varakozo
    $('.waitingBubble').animate({
        left: bubbleSize * (N/2) - (bubbleSize/2),
    }, 750).addClass('nextBubble').removeClass('waitingBubble');
    addWaitingBubble();
  }

$(document).ready(function () {
    gamearea = $('#gamearea');
    initBubbles();
    initShooterPad();
    addNextBubble();
    addWaitingBubble();
    gameAreaOffset = gamearea[0].getBoundingClientRect();
    gamearea.on('click', setBubbleTarget);
});