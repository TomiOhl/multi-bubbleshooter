let N = 10; // oszlop, sor
let bubbleSize = 600 / N; // mert 600px a gameareank
let gamearea;
let pad;
let bubbleList = new Array(100);    // a palyan levo golyoknak, index: sorszam, ertek: szin
let nextBubbleColor, waitingBubbleColor;
let gameAreaOffset; // gamearea offsetje
let targetX, targetY;   // annak koordinataja, ahova loni fogunk
let newTargetX = 0;    // ebben lesz a cel, ha visszapattan a golyo
let origTargetY;
let lastBubbleId = 49;  // legutobb lerakott golyo id-je

// kiindulasi golyok lerakasa
function initBubbles() {
    for (let i = 0; i < N/2; i++) {   // sorokon
        for (let j = 0; j < N; j++) {   // oszlopokon
            let bubble = $('<div></div>');
            bubble.addClass('bubble');
            let itemColor = getColor();
            bubble.addClass(itemColor);
            let itemId = i*N+j; // gyakorlatilag hanyadik
            bubble.attr('id', itemId);
            bubble.css({
                width: bubbleSize,
                height: bubbleSize,
                top: i * bubbleSize,
                left: j * bubbleSize
            });
            bubble.appendTo(gamearea);
            bubbleList[itemId] = itemColor;
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

// legyen mar indulaskor kilovendo golyo a padon
function addNextBubble() {
    let bubble = $('<div></div>');
    bubble.addClass('bubble');
    bubble.addClass('nextBubble');  // ez alapjan fogjuk megkulonboztetni
    nextBubbleColor = getColor();
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
    bubble.addClass('bubble');
    bubble.addClass('waitingBubble'); // ez alapjan fogjuk megkulonboztetni
    waitingBubbleColor = getColor();
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
    }, 500);
    bubble.appendTo(gamearea);
}

// egerkattintas pozicioja a gamearean belul
function setBubbleTarget(e) {
    targetX = e.pageX - gameAreaOffset.left - bubbleSize/2;
    origTargetY = e.pageY - gameAreaOffset.top;
    targetX = calcTargetX();    // felulrijuk az oszlopba rakott valtozattal
    targetY = calcTargetY();
    // kovetkezo golyo odamozgatasa, mentese a tombbe
    shoot();
    // varakozo golyo legyen a kovetkezo golyo
    $('.waitingBubble').animate({
        left: bubbleSize * (N/2) - (bubbleSize/2),
    }, 500).addClass('nextBubble').removeClass('waitingBubble');
    // toroljuk a golyot, ha eltalaltunk hasonlo szinut, jojjon uj varakozo
    $('.nextBubble').promise().done(function(){     // igy az animacio utan fog meghivodni
        checkIfNeedToPop();
        nextBubbleColor = waitingBubbleColor;
        addWaitingBubble();
    });
}

// a targetX igazitasa, hogy oszlopban legyen
function calcTargetX() {
    let offsetFromCol = bubbleSize; // offsetekben azt nezzuk, hogy az oszlopok szeletol milyen messze vagyunk
    let colStart = 0;
    for (let i = 0; i < N*bubbleSize; i++) {
        if (i % bubbleSize == 0) {  //itt az i valoban az oszlopok bal szele
            let balOffset = targetX - i;
            if (balOffset < offsetFromCol && balOffset >= 0) {
                offsetFromCol = balOffset;
                colStart = i;
            }
            let jobbOffset = i - targetX;
            if (jobbOffset < offsetFromCol && jobbOffset >= 0) {
                offsetFromCol = jobbOffset;
                colStart = i;
            }
        }
    }
    //  visszapattanashoz, mockolt parameterekkel
    if (origTargetY > 6*bubbleSize && (colStart == 0 || colStart == (N-1)*bubbleSize))
        newTargetX = 5*bubbleSize;
    else
        newTargetX = 0;
    return(colStart);
}

// a targetY kiszamolasa az alapjan, hogy a valasztott X koordinatanal milyen alacsonyan van a legalacsonyabban levo golyo
function calcTargetY() {
    let maxY = 0;
    for (let i = 0; i< bubbleList.length; i++) {
        if (bubbleList[i] != null) {
            let elemX = calcCoordFromIndex(i)[0];
            let elemY = calcCoordFromIndex(i)[1];
            if (elemX > (targetX-bubbleSize/2) &&
                elemX < (targetX+bubbleSize/2) ) {
                if (elemY > maxY) {
                    maxY = elemY;
                }
            }
        }  
    }
    return(maxY + bubbleSize);
}

//
function calcCoordFromIndex(index) {
    // eloszor visszafejtjuk a koordinatakat
    // pl: 12-es index: 12 osztva 10 2 maradekot ad, ezert 2*bubbleSize az x koordinata
    //                  12 osztva 10 1.2, egesz resze 1, ezert 1*bubbleSize az y koordinata
    let coord = []
    coord[0] = (index % 10)*bubbleSize;             // x
    coord[1] = Math.floor(index / 10)*bubbleSize;   // y
    return coord;
}

// golyo kivalasztott helyre mozgatasanak logikaja
function shoot() {
    let bubble = $('.nextBubble');
    // visszapattanas, sajnos elegge mockolt jellegu, bugos af de meg van animalva
    if (newTargetX == 0)
        bubble.animate({left: targetX, top: targetY}, 500);
    else {
        bubble.animate({left: targetX, top: origTargetY}, 500).animate({left: newTargetX, top: targetY}, 500);
    }
    // adjuk meg az id-t a divnek, mentsuk tombbe
    lastBubbleId = (targetX / bubbleSize) + (targetY / bubbleSize)*10;    //mert minden egyes sor 10 elemet jelent
    bubbleList[lastBubbleId] = nextBubbleColor;
    $('.nextBubble').attr('id', lastBubbleId);
    bubble.removeClass('nextBubble');
}

// ha hasonlo szinuhoz er a kilott golyo, toroljuk azokat
function checkIfNeedToPop() {
    let somethingWasDeleted = false;
    // szomszedos buborekok indexei
    let susedIndexes = [lastBubbleId-11, lastBubbleId-10, lastBubbleId-9,
                        lastBubbleId-1, lastBubbleId+1,
                        lastBubbleId+9, lastBubbleId+10, lastBubbleId+11];
    // megnezzuk a bubbleList ezen indexeit
    for (elem of susedIndexes) {
        if (bubbleList[elem] != null && bubbleList[elem] == nextBubbleColor) {
            // ha a szin egyezik, animalva toroljuk
            let bubbleCoord = calcCoordFromIndex(elem);
            $('#' + elem).animate({     // kozeppontba megy ossze
                top: bubbleCoord[1] + bubbleSize/2,
                left: bubbleCoord[0] + bubbleSize/2,
                width: 0,
                height: 0
            }, 500).promise().done(function(){     // igy az animacio utan fog torlodni
                $(this).remove();
            });
            delete bubbleList[elem];
            somethingWasDeleted = true;
        }
    }
    // ha volt valami torlodve, mi magunk is torlodunk
    if (somethingWasDeleted) {
        let bubbleCoord = calcCoordFromIndex(lastBubbleId);
        $('#' + lastBubbleId).animate({     // kozeppontba megy ossze
            top: bubbleCoord[1] + bubbleSize/2,
            left: bubbleCoord[0] + bubbleSize/2,
            width: 0,
            height: 0
        }, 500).promise().done(function(){     // igy az animacio utan fog torlodni
            $(this).remove();
        });
        delete bubbleList[lastBubbleId];
    }
}

// kvazi main
$(document).ready(function () {
    gamearea = $('#gamearea');
    initBubbles();
    initShooterPad();
    addNextBubble();
    addWaitingBubble();
    gameAreaOffset = gamearea[0].getBoundingClientRect();
    gamearea.on('click', setBubbleTarget);
});
