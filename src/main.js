var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=6";
var cardBack = "http://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Card_back_16.svg/209px-Card_back_16.svg.png";

var game;
var deckId = "";
var count = 0;
var trueCount = 0;
var cardsLeft = 312;
var advantage = -.5;
var bank = 500;
var betAmt = 25;
var betChangeAllowed = true;
var splitAllowed = false;
var isFirstTurn = true;
var isPlayersTurn = true;
var isDoubledDown = false;
var isFlipped = false;
var isSplit = false;
var gameHand = "";

//buttons
var $split = $(".split");
var $doubleDown = $(".doubleDown");
var $newGame = $(".newGame");
var $hit = $(".hit");
var $stay = $(".stay");

//chips
var $chip1 = $(".chip1");
var $chip5 = $(".chip5");
var $chip10 = $(".chip10");
var $chip25 = $(".chip25");
var $chip50 = $(".chip50");
var $chip100 = $(".chip100");

//info divs
var $handChips = $(".handChips");
var $bankChips = $(".bankChips");
var $bankTotal = $(".bankTotal");
var $count = $(".count");
var $trueCount = $(".trueCount");
var $announce = $(".announce");
var $announceText = $(".announce p");

//card hand divs
var $dealer = $(".dealer");
var $player = $(".player");
var $playerSplit = $(".playerSplit");
// var $hand1 = $(".hand1");
// var $hand2 = $(".hand2");
var $split1 = $(".split1");
var $split2 = $(".split2");
var $split1a = $(".split1a");
var $split1b = $(".split1b");
var $split2a = $(".split2a");
var $split2b = $(".split2b");

//hand total divs
var $dealerTotal = $(".dealerTotal");
var $playerTotal = $(".playerTotal");
var $hand1Total = $(".hand1Total");
var $hand2Total = $(".hand2Total");

//create audio elements
var cardPlace = document.createElement('audio');
cardPlace.setAttribute('src', 'sounds/cardPlace1.wav');

var cardPackage = document.createElement('audio');
cardPackage.setAttribute('src', 'sounds/cardOpenPackage2.wav');

var buttonClick = document.createElement('audio');
buttonClick.setAttribute('src', 'sounds/click1.wav');

var winWav = document.createElement('audio');
winWav.setAttribute('src', 'sounds/chipsHandle5.wav');

var loseWav = document.createElement('audio');
loseWav.setAttribute('src', 'sounds/cardShove3.wav');

//populate bank amount on page load
$bankTotal.text("Bank: " + bank);
countChips("bank");

//button click listeners
$("button").click(function () {
  buttonClick.load();
  buttonClick.play();
});

$split.click(split);

$doubleDown.click(function () {
  $doubleDown.attr("disabled", true);
  $hit.attr("disabled", true);
  $stay.attr("disabled", true);
  bet(betAmt);
  console.log("double down");
  isDoubledDown = true;
  hit();
});

$newGame.click(newGame);

$hit.click(hit);

$stay.click(function () {
  console.log("stay");
  flipCard();
  stay();
});

$(".toggleTestPanel").click(function () {
  $("div.testHand").toggleClass("hidden");
});

//chip click listener
$(".chip").click(function() {
  if (betChangeAllowed) {
    $(".chip").attr("id", "");
    $(this).attr("id", "selectedBet");
    betAmt = Number($(this).attr("data-id"));
  }
});

