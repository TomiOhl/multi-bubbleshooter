let N = 10; // oszlop, sor
let bubbleSize = 600 / N; // mert 600px a gameareank
let gamearea;
let pad;
let bubbleList = new Array(100);    // a palyan levo golyoknak, index: sorszam, ertek: szin
let nextBubbleColor, waitingBubbleColor;
let gameAreaOffset; // gamearea offsetje
let targetX, targetY;   // annak koordinataja, ahova loni fogunk
let newTargetX = 0;    // ebben lesz a cel, ha visszapattan a golyo
let origTargetY, targetYCenter; // visszapattanashoz
let lastBubbleId = 49;  // legutobb lerakott golyo id-je
let score = 0;

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
        checkIfGameOver();
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
// note: a targetYCenter csak tovabbi hack a mockolt visszapattanashoz
function calcTargetY() {
    let maxY = 0;
    targetYCenter = 0;
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
            // hack
            if (elemX > (newTargetX-bubbleSize/2) &&
                elemX < (newTargetX+bubbleSize/2) ) {
                if (elemY > targetYCenter) {
                    targetYCenter = elemY;
                }
            }
        }  
    }
    targetYCenter += bubbleSize;
    return(maxY + bubbleSize);
}

// adott indexu elem koordinatai
function calcCoordFromIndex(index) {
    // visszafejtjuk a koordinatakat
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
    if (newTargetX == 0) {
        bubble.animate({left: targetX, top: targetY}, 500);
        lastBubbleId = (targetX / bubbleSize) + (targetY / bubbleSize)*10;    //mert minden egyes sor 10 elemet jelent
    } else {
        bubble.animate({left: targetX, top: origTargetY}, 500).animate({left: newTargetX, top: targetYCenter}, 500);
        lastBubbleId = (newTargetX / bubbleSize) + (targetYCenter / bubbleSize)*10;    //mert minden egyes sor 10 elemet jelent
    }
    // adjuk meg az id-t a divnek, mentsuk tombbe
    bubbleList[lastBubbleId] = nextBubbleColor;
    $('.nextBubble').attr('id', lastBubbleId);
    bubble.removeClass('nextBubble');
}

// ha hasonlo szinuhoz er a kilott golyo, toroljuk azokat
function checkIfNeedToPop() {
    let somethingWasDeleted = false;
    // szomszedos buborekok indexei
    // lastBubbleId 10-zel osztva 0 maradek: bal szelen vagyunk, 9 maradek: jobb szelen vagyunk
    let susedIndexes;
    switch (true) {
        case (lastBubbleId % 10 == 0):
            susedIndexes = [lastBubbleId-10, lastBubbleId-9,
                            lastBubbleId+1,
                            lastBubbleId+10, lastBubbleId+11];
            break;
        case (lastBubbleId % 10 == 9):
            susedIndexes = [lastBubbleId-11, lastBubbleId-10,
                            lastBubbleId-1,
                            lastBubbleId+9, lastBubbleId+10];
            break;
        default:
            susedIndexes = [lastBubbleId-11, lastBubbleId-10, lastBubbleId-9,
                            lastBubbleId-1, lastBubbleId+1,
                            lastBubbleId+9, lastBubbleId+10, lastBubbleId+11];
    }
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
            score++;
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
        $('#score').text(score);
        delete bubbleList[lastBubbleId];
    }
}

// loves utan ellenorizzuk, vege van-e a jateknak
function checkIfGameOver() {
    let name;
    // nyeres: ha minden golyot sikerult eltuntetni
    let length = bubbleList.filter(function(element){
        return element // az ures false-t ad vissza, igy nem szamolodik
    }).length
    if (length == 0)
        name = prompt('Nyertél! Add meg a neved:', 'Nyertes');
    // vesztes: ha kerul golyo az also sorba is
    for(let i = 80; i<=89; i++) {
        if (bubbleList[i] != undefined) {
            name = prompt('Vesztettél! Add meg a neved:', 'Vesztes');
        }
    }
    // eltaroljuk az eredmenyt a bekert nevvel, majd ujratoltjuk az oldalt
    if (name) {
        localStorage.setItem(name, score);
        location.reload();
    }
}

// toplista megjelenitese
function updateTopList() {
    // localStorage atpakolasa masik tombbe
    let storage = [];
    for (let i = 0; i < localStorage.length; i++) {
        storage[i] = [localStorage.key(i), parseInt(localStorage.getItem(localStorage.key(i)))];
    }
    // tomb rendezese csokkenobe
    storage.sort(function(a,b) {
        return b[1] - a[1];
    });
    // legjobb 10 listahoz adasa
    for (let elem of storage.keys()) {
        if (elem < 10) {
            $('#toplist').append(storage[elem][0] + ': ' + storage[elem][1] + ' pont<br>');
        }
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
    updateTopList();
});
