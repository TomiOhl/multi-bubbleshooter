let N = 10; // oszlop, sor
let bubbleSize = 600 / N; // mert 600px a gameareank
let gamearea;
let pad;
let bubbleList = [];    // a palyan levo golyok kooordinatainak
let nextBubbleColor, waitingBubbleColor;
let gameAreaOffset; // gamearea offsetje
let targetX, targetY;   // annak koordinataja, ahova loni fogunk

// kiindulasi golyok lerakasa
function initBubbles() {
    for (let i = 0; i < N/2; i++) {   // sorokon
        for (let j = 0; j < N; j++) {   // oszlopokon
            let bubble = $('<div></div>');
            bubble.addClass('bubble');
            let itemColor = getColor();
            bubble.addClass(itemColor);
            let itemId = i*(N-1)+j; // gyakorlatilag hanyadik
            bubble.attr('id', itemId);
            bubble.css({
                width: bubbleSize,
                height: bubbleSize,
                top: i * bubbleSize,
                left: j * bubbleSize
            });
            bubble.appendTo(gamearea);
            bubbleList.push({id: itemId, color: itemColor, x: j*bubbleSize, y: i*bubbleSize});
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
    let itemColor = getColor();
    bubble.addClass(itemColor);
    let itemId = bubbleList.length;
    bubble.attr('id', itemId);
    bubble.css({
        width: bubbleSize,
        height: bubbleSize,
        left: bubbleSize * (N/2) - (bubbleSize/2),
        top: bubbleSize * (N-1)
    });
    bubble.appendTo(gamearea);
    bubbleList.push({id: itemId, color: itemColor, x: undefined, y: undefined});
}

// legyen a most kilovendo utan kovetkezo golyo a pad szelen
function addWaitingBubble() {
    let bubble = $('<div></div>');
    bubble.addClass('bubble');
    bubble.addClass('waitingBubble'); // ez alapjan fogjuk megkulonboztetni
    let itemColor = getColor();
    bubble.addClass(itemColor);
    let itemId = bubbleList.length;
    bubble.attr('id', itemId);
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
    bubbleList.push({id: itemId, color: itemColor, x: undefined, y: undefined});
}

// egerkattintas pozicioja a gamearean belul
function setBubbleTarget(e) {
    targetX = e.pageX - gameAreaOffset.left - bubbleSize/2;
    targetX = calcTargetX();    // felulrijuk az oszlopba rakott valtozattal
    targetY = calcTargetY();
    // kovetkezo golyo odamozgatasa
    shoot();
    // varakozo golyo legyen a kovetkezo golyo, jojjon uj varakozo
    $('.waitingBubble').animate({
        left: bubbleSize * (N/2) - (bubbleSize/2),
    }, 500).addClass('nextBubble').removeClass('waitingBubble');
    addWaitingBubble();
    // toroljuk a golyot, ha eltalaltunk hasonlo szinut
    $('.nextBubble').promise().done(function(){     // igy az animacio utan fog meghivodni
        checkIfNeedToPop();
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
    return(colStart);
}

// a targetY kiszamolasa az alapjan, hogy a valasztott X koordinatanal milyen alacsonyan van a legalacsonyabban levo golyo
function calcTargetY() {
    let maxY = 0;
    for (const elem of bubbleList) {
        if (elem != undefined &&
            elem.x > (targetX-bubbleSize/2) &&
            elem.x < (targetX+bubbleSize/2) ) {
            if (elem.y > maxY) {
                maxY = elem.y;
            }
        }
    }
    return(maxY + bubbleSize);
}

// golyo kivalasztott helyre mozgatasanak logikaja
function shoot() {
    let bubble = $('.nextBubble');
    
    bubble.animate({left: targetX, top: targetY}, {
        duration: 500,
        step: function(now, fx) {
            // itt nem a targetX-et, hanem az eppen repulo nextBubble x-et kell hasonlitani
            if (targetX === bubbleSize*(N-0.5)) { // jobbrol vissza balra
                targetX = 300;    // ehelyett kiszamolni ezt es targetY-t is
                $(this).stop().animate({left: targetX, top: targetY}, 500);
            }
            else if (targetX == -bubbleSize/2) {  // balrol vissza jobbra
                targetX = 300;  // ehelyett kiszamolni ezt es targetY-t is
                $(this).stop().animate({left: targetX, top: targetY}, 500);
            }
        }
    });
    // frissitsuk a bubble eltarolt koordinatait
    bubbleList[bubbleList.length-2].x = targetX;
    bubbleList[bubbleList.length-2].y = targetY;
    bubble.removeClass('nextBubble');
}

// ha hasonlo szinuhoz er a kilott golyo, toroljuk azokat
function checkIfNeedToPop() {
    // szomszedos buborekok meghatarozasa
    let lastBubble = bubbleList[bubbleList.length-3];
    let somethingWasDeleted = false;
    for (let i=0; i < bubbleList.length; i++) {
        if (bubbleList[i] != undefined) {  
            if ( 
                (bubbleList[i].x == lastBubble.x + bubbleSize) && (bubbleList[i].y >= lastBubble.y-bubbleSize) && (bubbleList[i].y <= lastBubble.y+bubbleSize) || // jobbra
                (bubbleList[i].x == lastBubble.x - bubbleSize) && (bubbleList[i].y >= lastBubble.y-bubbleSize) && (bubbleList[i].y <= lastBubble.y+bubbleSize) || // balra
                (bubbleList[i].x == lastBubble.x) && ( (bubbleList[i].y == lastBubble.y-bubbleSize) || (bubbleList[i].y == lastBubble.y+bubbleSize) )   // fent es lent
            ) {
                // ha a szin egyezik, animalva toroljuk
                if (bubbleList[i].color == lastBubble.color){
                    $('#' + bubbleList[i].id).animate({     // kozeppontba megy ossze
                        top: bubbleList[i].y + bubbleSize/2,
                        left: bubbleList[i].x + bubbleSize/2,
                        width: 0,
                        height: 0
                    }, 500).promise().done(function(){     // igy az animacio utan fog torlodni
                        $(this).remove();
                    });
                    delete bubbleList[i];
                    somethingWasDeleted = true;
                }
            }
        }
    }
    // ha volt valami torlodve, mi magunk is torlodunk
    if (somethingWasDeleted) {
        $('#' + lastBubble.id).animate({     // kozeppontba megy ossze
            top: lastBubble.y + bubbleSize/2,
            left: lastBubble.x + bubbleSize/2,
            width: 0,
            height: 0
        }, 500).promise().done(function(){     // igy az animacio utan fog torlodni
            $(this).remove();
        });
        delete bubbleList[bubbleList.length-3];
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