//game object
function Game() {
  // this.hiddenCard = "";
  // this.dealerHand = [];
  // this.playerHand = [];
  // this.dealerTotal = 0;
  // this.playerTotal = 0;
  // this.wager = 0;
  // this.winner = "";

  // this.splitCardImages = []; //fix this idea
  // this.split1Hand = [];
  // this.split2Hand = [];
  // this.split1aHand = [];
  // this.split1bHand = [];
  // this.split2aHand = [];
  // this.split2bHand = [];
  // this.split1Total = 0;
  // this.split2Total = 0;
  // this.split1aTotal = 0;
  // this.split1bTotal = 0;
  // this.split2aTotal = 0;
  // this.split2bTotal = 0;
  // this.splitHand1 = [];
  // this.splitHand2 = [];
  // this.splitHand1Total = 0;
  // this.splitHand2Total = 0;
  this.dealer = new Hand();
  this.player = new Hand();
  this.split1 = new Hand();
  this.split2 = new Hand();
  this.split1a = new Hand();
  this.split1b = new Hand();
  this.split2a = new Hand();
  this.split2b = new Hand();
  this.isFlipped = false;
  this.isPlayersTurn = true;
}

function Hand() {
  this.cardValues = [];
  this.cardImages = [];
  this.total = 0;
  this.winner = "";
  this.wager = 0;
  this.canSplit = false;
  this.isSplit = false;
  this.canDouble = true;
  this.isDoubled = false;
  this.isCurrentTurn = false;
}

function newGame() {
  game = new Game();
  bet(betAmt) && deal();
}

function deal() {
  isFirstTurn = true;
  isFlipped = false;
  betChangeAllowed = false;
  clearTable();
  $newGame.attr("disabled", true);
  $hit.attr("disabled", false);
  $stay.attr("disabled", false);
  $doubleDown.attr("disabled", false);
  $doubleDown.attr("id", "");
  cardPackage.load();
  cardPackage.play();
  if (deckId === "" || cardsLeft < 20) {
    getJSON(newDeckURL, function(data) {
      deckId = data.deck_id;
      console.log("About to deal from new deck");
      draw4();
      count = 0;
      trueCount = 0;
      cardsLeft = 312;
      advantage = -.5;
    });
  } else {
    console.log("About to deal from current deck");
    draw4();
  }
}

function draw4() {
  drawCard({
    person: "dealer",
    image: cardBack
  });
  drawCard({
    person: "player",
    storeImg: true
  });
  drawCard({
    person: "dealer"
  });
  drawCard({
    person: "player",
    storeImg: true,
    callback: checkSplit
  });
}

function checkSplit() {
  var checkSplitArr = game.playerHand.map(function(card) {
    if (card === "KING" || card === "QUEEN" || card === "JACK") {
      return 10;
    } else if (!isNaN(card)) {
      return Number(card);
    } else if (card === "ACE") {
      return 1;
    }
  });
  if (checkSplitArr[0] === checkSplitArr[1]) {
    splitAllowed = true;
    $split.attr("disabled", false);
  }
}

function split () {
  game.splitHand1.push(game.playerHand[0]);
  game.splitHand2.push(game.playerHand[1]);
  isSplit = true;
  $split.attr("disabled", true);
  $player.addClass("hidden");
  $playerTotal.addClass("hidden");
  $playerSplit.removeClass("hidden");
  $hand1.html(`<img class='cardImage' src='${game.splitCardImages[0]}'>`);
  $hand2.html(`<img class='cardImage' src='${game.splitCardImages[1]}'>`);
  checkSplitTotal("hand1");
  checkSplitTotal("hand2");
  gameHand = "hand1";
  highlight("hand1");
}

function highlight(hand) {
  hand === "hand1" ? (
    $hand1.addClass("highlighted"),
    $hand2.removeClass("highlighted")
  ) : (
    $hand2.addClass("highlighted"),
    $hand1.removeClass("highlighted")
  );
}

function drawCard(options) {
  var cardURL = API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function(data, cb) {
    var html;
    cardPlace.load();
    cardPlace.play();
    options.image ? (
      html = "<img class='cardImage' src='" + options.image + "'>",
      $("." + options.person).prepend(html),
      game.hiddenCard = cardImage(data)
    ) : (
      html = "<img class='cardImage' src='" + cardImage(data) + "'>",
      $("." + options.person).append(html)
    );
    if (options.person === "dealer") {
      if (options.image) {
        game.dealerHand.unshift(data.cards[0].value);
      } else {
        game.dealerHand.push(data.cards[0].value);
        updateCount(data.cards[0].value);
      }
      checkTotal("dealer");
      console.log("dealer's hand - " + game.dealerHand + " **** dealer is at " + game.dealerTotal);
    } else if (options.person === "player") {
      game.playerHand.push(data.cards[0].value);
      updateCount(data.cards[0].value);
      checkTotal("player");
      console.log("player's hand - " + game.playerHand + " **** player is at " + game.playerTotal);
    }
    checkVictory();
    options.storeImg && game.splitCardImages.push(cardImage(data));
    typeof options.callback === 'function' && options.callback();
  });
  cardsLeft--;
}

function hit() {
  console.log("hit");
  drawCard({
    person: "player",
    callback: function () {
      if (isDoubledDown && !game.winner) {
        stay();
      }
    }
  });
  if (isFirstTurn) {
    isFirstTurn = false;
    $doubleDown.attr("id", "doubleDown-disabled");
  }
}

function stay() {
  if (!game.winner && game.dealerTotal < 17) {
    console.log("dealer hits");
    isPlayersTurn = false;
    drawCard({
      person: "dealer",
      callback: stay
    });
  } else if (game.dealerTotal === game.playerTotal) {
    game.winner = "push";
    announce("PUSH");
    console.log("push");
    gameEnd();
  } else if (game.dealerTotal < 22) {
    game.dealerTotal > game.playerTotal ? (
      game.winner = "dealer",
      announce("YOU LOSE"),
      console.log("dealer's " + game.dealerTotal + " beats player's " + game.playerTotal),
      gameEnd()
    ) : (
      game.winner = "player",
      announce("YOU WIN"),
      console.log("player's " + game.playerTotal + " beats dealer's " + game.dealerTotal),
      gameEnd()
    );
  }
}

function checkSplitTotal(handNum) {
  var total = 0;
  var hand = handNum === "hand1" ? game.splitHand1 : game.splitHand2;
  var aces = 0;

  hand.forEach(function(card) {
    if (card === "KING" || card === "QUEEN" || card === "JACK") {
      total += 10;
    } else if (!isNaN(card)) {
      total += Number(card);
    } else if (card === "ACE") {
      aces += 1;
    }
  });

  if (aces > 0) {
    if (total + aces + 10 > 21) {
      total += aces;
    } else {
      total += aces + 10;
    }
  }

  handNum === "hand1" ? (
    game.splitHand1Total = total,
    $hand1Total.text(game.splitHand1Total)
  ) : (
    game.splitHand2Total = total,
    $hand2Total.text(game.splitHand2Total)
  );
}

function checkTotal(person) {
  var total = 0;
  var hand = person === "dealer" ? game.dealerHand : game.playerHand;
  var aces = 0;

  hand.forEach(function(card) {
    if (card === "KING" || card === "QUEEN" || card === "JACK") {
      total += 10;
    } else if (!isNaN(card)) {
      total += Number(card);
    } else if (card === "ACE") {
      aces += 1;
    }
  });

  if (aces > 0) {
    if (total + aces + 10 > 21) {
      total += aces;
    } else {
      total += aces + 10;
    }
  }

  var textColor = "white"
  if (total === 21) {
    textColor = "lime";
  } else if (total > 21) {
    textColor = "red";
  }

  person === "dealer" ? (
    game.dealerTotal = total,
    $dealerTotal.text(game.dealerTotal),
    $dealerTotal.css("color", textColor)
  ) : (
    game.playerTotal = total,
    $playerTotal.text(game.playerTotal),
    $playerTotal.css("color", textColor)
  );
}

function checkVictory() {
  if (game.dealerHand.length >= 2 && game.playerHand.length >= 2) {
    if (game.dealerTotal === 21 && game.dealerHand.length === 2 && game.playerTotal === 21 && game.playerHand.length === 2) {
      console.log("double blackjack push!");
      game.winner = "push";
      announce("PUSH");
    } else if (game.dealerTotal === 21 && game.dealerHand.length === 2 && game.playerTotal === 21) {
      console.log("dealer has blackjack");
      game.winner = "dealer";
      announce("YOU LOSE");
    } else if (game.playerTotal === 21 && game.playerHand.length === 2) {
      console.log("player has blackjack");
      game.winner = "player";
      game.wager *= 1.25;
      announce("BLACKJACK!");
    } else if (game.dealerTotal === 21 && game.playerTotal === 21) {
      console.log("push");
      game.winner = "push";
      announce("PUSH");
    } else if (game.dealerTotal === 21 && game.dealerHand.length === 2 && isPlayersTurn && game.playerTotal < 21) {
      console.log("dealer has blackjack, doing nothing..");
    } else if (game.dealerTotal === 21) {
      console.log("dealer has 21");
      game.winner = "dealer";
      announce("YOU LOSE");
    } else if (game.dealerTotal > 21) {
      console.log("dealer busts");
      game.winner = "player";
      announce("YOU WIN");
    } else if (game.playerTotal === 21) {
      console.log("player has 21");
      game.winner = "player";
      announce("21!");
    } else if (game.playerTotal > 21) {
      console.log("player busts");
      game.winner = "dealer";
      announce("BUST");
    }
  }

  game.winner && gameEnd();
}

function gameEnd() {
  if (game.winner === "player") {
    bank += (game.wager * 2);
    console.log(`giving player ${game.wager * 2}. Bank at ${bank}`);
  } else if (game.winner === "push") {
    bank += game.wager;
    console.log(`returning ${game.wager} to player. Bank at ${bank}`);
  }
  $bankTotal.text("Bank: " + bank);
  !isFlipped && flipCard();
  betChangeAllowed = true;
  isPlayersTurn = true;
  $dealerTotal.removeClass("hidden");
  $newGame.attr("disabled", false);
  $hit.attr("disabled", true);
  $stay.attr("disabled", true);
  isDoubledDown = false;
  $doubleDown.attr("disabled", true);
  splitAllowed = false;
  $split.attr("disabled", true);
}

function clearTable() {
  $dealer.empty();
  $player.empty();
  $dealerTotal.addClass("hidden");
  $playerTotal.empty();
  $announce.removeClass("win lose push");
  console.log("------------table cleared------------");
}

function cardImage(data) {
  var cardValue = data.cards[0].value;
  var cardSuit = data.cards[0].suit;
  var filename = "../images/cards/" + cardValue + "_of_" + cardSuit.toLowerCase() + ".svg";
  return filename;
}

function announce(text) {
  if (game.winner === "dealer") {
    $announce.addClass("lose");
    loseWav.load();
    loseWav.play();
  } else if (game.winner === "player") {
    $announce.addClass("win");
    winWav.load();
    winWav.play();
  } else if (game.winner === "push") {
    $announce.addClass("push");
  }
  $announceText.text(text);
}

function flipCard() {
  console.log('flip');
  isFlipped = true;
  var $flipped = $(".dealer .cardImage").first();
  $flipped.remove();
  var html = `<img src='${game.hiddenCard}' class='cardImage'>`;
  $dealer.prepend(html);
  updateCount(game.dealerHand[0]);
}

function updateCount(card) {
  if (isNaN(Number(card)) || card === "10") {
    count -= 1;
    console.log(`${card} --> count -1 --> ${count}`);
  } else if (card < 7) {
    count += 1;
    console.log(`${card} --> count +1 --> ${count}`);
  } else if (card >= 7 && card <= 9) {
    console.log(`${card} --> count +0 --> ${count}`);
  }
  getTrueCount();
  getAdvantage();
  setNeedle();
  $count.empty();
  $count.append("<p>Count: " + count + "</p>");
  $trueCount.empty();
  $trueCount.append("<p>True Count: " + trueCount.toPrecision(2) + "</p>");
}

function getTrueCount() {
  var decksLeft = cardsLeft / 52;
  trueCount = count / decksLeft;
}

function getAdvantage() {
  advantage = (trueCount * .5) - .5;
}

function setNeedle() {
  var num = advantage * 36;
  $(".gauge-needle").css("transform", "rotate(" + num + "deg)");
}

function bet(amt) {
  if (bank >= amt) {
    game.wager += amt;
    bank -= amt;
    $bankTotal.text("Bank: " + bank);
    countChips("bank");
    countChips("hand");
    $(".currentWager").text("Current Wager: " + game.wager);
    console.log("betting " + amt);
    console.log("wager at " + game.wager);
    return true;
  } else {
    console.log("Insufficient funds.");
    return false;
  }
}

function countChips(location) {
  var amt = location === "bank" ? bank : game.wager;
  var num100s = Math.floor(amt / 100);
  var num50s = Math.floor((amt - num100s * 100) / 50);
  var num25s = Math.floor((amt - num100s * 100 - num50s * 50) / 25);
  var num10s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25) / 10);
   var num5s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10) / 5);
   var num1s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10 - num5s * 5) / 1);
  var num05s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10 - num5s * 5 - num1s * 1) / .5);

  var html = "";
  for (var i = 0; i < num100s; i++) {
    html += "<img src='images/chip-100.png'>";
  };
  for (var i = 0; i < num50s; i++) {
    html += "<img src='images/chip-50.png'>";
  };
  for (var i = 0; i < num25s; i++) {
    html += "<img src='images/chip-25.png'>";
  };
  for (var i = 0; i < num10s; i++) {
    html += "<img src='images/chip-10.png'>";
  };
  for (var i = 0; i < num5s; i++) {
    html += "<img src='images/chip-5.png'>";
  };
  for (var i = 0; i < num1s; i++) {
    html += "<img src='images/chip-1.png'>";
  };
  for (var i = 0; i < num05s; i++) {
    html += "<img src='images/chip-05.png'>";
  };

  if (location === "bank") {
    $bankChips.html(html);
    $('.bankChips img').each(function(i, c) {
      $(c).css('top', -5 * i);
    });
  } else if (location === "hand") {
    $handChips.html(html);
    $('.handChips img').each(function(i, c) {
      $(c).css('top', -5 * i);
    });
  }
}


/////////////
// TESTING //
/////////////

$(".testDeal").click(function () {
  game = new Game();
  bet(betAmt);
  isFirstTurn = true;
  betChangeAllowed = false;
  if (bank >= betAmt) {
    clearTable();
    $newGame.attr("disabled", true);
    $hit.attr("disabled", false);
    $stay.attr("disabled", false);
    $doubleDown.attr("disabled", false);
    $doubleDown.attr("id", "");
    cardPackage.load();
    cardPackage.play();
    getJSON(newDeckURL, function(data) {
      deckId = data.deck_id;
    });
  }
  var dealer1Value = $(".dealer1Value").val();
  var dealer2Value = $(".dealer2Value").val();
  var player1Value = $(".player1Value").val();
  var player2Value = $(".player2Value").val();
  var dealer1Suit = $(".dealer1Suit").val();
  var dealer2Suit = $(".dealer2Suit").val();
  var player1Suit = $(".player1Suit").val();
  var player2Suit = $(".player2Suit").val();
  var dealer1 = "../images/cards/" + dealer1Value + "_of_" + dealer1Suit.toLowerCase() + ".svg";
  var dealer2 = "../images/cards/" + dealer2Value + "_of_" + dealer2Suit.toLowerCase() + ".svg";
  var player1 = "../images/cards/" + player1Value + "_of_" + player1Suit.toLowerCase() + ".svg";
  var player2 = "../images/cards/" + player2Value + "_of_" + player2Suit.toLowerCase() + ".svg";
  game.splitCardImages.push(player1);
  game.splitCardImages.push(player2);
  game.dealerHand = [dealer1Value, dealer2Value];
  game.playerHand = [player1Value, player2Value];
  game.hiddenCard = dealer1;
  $dealer.prepend(`<img src='${cardBack}' class='cardImage'>`);
  $dealer.append(`<img src='${dealer2}' class='cardImage'>`);
  $player.append(`<img src='${player1}' class='cardImage'>`);
  $player.append(`<img src='${player2}' class='cardImage'>`);
  checkTotal("dealer");
  checkTotal("player");
  checkVictory();
  checkSplit();
});

$(".giveCard").click(function() {
  giveCard($(this).attr("data-id"));
})

// $('.dealerGiveCard').click(function () {
//   giveCard('dealer');
// });

// $('.playerGiveCard').click(function () {
//   giveCard('player');
// });

function giveCard(hand) {
  var cardValue = $('.giveCardValue').val();
  var cardSuit = $('.giveCardSuit').val();
  var cardSrc = "../images/cards/" + cardValue + "_of_" + cardSuit.toLowerCase() + ".svg";

  //This is maybe how it can look in the future:
  //game.hand[hand].push(cardValue);
  //checkTotal(hand);
  //$(hand).append(`<img src='${cardSrc}' class='cardImage'>`);

  if (person === 'dealer') {
    game.dealerHand.push(cardValue);
    checkTotal('dealer');
    $dealer.append(`<img src='${cardSrc}' class='cardImage'>`);
  } else if (person === 'player') {
    game.playerHand.push(cardValue);
    checkTotal('player');
    $player.append(`<img src='${cardSrc}' class='cardImage'>`);
  } else if (person === 'split1') {
    game.split1Hand.push(cardValue);
    checkTotal('split1');
    $split1.append(`<img src='${cardSrc}' class='cardImage'>`);
  } else if (person === 'split2') {
    game.split2Hand.push(cardValue);
    checkTotal('split2');
    $split2.append(`<img src='${cardSrc}' class='cardImage'>`);
  } else if (person === 'split1a') {
    game.split1aHand.push(cardValue);
    checkTotal('split1a');
    $split1a.append(`<img src='${cardSrc}' class='cardImage'>`);
  } else if (person === 'split1b') {
    game.split1bHand.push(cardValue);
    checkTotal('split1b');
    $split1b.append(`<img src='${cardSrc}' class='cardImage'>`);
  } else if (person === 'split2a') {
    game.split2aHand.push(cardValue);
    checkTotal('split2a');
    $split2a.append(`<img src='${cardSrc}' class='cardImage'>`);
  } else if (person === 'split2b') {
    game.split2bHand.push(cardValue);
    checkTotal('split2b');
    $split2b.append(`<img src='${cardSrc}' class='cardImage'>`);
  }

  // person === 'dealer' ? (
  //   game.dealerHand.push(cardValue),
  //   checkTotal('dealer'),
  //   $dealer.append(`<img src='${cardSrc}' class='cardImage'>`)
  // ) : (
  //   game.playerHand.push(cardValue),
  //   checkTotal('player'),
  //   $player.append(`<img src='${cardSrc}' class='cardImage'>`)
  // )
  checkVictory();
}

// JSON request function with JSONP proxy
function getJSON(url, cb) {
  var JSONP_PROXY = 'https://jsonp.afeld.me/?url=';
  // THIS WILL ADD THE CROSS ORIGIN HEADERS
  var request = new XMLHttpRequest();
  request.open('GET', JSONP_PROXY + url);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      cb(JSON.parse(request.responseText));
    } else {
      cb(JSON.parse(request.responseText));
    };
  };
  request.send();
};
