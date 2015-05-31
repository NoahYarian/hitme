"use strict";

var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=6";
var cardBack = "http://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Card_back_16.svg/209px-Card_back_16.svg.png";

var game;
var deckId = "";
var count = 0;
var trueCount = 0;
var cardsLeft = 312;
var advantage = -0.5;
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
var cardPlace = document.createElement("audio");
cardPlace.setAttribute("src", "sounds/cardPlace1.wav");

var cardPackage = document.createElement("audio");
cardPackage.setAttribute("src", "sounds/cardOpenPackage2.wav");

var buttonClick = document.createElement("audio");
buttonClick.setAttribute("src", "sounds/click1.wav");

var winWav = document.createElement("audio");
winWav.setAttribute("src", "sounds/chipsHandle5.wav");

var loseWav = document.createElement("audio");
loseWav.setAttribute("src", "sounds/cardShove3.wav");

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
$(".chip").click(function () {
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
    getJSON(newDeckURL, function (data) {
      deckId = data.deck_id;
      console.log("About to deal from new deck");
      draw4();
      count = 0;
      trueCount = 0;
      cardsLeft = 312;
      advantage = -0.5;
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
  var checkSplitArr = game.playerHand.map(function (card) {
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

function split() {
  game.splitHand1.push(game.playerHand[0]);
  game.splitHand2.push(game.playerHand[1]);
  isSplit = true;
  $split.attr("disabled", true);
  $player.addClass("hidden");
  $playerTotal.addClass("hidden");
  $playerSplit.removeClass("hidden");
  $hand1.html("<img class='cardImage' src='" + game.splitCardImages[0] + "'>");
  $hand2.html("<img class='cardImage' src='" + game.splitCardImages[1] + "'>");
  checkSplitTotal("hand1");
  checkSplitTotal("hand2");
  gameHand = "hand1";
  highlight("hand1");
}

function highlight(hand) {
  hand === "hand1" ? ($hand1.addClass("highlighted"), $hand2.removeClass("highlighted")) : ($hand2.addClass("highlighted"), $hand1.removeClass("highlighted"));
}

function drawCard(options) {
  var cardURL = API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function (data, cb) {
    var html;
    cardPlace.load();
    cardPlace.play();
    options.image ? (html = "<img class='cardImage' src='" + options.image + "'>", $("." + options.person).prepend(html), game.hiddenCard = cardImage(data)) : (html = "<img class='cardImage' src='" + cardImage(data) + "'>", $("." + options.person).append(html));
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
    typeof options.callback === "function" && options.callback();
  });
  cardsLeft--;
}

function hit() {
  console.log("hit");
  drawCard({
    person: "player",
    callback: function callback() {
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
    game.dealerTotal > game.playerTotal ? (game.winner = "dealer", announce("YOU LOSE"), console.log("dealer's " + game.dealerTotal + " beats player's " + game.playerTotal), gameEnd()) : (game.winner = "player", announce("YOU WIN"), console.log("player's " + game.playerTotal + " beats dealer's " + game.dealerTotal), gameEnd());
  }
}

function checkSplitTotal(handNum) {
  var total = 0;
  var hand = handNum === "hand1" ? game.splitHand1 : game.splitHand2;
  var aces = 0;

  hand.forEach(function (card) {
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

  handNum === "hand1" ? (game.splitHand1Total = total, $hand1Total.text(game.splitHand1Total)) : (game.splitHand2Total = total, $hand2Total.text(game.splitHand2Total));
}

function checkTotal(person) {
  var total = 0;
  var hand = person === "dealer" ? game.dealerHand : game.playerHand;
  var aces = 0;

  hand.forEach(function (card) {
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

  var textColor = "white";
  if (total === 21) {
    textColor = "lime";
  } else if (total > 21) {
    textColor = "red";
  }

  person === "dealer" ? (game.dealerTotal = total, $dealerTotal.text(game.dealerTotal), $dealerTotal.css("color", textColor)) : (game.playerTotal = total, $playerTotal.text(game.playerTotal), $playerTotal.css("color", textColor));
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
    bank += game.wager * 2;
    console.log("giving player " + game.wager * 2 + ". Bank at " + bank);
  } else if (game.winner === "push") {
    bank += game.wager;
    console.log("returning " + game.wager + " to player. Bank at " + bank);
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
  console.log("flip");
  isFlipped = true;
  var $flipped = $(".dealer .cardImage").first();
  $flipped.remove();
  var html = "<img src='" + game.hiddenCard + "' class='cardImage'>";
  $dealer.prepend(html);
  updateCount(game.dealerHand[0]);
}

function updateCount(card) {
  if (isNaN(Number(card)) || card === "10") {
    count -= 1;
    console.log("" + card + " --> count -1 --> " + count);
  } else if (card < 7) {
    count += 1;
    console.log("" + card + " --> count +1 --> " + count);
  } else if (card >= 7 && card <= 9) {
    console.log("" + card + " --> count +0 --> " + count);
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
  advantage = trueCount * 0.5 - 0.5;
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
  var num05s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10 - num5s * 5 - num1s * 1) / 0.5);

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
    $(".bankChips img").each(function (i, c) {
      $(c).css("top", -5 * i);
    });
  } else if (location === "hand") {
    $handChips.html(html);
    $(".handChips img").each(function (i, c) {
      $(c).css("top", -5 * i);
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
    getJSON(newDeckURL, function (data) {
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
  $dealer.prepend("<img src='" + cardBack + "' class='cardImage'>");
  $dealer.append("<img src='" + dealer2 + "' class='cardImage'>");
  $player.append("<img src='" + player1 + "' class='cardImage'>");
  $player.append("<img src='" + player2 + "' class='cardImage'>");
  checkTotal("dealer");
  checkTotal("player");
  checkVictory();
  checkSplit();
});

$(".giveCard").click(function () {
  giveCard($(this).attr("data-id"));
});

// $('.dealerGiveCard').click(function () {
//   giveCard('dealer');
// });

// $('.playerGiveCard').click(function () {
//   giveCard('player');
// });

function giveCard(hand) {
  var cardValue = $(".giveCardValue").val();
  var cardSuit = $(".giveCardSuit").val();
  var cardSrc = "../images/cards/" + cardValue + "_of_" + cardSuit.toLowerCase() + ".svg";

  //This is maybe how it can look in the future:
  //game.hand[hand].push(cardValue);
  //checkTotal(hand);
  //$(hand).append(`<img src='${cardSrc}' class='cardImage'>`);

  if (person === "dealer") {
    game.dealerHand.push(cardValue);
    checkTotal("dealer");
    $dealer.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "player") {
    game.playerHand.push(cardValue);
    checkTotal("player");
    $player.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "split1") {
    game.split1Hand.push(cardValue);
    checkTotal("split1");
    $split1.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "split2") {
    game.split2Hand.push(cardValue);
    checkTotal("split2");
    $split2.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "split1a") {
    game.split1aHand.push(cardValue);
    checkTotal("split1a");
    $split1a.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "split1b") {
    game.split1bHand.push(cardValue);
    checkTotal("split1b");
    $split1b.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "split2a") {
    game.split2aHand.push(cardValue);
    checkTotal("split2a");
    $split2a.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "split2b") {
    game.split2bHand.push(cardValue);
    checkTotal("split2b");
    $split2b.append("<img src='" + cardSrc + "' class='cardImage'>");
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
  var JSONP_PROXY = "https://jsonp.afeld.me/?url=";
  // THIS WILL ADD THE CROSS ORIGIN HEADERS
  var request = new XMLHttpRequest();
  request.open("GET", JSONP_PROXY + url);
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      cb(JSON.parse(request.responseText));
    } else {
      cb(JSON.parse(request.responseText));
    };
  };
  request.send();
};
//# sourceMappingURL=data:application/json;base64,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VUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoQyxjQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckIsV0FBTyxDQUFDLE1BQU0sZ0JBQWMsT0FBTywwQkFBdUIsQ0FBQztHQUM1RCxNQUFNLElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUM5QixRQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoQyxjQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckIsV0FBTyxDQUFDLE1BQU0sZ0JBQWMsT0FBTywwQkFBdUIsQ0FBQztHQUM1RCxNQUFNLElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUM5QixRQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoQyxjQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckIsV0FBTyxDQUFDLE1BQU0sZ0JBQWMsT0FBTywwQkFBdUIsQ0FBQztHQUM1RCxNQUFNLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUMvQixRQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxjQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEIsWUFBUSxDQUFDLE1BQU0sZ0JBQWMsT0FBTywwQkFBdUIsQ0FBQztHQUM3RCxNQUFNLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUMvQixRQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxjQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEIsWUFBUSxDQUFDLE1BQU0sZ0JBQWMsT0FBTywwQkFBdUIsQ0FBQztHQUM3RCxNQUFNLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUMvQixRQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxjQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEIsWUFBUSxDQUFDLE1BQU0sZ0JBQWMsT0FBTywwQkFBdUIsQ0FBQztHQUM3RCxNQUFNLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUMvQixRQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxjQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEIsWUFBUSxDQUFDLE1BQU0sZ0JBQWMsT0FBTywwQkFBdUIsQ0FBQztHQUM3RDs7Ozs7Ozs7Ozs7QUFXRCxjQUFZLEVBQUUsQ0FBQztDQUNoQjs7O0FBR0QsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRTtBQUN4QixNQUFJLFdBQVcsR0FBRyw4QkFBOEIsQ0FBQzs7QUFFakQsTUFBSSxPQUFPLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztBQUNuQyxTQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxXQUFXLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDdkMsU0FBTyxDQUFDLE1BQU0sR0FBRyxZQUFXO0FBQzFCLFFBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7QUFDakQsUUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7S0FDdEMsTUFBTTtBQUNMLFFBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0tBQ3RDLENBQUM7R0FDSCxDQUFDO0FBQ0YsU0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ2hCLENBQUMiLCJmaWxlIjoic3JjL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQVBJID0gXCJodHRwOi8vZGVja29mY2FyZHNhcGkuY29tL2FwaS9cIjtcbnZhciBuZXdEZWNrVVJMID0gQVBJICsgXCJzaHVmZmxlLz9kZWNrX2NvdW50PTZcIjtcbnZhciBjYXJkQmFjayA9IFwiaHR0cDovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzUvNTIvQ2FyZF9iYWNrXzE2LnN2Zy8yMDlweC1DYXJkX2JhY2tfMTYuc3ZnLnBuZ1wiO1xuXG52YXIgZ2FtZTtcbnZhciBkZWNrSWQgPSBcIlwiO1xudmFyIGNvdW50ID0gMDtcbnZhciB0cnVlQ291bnQgPSAwO1xudmFyIGNhcmRzTGVmdCA9IDMxMjtcbnZhciBhZHZhbnRhZ2UgPSAtLjU7XG52YXIgYmFuayA9IDUwMDtcbnZhciBiZXRBbXQgPSAyNTtcbnZhciBiZXRDaGFuZ2VBbGxvd2VkID0gdHJ1ZTtcbnZhciBzcGxpdEFsbG93ZWQgPSBmYWxzZTtcbnZhciBpc0ZpcnN0VHVybiA9IHRydWU7XG52YXIgaXNQbGF5ZXJzVHVybiA9IHRydWU7XG52YXIgaXNEb3VibGVkRG93biA9IGZhbHNlO1xudmFyIGlzRmxpcHBlZCA9IGZhbHNlO1xudmFyIGlzU3BsaXQgPSBmYWxzZTtcbnZhciBnYW1lSGFuZCA9IFwiXCI7XG5cbi8vYnV0dG9uc1xudmFyICRzcGxpdCA9ICQoXCIuc3BsaXRcIik7XG52YXIgJGRvdWJsZURvd24gPSAkKFwiLmRvdWJsZURvd25cIik7XG52YXIgJG5ld0dhbWUgPSAkKFwiLm5ld0dhbWVcIik7XG52YXIgJGhpdCA9ICQoXCIuaGl0XCIpO1xudmFyICRzdGF5ID0gJChcIi5zdGF5XCIpO1xuXG4vL2NoaXBzXG52YXIgJGNoaXAxID0gJChcIi5jaGlwMVwiKTtcbnZhciAkY2hpcDUgPSAkKFwiLmNoaXA1XCIpO1xudmFyICRjaGlwMTAgPSAkKFwiLmNoaXAxMFwiKTtcbnZhciAkY2hpcDI1ID0gJChcIi5jaGlwMjVcIik7XG52YXIgJGNoaXA1MCA9ICQoXCIuY2hpcDUwXCIpO1xudmFyICRjaGlwMTAwID0gJChcIi5jaGlwMTAwXCIpO1xuXG4vL2luZm8gZGl2c1xudmFyICRoYW5kQ2hpcHMgPSAkKFwiLmhhbmRDaGlwc1wiKTtcbnZhciAkYmFua0NoaXBzID0gJChcIi5iYW5rQ2hpcHNcIik7XG52YXIgJGJhbmtUb3RhbCA9ICQoXCIuYmFua1RvdGFsXCIpO1xudmFyICRjb3VudCA9ICQoXCIuY291bnRcIik7XG52YXIgJHRydWVDb3VudCA9ICQoXCIudHJ1ZUNvdW50XCIpO1xudmFyICRhbm5vdW5jZSA9ICQoXCIuYW5ub3VuY2VcIik7XG52YXIgJGFubm91bmNlVGV4dCA9ICQoXCIuYW5ub3VuY2UgcFwiKTtcblxuLy9jYXJkIGhhbmQgZGl2c1xudmFyICRkZWFsZXIgPSAkKFwiLmRlYWxlclwiKTtcbnZhciAkcGxheWVyID0gJChcIi5wbGF5ZXJcIik7XG52YXIgJHBsYXllclNwbGl0ID0gJChcIi5wbGF5ZXJTcGxpdFwiKTtcbi8vIHZhciAkaGFuZDEgPSAkKFwiLmhhbmQxXCIpO1xuLy8gdmFyICRoYW5kMiA9ICQoXCIuaGFuZDJcIik7XG52YXIgJHNwbGl0MSA9ICQoXCIuc3BsaXQxXCIpO1xudmFyICRzcGxpdDIgPSAkKFwiLnNwbGl0MlwiKTtcbnZhciAkc3BsaXQxYSA9ICQoXCIuc3BsaXQxYVwiKTtcbnZhciAkc3BsaXQxYiA9ICQoXCIuc3BsaXQxYlwiKTtcbnZhciAkc3BsaXQyYSA9ICQoXCIuc3BsaXQyYVwiKTtcbnZhciAkc3BsaXQyYiA9ICQoXCIuc3BsaXQyYlwiKTtcblxuLy9oYW5kIHRvdGFsIGRpdnNcbnZhciAkZGVhbGVyVG90YWwgPSAkKFwiLmRlYWxlclRvdGFsXCIpO1xudmFyICRwbGF5ZXJUb3RhbCA9ICQoXCIucGxheWVyVG90YWxcIik7XG52YXIgJGhhbmQxVG90YWwgPSAkKFwiLmhhbmQxVG90YWxcIik7XG52YXIgJGhhbmQyVG90YWwgPSAkKFwiLmhhbmQyVG90YWxcIik7XG5cbi8vY3JlYXRlIGF1ZGlvIGVsZW1lbnRzXG52YXIgY2FyZFBsYWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQbGFjZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFBsYWNlMS53YXYnKTtcblxudmFyIGNhcmRQYWNrYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQYWNrYWdlLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jYXJkT3BlblBhY2thZ2UyLndhdicpO1xuXG52YXIgYnV0dG9uQ2xpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuYnV0dG9uQ2xpY2suc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NsaWNrMS53YXYnKTtcblxudmFyIHdpbldhdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG53aW5XYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NoaXBzSGFuZGxlNS53YXYnKTtcblxudmFyIGxvc2VXYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xubG9zZVdhdi5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFNob3ZlMy53YXYnKTtcblxuLy9wb3B1bGF0ZSBiYW5rIGFtb3VudCBvbiBwYWdlIGxvYWRcbiRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG5jb3VudENoaXBzKFwiYmFua1wiKTtcblxuLy9idXR0b24gY2xpY2sgbGlzdGVuZXJzXG4kKFwiYnV0dG9uXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgYnV0dG9uQ2xpY2subG9hZCgpO1xuICBidXR0b25DbGljay5wbGF5KCk7XG59KTtcblxuJHNwbGl0LmNsaWNrKHNwbGl0KTtcblxuJGRvdWJsZURvd24uY2xpY2soZnVuY3Rpb24gKCkge1xuICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRoaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIGJldChiZXRBbXQpO1xuICBjb25zb2xlLmxvZyhcImRvdWJsZSBkb3duXCIpO1xuICBpc0RvdWJsZWREb3duID0gdHJ1ZTtcbiAgaGl0KCk7XG59KTtcblxuJG5ld0dhbWUuY2xpY2sobmV3R2FtZSk7XG5cbiRoaXQuY2xpY2soaGl0KTtcblxuJHN0YXkuY2xpY2soZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZyhcInN0YXlcIik7XG4gIGZsaXBDYXJkKCk7XG4gIHN0YXkoKTtcbn0pO1xuXG4kKFwiLnRvZ2dsZVRlc3RQYW5lbFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICQoXCJkaXYudGVzdEhhbmRcIikudG9nZ2xlQ2xhc3MoXCJoaWRkZW5cIik7XG59KTtcblxuLy9jaGlwIGNsaWNrIGxpc3RlbmVyXG4kKFwiLmNoaXBcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJChcIi5jaGlwXCIpLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkKHRoaXMpLmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgIGJldEFtdCA9IE51bWJlcigkKHRoaXMpLmF0dHIoXCJkYXRhLWlkXCIpKTtcbiAgfVxufSk7XG5cbi8vZ2FtZSBvYmplY3RcbmZ1bmN0aW9uIEdhbWUoKSB7XG4gIC8vIHRoaXMuaGlkZGVuQ2FyZCA9IFwiXCI7XG4gIC8vIHRoaXMuZGVhbGVySGFuZCA9IFtdO1xuICAvLyB0aGlzLnBsYXllckhhbmQgPSBbXTtcbiAgLy8gdGhpcy5kZWFsZXJUb3RhbCA9IDA7XG4gIC8vIHRoaXMucGxheWVyVG90YWwgPSAwO1xuICAvLyB0aGlzLndhZ2VyID0gMDtcbiAgLy8gdGhpcy53aW5uZXIgPSBcIlwiO1xuXG4gIC8vIHRoaXMuc3BsaXRDYXJkSW1hZ2VzID0gW107IC8vZml4IHRoaXMgaWRlYVxuICAvLyB0aGlzLnNwbGl0MUhhbmQgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdDJIYW5kID0gW107XG4gIC8vIHRoaXMuc3BsaXQxYUhhbmQgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdDFiSGFuZCA9IFtdO1xuICAvLyB0aGlzLnNwbGl0MmFIYW5kID0gW107XG4gIC8vIHRoaXMuc3BsaXQyYkhhbmQgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdDFUb3RhbCA9IDA7XG4gIC8vIHRoaXMuc3BsaXQyVG90YWwgPSAwO1xuICAvLyB0aGlzLnNwbGl0MWFUb3RhbCA9IDA7XG4gIC8vIHRoaXMuc3BsaXQxYlRvdGFsID0gMDtcbiAgLy8gdGhpcy5zcGxpdDJhVG90YWwgPSAwO1xuICAvLyB0aGlzLnNwbGl0MmJUb3RhbCA9IDA7XG4gIC8vIHRoaXMuc3BsaXRIYW5kMSA9IFtdO1xuICAvLyB0aGlzLnNwbGl0SGFuZDIgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdEhhbmQxVG90YWwgPSAwO1xuICAvLyB0aGlzLnNwbGl0SGFuZDJUb3RhbCA9IDA7XG4gIHRoaXMuZGVhbGVyID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5wbGF5ZXIgPSBuZXcgSGFuZCgpO1xuICB0aGlzLnNwbGl0MSA9IG5ldyBIYW5kKCk7XG4gIHRoaXMuc3BsaXQyID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDFhID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDFiID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDJhID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDJiID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5pc0ZsaXBwZWQgPSBmYWxzZTtcbiAgdGhpcy5pc1BsYXllcnNUdXJuID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gSGFuZCgpIHtcbiAgdGhpcy5jYXJkVmFsdWVzID0gW107XG4gIHRoaXMuY2FyZEltYWdlcyA9IFtdO1xuICB0aGlzLnRvdGFsID0gMDtcbiAgdGhpcy53aW5uZXIgPSBcIlwiO1xuICB0aGlzLndhZ2VyID0gMDtcbiAgdGhpcy5jYW5TcGxpdCA9IGZhbHNlO1xuICB0aGlzLmlzU3BsaXQgPSBmYWxzZTtcbiAgdGhpcy5jYW5Eb3VibGUgPSB0cnVlO1xuICB0aGlzLmlzRG91YmxlZCA9IGZhbHNlO1xuICB0aGlzLmlzQ3VycmVudFR1cm4gPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gbmV3R2FtZSgpIHtcbiAgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gIGJldChiZXRBbXQpICYmIGRlYWwoKTtcbn1cblxuZnVuY3Rpb24gZGVhbCgpIHtcbiAgaXNGaXJzdFR1cm4gPSB0cnVlO1xuICBpc0ZsaXBwZWQgPSBmYWxzZTtcbiAgYmV0Q2hhbmdlQWxsb3dlZCA9IGZhbHNlO1xuICBjbGVhclRhYmxlKCk7XG4gICRuZXdHYW1lLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJcIik7XG4gIGNhcmRQYWNrYWdlLmxvYWQoKTtcbiAgY2FyZFBhY2thZ2UucGxheSgpO1xuICBpZiAoZGVja0lkID09PSBcIlwiIHx8IGNhcmRzTGVmdCA8IDIwKSB7XG4gICAgZ2V0SlNPTihuZXdEZWNrVVJMLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBkZWNrSWQgPSBkYXRhLmRlY2tfaWQ7XG4gICAgICBjb25zb2xlLmxvZyhcIkFib3V0IHRvIGRlYWwgZnJvbSBuZXcgZGVja1wiKTtcbiAgICAgIGRyYXc0KCk7XG4gICAgICBjb3VudCA9IDA7XG4gICAgICB0cnVlQ291bnQgPSAwO1xuICAgICAgY2FyZHNMZWZ0ID0gMzEyO1xuICAgICAgYWR2YW50YWdlID0gLS41O1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiQWJvdXQgdG8gZGVhbCBmcm9tIGN1cnJlbnQgZGVja1wiKTtcbiAgICBkcmF3NCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRyYXc0KCkge1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcImRlYWxlclwiLFxuICAgIGltYWdlOiBjYXJkQmFja1xuICB9KTtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJwbGF5ZXJcIixcbiAgICBzdG9yZUltZzogdHJ1ZVxuICB9KTtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJkZWFsZXJcIlxuICB9KTtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJwbGF5ZXJcIixcbiAgICBzdG9yZUltZzogdHJ1ZSxcbiAgICBjYWxsYmFjazogY2hlY2tTcGxpdFxuICB9KTtcbn1cblxuZnVuY3Rpb24gY2hlY2tTcGxpdCgpIHtcbiAgdmFyIGNoZWNrU3BsaXRBcnIgPSBnYW1lLnBsYXllckhhbmQubWFwKGZ1bmN0aW9uKGNhcmQpIHtcbiAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4gICAgICByZXR1cm4gMTA7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oY2FyZCkpIHtcbiAgICAgIHJldHVybiBOdW1iZXIoY2FyZCk7XG4gICAgfSBlbHNlIGlmIChjYXJkID09PSBcIkFDRVwiKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG4gIH0pO1xuICBpZiAoY2hlY2tTcGxpdEFyclswXSA9PT0gY2hlY2tTcGxpdEFyclsxXSkge1xuICAgIHNwbGl0QWxsb3dlZCA9IHRydWU7XG4gICAgJHNwbGl0LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3BsaXQgKCkge1xuICBnYW1lLnNwbGl0SGFuZDEucHVzaChnYW1lLnBsYXllckhhbmRbMF0pO1xuICBnYW1lLnNwbGl0SGFuZDIucHVzaChnYW1lLnBsYXllckhhbmRbMV0pO1xuICBpc1NwbGl0ID0gdHJ1ZTtcbiAgJHNwbGl0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJHBsYXllci5hZGRDbGFzcyhcImhpZGRlblwiKTtcbiAgJHBsYXllclRvdGFsLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAkcGxheWVyU3BsaXQucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRoYW5kMS5odG1sKGA8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nJHtnYW1lLnNwbGl0Q2FyZEltYWdlc1swXX0nPmApO1xuICAkaGFuZDIuaHRtbChgPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9JyR7Z2FtZS5zcGxpdENhcmRJbWFnZXNbMV19Jz5gKTtcbiAgY2hlY2tTcGxpdFRvdGFsKFwiaGFuZDFcIik7XG4gIGNoZWNrU3BsaXRUb3RhbChcImhhbmQyXCIpO1xuICBnYW1lSGFuZCA9IFwiaGFuZDFcIjtcbiAgaGlnaGxpZ2h0KFwiaGFuZDFcIik7XG59XG5cbmZ1bmN0aW9uIGhpZ2hsaWdodChoYW5kKSB7XG4gIGhhbmQgPT09IFwiaGFuZDFcIiA/IChcbiAgICAkaGFuZDEuYWRkQ2xhc3MoXCJoaWdobGlnaHRlZFwiKSxcbiAgICAkaGFuZDIucmVtb3ZlQ2xhc3MoXCJoaWdobGlnaHRlZFwiKVxuICApIDogKFxuICAgICRoYW5kMi5hZGRDbGFzcyhcImhpZ2hsaWdodGVkXCIpLFxuICAgICRoYW5kMS5yZW1vdmVDbGFzcyhcImhpZ2hsaWdodGVkXCIpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdDYXJkKG9wdGlvbnMpIHtcbiAgdmFyIGNhcmRVUkwgPSBBUEkgKyBcImRyYXcvXCIgKyBkZWNrSWQgKyBcIi8/Y291bnQ9MVwiO1xuICBnZXRKU09OKGNhcmRVUkwsIGZ1bmN0aW9uKGRhdGEsIGNiKSB7XG4gICAgdmFyIGh0bWw7XG4gICAgY2FyZFBsYWNlLmxvYWQoKTtcbiAgICBjYXJkUGxhY2UucGxheSgpO1xuICAgIG9wdGlvbnMuaW1hZ2UgPyAoXG4gICAgICBodG1sID0gXCI8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nXCIgKyBvcHRpb25zLmltYWdlICsgXCInPlwiLFxuICAgICAgJChcIi5cIiArIG9wdGlvbnMucGVyc29uKS5wcmVwZW5kKGh0bWwpLFxuICAgICAgZ2FtZS5oaWRkZW5DYXJkID0gY2FyZEltYWdlKGRhdGEpXG4gICAgKSA6IChcbiAgICAgIGh0bWwgPSBcIjxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPSdcIiArIGNhcmRJbWFnZShkYXRhKSArIFwiJz5cIixcbiAgICAgICQoXCIuXCIgKyBvcHRpb25zLnBlcnNvbikuYXBwZW5kKGh0bWwpXG4gICAgKTtcbiAgICBpZiAob3B0aW9ucy5wZXJzb24gPT09IFwiZGVhbGVyXCIpIHtcbiAgICAgIGlmIChvcHRpb25zLmltYWdlKSB7XG4gICAgICAgIGdhbWUuZGVhbGVySGFuZC51bnNoaWZ0KGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2FtZS5kZWFsZXJIYW5kLnB1c2goZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICAgIHVwZGF0ZUNvdW50KGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgfVxuICAgICAgY2hlY2tUb3RhbChcImRlYWxlclwiKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyJ3MgaGFuZCAtIFwiICsgZ2FtZS5kZWFsZXJIYW5kICsgXCIgKioqKiBkZWFsZXIgaXMgYXQgXCIgKyBnYW1lLmRlYWxlclRvdGFsKTtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMucGVyc29uID09PSBcInBsYXllclwiKSB7XG4gICAgICBnYW1lLnBsYXllckhhbmQucHVzaChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgIHVwZGF0ZUNvdW50KGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgY2hlY2tUb3RhbChcInBsYXllclwiKTtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyJ3MgaGFuZCAtIFwiICsgZ2FtZS5wbGF5ZXJIYW5kICsgXCIgKioqKiBwbGF5ZXIgaXMgYXQgXCIgKyBnYW1lLnBsYXllclRvdGFsKTtcbiAgICB9XG4gICAgY2hlY2tWaWN0b3J5KCk7XG4gICAgb3B0aW9ucy5zdG9yZUltZyAmJiBnYW1lLnNwbGl0Q2FyZEltYWdlcy5wdXNoKGNhcmRJbWFnZShkYXRhKSk7XG4gICAgdHlwZW9mIG9wdGlvbnMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgJiYgb3B0aW9ucy5jYWxsYmFjaygpO1xuICB9KTtcbiAgY2FyZHNMZWZ0LS07XG59XG5cbmZ1bmN0aW9uIGhpdCgpIHtcbiAgY29uc29sZS5sb2coXCJoaXRcIik7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwicGxheWVyXCIsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChpc0RvdWJsZWREb3duICYmICFnYW1lLndpbm5lcikge1xuICAgICAgICBzdGF5KCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgaWYgKGlzRmlyc3RUdXJuKSB7XG4gICAgaXNGaXJzdFR1cm4gPSBmYWxzZTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJkb3VibGVEb3duLWRpc2FibGVkXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0YXkoKSB7XG4gIGlmICghZ2FtZS53aW5uZXIgJiYgZ2FtZS5kZWFsZXJUb3RhbCA8IDE3KSB7XG4gICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGl0c1wiKTtcbiAgICBpc1BsYXllcnNUdXJuID0gZmFsc2U7XG4gICAgZHJhd0NhcmQoe1xuICAgICAgcGVyc29uOiBcImRlYWxlclwiLFxuICAgICAgY2FsbGJhY2s6IHN0YXlcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSBnYW1lLnBsYXllclRvdGFsKSB7XG4gICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICBhbm5vdW5jZShcIlBVU0hcIik7XG4gICAgY29uc29sZS5sb2coXCJwdXNoXCIpO1xuICAgIGdhbWVFbmQoKTtcbiAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsIDwgMjIpIHtcbiAgICBnYW1lLmRlYWxlclRvdGFsID4gZ2FtZS5wbGF5ZXJUb3RhbCA/IChcbiAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIixcbiAgICAgIGFubm91bmNlKFwiWU9VIExPU0VcIiksXG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlcidzIFwiICsgZ2FtZS5kZWFsZXJUb3RhbCArIFwiIGJlYXRzIHBsYXllcidzIFwiICsgZ2FtZS5wbGF5ZXJUb3RhbCksXG4gICAgICBnYW1lRW5kKClcbiAgICApIDogKFxuICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiLFxuICAgICAgYW5ub3VuY2UoXCJZT1UgV0lOXCIpLFxuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIncyBcIiArIGdhbWUucGxheWVyVG90YWwgKyBcIiBiZWF0cyBkZWFsZXIncyBcIiArIGdhbWUuZGVhbGVyVG90YWwpLFxuICAgICAgZ2FtZUVuZCgpXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1NwbGl0VG90YWwoaGFuZE51bSkge1xuICB2YXIgdG90YWwgPSAwO1xuICB2YXIgaGFuZCA9IGhhbmROdW0gPT09IFwiaGFuZDFcIiA/IGdhbWUuc3BsaXRIYW5kMSA6IGdhbWUuc3BsaXRIYW5kMjtcbiAgdmFyIGFjZXMgPSAwO1xuXG4gIGhhbmQuZm9yRWFjaChmdW5jdGlvbihjYXJkKSB7XG4gICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuICAgICAgdG90YWwgKz0gMTA7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oY2FyZCkpIHtcbiAgICAgIHRvdGFsICs9IE51bWJlcihjYXJkKTtcbiAgICB9IGVsc2UgaWYgKGNhcmQgPT09IFwiQUNFXCIpIHtcbiAgICAgIGFjZXMgKz0gMTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChhY2VzID4gMCkge1xuICAgIGlmICh0b3RhbCArIGFjZXMgKyAxMCA+IDIxKSB7XG4gICAgICB0b3RhbCArPSBhY2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3RhbCArPSBhY2VzICsgMTA7XG4gICAgfVxuICB9XG5cbiAgaGFuZE51bSA9PT0gXCJoYW5kMVwiID8gKFxuICAgIGdhbWUuc3BsaXRIYW5kMVRvdGFsID0gdG90YWwsXG4gICAgJGhhbmQxVG90YWwudGV4dChnYW1lLnNwbGl0SGFuZDFUb3RhbClcbiAgKSA6IChcbiAgICBnYW1lLnNwbGl0SGFuZDJUb3RhbCA9IHRvdGFsLFxuICAgICRoYW5kMlRvdGFsLnRleHQoZ2FtZS5zcGxpdEhhbmQyVG90YWwpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrVG90YWwocGVyc29uKSB7XG4gIHZhciB0b3RhbCA9IDA7XG4gIHZhciBoYW5kID0gcGVyc29uID09PSBcImRlYWxlclwiID8gZ2FtZS5kZWFsZXJIYW5kIDogZ2FtZS5wbGF5ZXJIYW5kO1xuICB2YXIgYWNlcyA9IDA7XG5cbiAgaGFuZC5mb3JFYWNoKGZ1bmN0aW9uKGNhcmQpIHtcbiAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4gICAgICB0b3RhbCArPSAxMDtcbiAgICB9IGVsc2UgaWYgKCFpc05hTihjYXJkKSkge1xuICAgICAgdG90YWwgKz0gTnVtYmVyKGNhcmQpO1xuICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuICAgICAgYWNlcyArPSAxO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGFjZXMgPiAwKSB7XG4gICAgaWYgKHRvdGFsICsgYWNlcyArIDEwID4gMjEpIHtcbiAgICAgIHRvdGFsICs9IGFjZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvdGFsICs9IGFjZXMgKyAxMDtcbiAgICB9XG4gIH1cblxuICB2YXIgdGV4dENvbG9yID0gXCJ3aGl0ZVwiXG4gIGlmICh0b3RhbCA9PT0gMjEpIHtcbiAgICB0ZXh0Q29sb3IgPSBcImxpbWVcIjtcbiAgfSBlbHNlIGlmICh0b3RhbCA+IDIxKSB7XG4gICAgdGV4dENvbG9yID0gXCJyZWRcIjtcbiAgfVxuXG4gIHBlcnNvbiA9PT0gXCJkZWFsZXJcIiA/IChcbiAgICBnYW1lLmRlYWxlclRvdGFsID0gdG90YWwsXG4gICAgJGRlYWxlclRvdGFsLnRleHQoZ2FtZS5kZWFsZXJUb3RhbCksXG4gICAgJGRlYWxlclRvdGFsLmNzcyhcImNvbG9yXCIsIHRleHRDb2xvcilcbiAgKSA6IChcbiAgICBnYW1lLnBsYXllclRvdGFsID0gdG90YWwsXG4gICAgJHBsYXllclRvdGFsLnRleHQoZ2FtZS5wbGF5ZXJUb3RhbCksXG4gICAgJHBsYXllclRvdGFsLmNzcyhcImNvbG9yXCIsIHRleHRDb2xvcilcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tWaWN0b3J5KCkge1xuICBpZiAoZ2FtZS5kZWFsZXJIYW5kLmxlbmd0aCA+PSAyICYmIGdhbWUucGxheWVySGFuZC5sZW5ndGggPj0gMikge1xuICAgIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlckhhbmQubGVuZ3RoID09PSAyICYmIGdhbWUucGxheWVyVG90YWwgPT09IDIxICYmIGdhbWUucGxheWVySGFuZC5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZG91YmxlIGJsYWNramFjayBwdXNoIVwiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwdXNoXCI7XG4gICAgICBhbm5vdW5jZShcIlBVU0hcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlckhhbmQubGVuZ3RoID09PSAyICYmIGdhbWUucGxheWVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgYmxhY2tqYWNrXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoXCJZT1UgTE9TRVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUucGxheWVyVG90YWwgPT09IDIxICYmIGdhbWUucGxheWVySGFuZC5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGhhcyBibGFja2phY2tcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBnYW1lLndhZ2VyICo9IDEuMjU7XG4gICAgICBhbm5vdW5jZShcIkJMQUNLSkFDSyFcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLnBsYXllclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwdXNoXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICAgIGFubm91bmNlKFwiUFVTSFwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPT09IDIgJiYgaXNQbGF5ZXJzVHVybiAmJiBnYW1lLnBsYXllclRvdGFsIDwgMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyBibGFja2phY2ssIGRvaW5nIG5vdGhpbmcuLlwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgMjFcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShcIllPVSBMT1NFXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA+IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBidXN0c1wiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGFubm91bmNlKFwiWU9VIFdJTlwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUucGxheWVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllciBoYXMgMjFcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBhbm5vdW5jZShcIjIxIVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUucGxheWVyVG90YWwgPiAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgYnVzdHNcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShcIkJVU1RcIik7XG4gICAgfVxuICB9XG5cbiAgZ2FtZS53aW5uZXIgJiYgZ2FtZUVuZCgpO1xufVxuXG5mdW5jdGlvbiBnYW1lRW5kKCkge1xuICBpZiAoZ2FtZS53aW5uZXIgPT09IFwicGxheWVyXCIpIHtcbiAgICBiYW5rICs9IChnYW1lLndhZ2VyICogMik7XG4gICAgY29uc29sZS5sb2coYGdpdmluZyBwbGF5ZXIgJHtnYW1lLndhZ2VyICogMn0uIEJhbmsgYXQgJHtiYW5rfWApO1xuICB9IGVsc2UgaWYgKGdhbWUud2lubmVyID09PSBcInB1c2hcIikge1xuICAgIGJhbmsgKz0gZ2FtZS53YWdlcjtcbiAgICBjb25zb2xlLmxvZyhgcmV0dXJuaW5nICR7Z2FtZS53YWdlcn0gdG8gcGxheWVyLiBCYW5rIGF0ICR7YmFua31gKTtcbiAgfVxuICAkYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuICAhaXNGbGlwcGVkICYmIGZsaXBDYXJkKCk7XG4gIGJldENoYW5nZUFsbG93ZWQgPSB0cnVlO1xuICBpc1BsYXllcnNUdXJuID0gdHJ1ZTtcbiAgJGRlYWxlclRvdGFsLnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAkaGl0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJHN0YXkuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICBpc0RvdWJsZWREb3duID0gZmFsc2U7XG4gICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgc3BsaXRBbGxvd2VkID0gZmFsc2U7XG4gICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyVGFibGUoKSB7XG4gICRkZWFsZXIuZW1wdHkoKTtcbiAgJHBsYXllci5lbXB0eSgpO1xuICAkZGVhbGVyVG90YWwuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRwbGF5ZXJUb3RhbC5lbXB0eSgpO1xuICAkYW5ub3VuY2UucmVtb3ZlQ2xhc3MoXCJ3aW4gbG9zZSBwdXNoXCIpO1xuICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLXRhYmxlIGNsZWFyZWQtLS0tLS0tLS0tLS1cIik7XG59XG5cbmZ1bmN0aW9uIGNhcmRJbWFnZShkYXRhKSB7XG4gIHZhciBjYXJkVmFsdWUgPSBkYXRhLmNhcmRzWzBdLnZhbHVlO1xuICB2YXIgY2FyZFN1aXQgPSBkYXRhLmNhcmRzWzBdLnN1aXQ7XG4gIHZhciBmaWxlbmFtZSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgY2FyZFZhbHVlICsgXCJfb2ZfXCIgKyBjYXJkU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHJldHVybiBmaWxlbmFtZTtcbn1cblxuZnVuY3Rpb24gYW5ub3VuY2UodGV4dCkge1xuICBpZiAoZ2FtZS53aW5uZXIgPT09IFwiZGVhbGVyXCIpIHtcbiAgICAkYW5ub3VuY2UuYWRkQ2xhc3MoXCJsb3NlXCIpO1xuICAgIGxvc2VXYXYubG9hZCgpO1xuICAgIGxvc2VXYXYucGxheSgpO1xuICB9IGVsc2UgaWYgKGdhbWUud2lubmVyID09PSBcInBsYXllclwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwid2luXCIpO1xuICAgIHdpbldhdi5sb2FkKCk7XG4gICAgd2luV2F2LnBsYXkoKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwdXNoXCIpIHtcbiAgICAkYW5ub3VuY2UuYWRkQ2xhc3MoXCJwdXNoXCIpO1xuICB9XG4gICRhbm5vdW5jZVRleHQudGV4dCh0ZXh0KTtcbn1cblxuZnVuY3Rpb24gZmxpcENhcmQoKSB7XG4gIGNvbnNvbGUubG9nKCdmbGlwJyk7XG4gIGlzRmxpcHBlZCA9IHRydWU7XG4gIHZhciAkZmxpcHBlZCA9ICQoXCIuZGVhbGVyIC5jYXJkSW1hZ2VcIikuZmlyc3QoKTtcbiAgJGZsaXBwZWQucmVtb3ZlKCk7XG4gIHZhciBodG1sID0gYDxpbWcgc3JjPScke2dhbWUuaGlkZGVuQ2FyZH0nIGNsYXNzPSdjYXJkSW1hZ2UnPmA7XG4gICRkZWFsZXIucHJlcGVuZChodG1sKTtcbiAgdXBkYXRlQ291bnQoZ2FtZS5kZWFsZXJIYW5kWzBdKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ291bnQoY2FyZCkge1xuICBpZiAoaXNOYU4oTnVtYmVyKGNhcmQpKSB8fCBjYXJkID09PSBcIjEwXCIpIHtcbiAgICBjb3VudCAtPSAxO1xuICAgIGNvbnNvbGUubG9nKGAke2NhcmR9IC0tPiBjb3VudCAtMSAtLT4gJHtjb3VudH1gKTtcbiAgfSBlbHNlIGlmIChjYXJkIDwgNykge1xuICAgIGNvdW50ICs9IDE7XG4gICAgY29uc29sZS5sb2coYCR7Y2FyZH0gLS0+IGNvdW50ICsxIC0tPiAke2NvdW50fWApO1xuICB9IGVsc2UgaWYgKGNhcmQgPj0gNyAmJiBjYXJkIDw9IDkpIHtcbiAgICBjb25zb2xlLmxvZyhgJHtjYXJkfSAtLT4gY291bnQgKzAgLS0+ICR7Y291bnR9YCk7XG4gIH1cbiAgZ2V0VHJ1ZUNvdW50KCk7XG4gIGdldEFkdmFudGFnZSgpO1xuICBzZXROZWVkbGUoKTtcbiAgJGNvdW50LmVtcHR5KCk7XG4gICRjb3VudC5hcHBlbmQoXCI8cD5Db3VudDogXCIgKyBjb3VudCArIFwiPC9wPlwiKTtcbiAgJHRydWVDb3VudC5lbXB0eSgpO1xuICAkdHJ1ZUNvdW50LmFwcGVuZChcIjxwPlRydWUgQ291bnQ6IFwiICsgdHJ1ZUNvdW50LnRvUHJlY2lzaW9uKDIpICsgXCI8L3A+XCIpO1xufVxuXG5mdW5jdGlvbiBnZXRUcnVlQ291bnQoKSB7XG4gIHZhciBkZWNrc0xlZnQgPSBjYXJkc0xlZnQgLyA1MjtcbiAgdHJ1ZUNvdW50ID0gY291bnQgLyBkZWNrc0xlZnQ7XG59XG5cbmZ1bmN0aW9uIGdldEFkdmFudGFnZSgpIHtcbiAgYWR2YW50YWdlID0gKHRydWVDb3VudCAqIC41KSAtIC41O1xufVxuXG5mdW5jdGlvbiBzZXROZWVkbGUoKSB7XG4gIHZhciBudW0gPSBhZHZhbnRhZ2UgKiAzNjtcbiAgJChcIi5nYXVnZS1uZWVkbGVcIikuY3NzKFwidHJhbnNmb3JtXCIsIFwicm90YXRlKFwiICsgbnVtICsgXCJkZWcpXCIpO1xufVxuXG5mdW5jdGlvbiBiZXQoYW10KSB7XG4gIGlmIChiYW5rID49IGFtdCkge1xuICAgIGdhbWUud2FnZXIgKz0gYW10O1xuICAgIGJhbmsgLT0gYW10O1xuICAgICRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG4gICAgY291bnRDaGlwcyhcImJhbmtcIik7XG4gICAgY291bnRDaGlwcyhcImhhbmRcIik7XG4gICAgJChcIi5jdXJyZW50V2FnZXJcIikudGV4dChcIkN1cnJlbnQgV2FnZXI6IFwiICsgZ2FtZS53YWdlcik7XG4gICAgY29uc29sZS5sb2coXCJiZXR0aW5nIFwiICsgYW10KTtcbiAgICBjb25zb2xlLmxvZyhcIndhZ2VyIGF0IFwiICsgZ2FtZS53YWdlcik7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJJbnN1ZmZpY2llbnQgZnVuZHMuXCIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3VudENoaXBzKGxvY2F0aW9uKSB7XG4gIHZhciBhbXQgPSBsb2NhdGlvbiA9PT0gXCJiYW5rXCIgPyBiYW5rIDogZ2FtZS53YWdlcjtcbiAgdmFyIG51bTEwMHMgPSBNYXRoLmZsb29yKGFtdCAvIDEwMCk7XG4gIHZhciBudW01MHMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwKSAvIDUwKTtcbiAgdmFyIG51bTI1cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCkgLyAyNSk7XG4gIHZhciBudW0xMHMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSkgLyAxMCk7XG4gICB2YXIgbnVtNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwKSAvIDUpO1xuICAgdmFyIG51bTFzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCAtIG51bTVzICogNSkgLyAxKTtcbiAgdmFyIG51bTA1cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTAgLSBudW01cyAqIDUgLSBudW0xcyAqIDEpIC8gLjUpO1xuXG4gIHZhciBodG1sID0gXCJcIjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xMDBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEwMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTUwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC01MC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTI1czsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0yNS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTEwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTUucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMDVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTA1LnBuZyc+XCI7XG4gIH07XG5cbiAgaWYgKGxvY2F0aW9uID09PSBcImJhbmtcIikge1xuICAgICRiYW5rQ2hpcHMuaHRtbChodG1sKTtcbiAgICAkKCcuYmFua0NoaXBzIGltZycpLmVhY2goZnVuY3Rpb24oaSwgYykge1xuICAgICAgJChjKS5jc3MoJ3RvcCcsIC01ICogaSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAobG9jYXRpb24gPT09IFwiaGFuZFwiKSB7XG4gICAgJGhhbmRDaGlwcy5odG1sKGh0bWwpO1xuICAgICQoJy5oYW5kQ2hpcHMgaW1nJykuZWFjaChmdW5jdGlvbihpLCBjKSB7XG4gICAgICAkKGMpLmNzcygndG9wJywgLTUgKiBpKTtcbiAgICB9KTtcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy9cbi8vIFRFU1RJTkcgLy9cbi8vLy8vLy8vLy8vLy9cblxuJChcIi50ZXN0RGVhbFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGdhbWUgPSBuZXcgR2FtZSgpO1xuICBiZXQoYmV0QW10KTtcbiAgaXNGaXJzdFR1cm4gPSB0cnVlO1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gZmFsc2U7XG4gIGlmIChiYW5rID49IGJldEFtdCkge1xuICAgIGNsZWFyVGFibGUoKTtcbiAgICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgY2FyZFBhY2thZ2UubG9hZCgpO1xuICAgIGNhcmRQYWNrYWdlLnBsYXkoKTtcbiAgICBnZXRKU09OKG5ld0RlY2tVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRlY2tJZCA9IGRhdGEuZGVja19pZDtcbiAgICB9KTtcbiAgfVxuICB2YXIgZGVhbGVyMVZhbHVlID0gJChcIi5kZWFsZXIxVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyVmFsdWUgPSAkKFwiLmRlYWxlcjJWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjFWYWx1ZSA9ICQoXCIucGxheWVyMVZhbHVlXCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMlZhbHVlID0gJChcIi5wbGF5ZXIyVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxU3VpdCA9ICQoXCIuZGVhbGVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyU3VpdCA9ICQoXCIuZGVhbGVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIxU3VpdCA9ICQoXCIucGxheWVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIyU3VpdCA9ICQoXCIucGxheWVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBkZWFsZXIxVmFsdWUgKyBcIl9vZl9cIiArIGRlYWxlcjFTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIGRlYWxlcjIgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGRlYWxlcjJWYWx1ZSArIFwiX29mX1wiICsgZGVhbGVyMlN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgcGxheWVyMSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgcGxheWVyMVZhbHVlICsgXCJfb2ZfXCIgKyBwbGF5ZXIxU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBwbGF5ZXIyID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBwbGF5ZXIyVmFsdWUgKyBcIl9vZl9cIiArIHBsYXllcjJTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgZ2FtZS5zcGxpdENhcmRJbWFnZXMucHVzaChwbGF5ZXIxKTtcbiAgZ2FtZS5zcGxpdENhcmRJbWFnZXMucHVzaChwbGF5ZXIyKTtcbiAgZ2FtZS5kZWFsZXJIYW5kID0gW2RlYWxlcjFWYWx1ZSwgZGVhbGVyMlZhbHVlXTtcbiAgZ2FtZS5wbGF5ZXJIYW5kID0gW3BsYXllcjFWYWx1ZSwgcGxheWVyMlZhbHVlXTtcbiAgZ2FtZS5oaWRkZW5DYXJkID0gZGVhbGVyMTtcbiAgJGRlYWxlci5wcmVwZW5kKGA8aW1nIHNyYz0nJHtjYXJkQmFja30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7ZGVhbGVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMX0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICBjaGVja1RvdGFsKFwiZGVhbGVyXCIpO1xuICBjaGVja1RvdGFsKFwicGxheWVyXCIpO1xuICBjaGVja1ZpY3RvcnkoKTtcbiAgY2hlY2tTcGxpdCgpO1xufSk7XG5cbiQoXCIuZ2l2ZUNhcmRcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gIGdpdmVDYXJkKCQodGhpcykuYXR0cihcImRhdGEtaWRcIikpO1xufSlcblxuLy8gJCgnLmRlYWxlckdpdmVDYXJkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuLy8gICBnaXZlQ2FyZCgnZGVhbGVyJyk7XG4vLyB9KTtcblxuLy8gJCgnLnBsYXllckdpdmVDYXJkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuLy8gICBnaXZlQ2FyZCgncGxheWVyJyk7XG4vLyB9KTtcblxuZnVuY3Rpb24gZ2l2ZUNhcmQoaGFuZCkge1xuICB2YXIgY2FyZFZhbHVlID0gJCgnLmdpdmVDYXJkVmFsdWUnKS52YWwoKTtcbiAgdmFyIGNhcmRTdWl0ID0gJCgnLmdpdmVDYXJkU3VpdCcpLnZhbCgpO1xuICB2YXIgY2FyZFNyYyA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgY2FyZFZhbHVlICsgXCJfb2ZfXCIgKyBjYXJkU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG5cbiAgLy9UaGlzIGlzIG1heWJlIGhvdyBpdCBjYW4gbG9vayBpbiB0aGUgZnV0dXJlOlxuICAvL2dhbWUuaGFuZFtoYW5kXS5wdXNoKGNhcmRWYWx1ZSk7XG4gIC8vY2hlY2tUb3RhbChoYW5kKTtcbiAgLy8kKGhhbmQpLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuXG4gIGlmIChwZXJzb24gPT09ICdkZWFsZXInKSB7XG4gICAgZ2FtZS5kZWFsZXJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdkZWFsZXInKTtcbiAgICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3BsYXllcicpIHtcbiAgICBnYW1lLnBsYXllckhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3BsYXllcicpO1xuICAgICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQxJykge1xuICAgIGdhbWUuc3BsaXQxSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQxJyk7XG4gICAgJHNwbGl0MS5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDInKSB7XG4gICAgZ2FtZS5zcGxpdDJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDInKTtcbiAgICAkc3BsaXQyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MWEnKSB7XG4gICAgZ2FtZS5zcGxpdDFhSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQxYScpO1xuICAgICRzcGxpdDFhLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MWInKSB7XG4gICAgZ2FtZS5zcGxpdDFiSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQxYicpO1xuICAgICRzcGxpdDFiLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MmEnKSB7XG4gICAgZ2FtZS5zcGxpdDJhSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQyYScpO1xuICAgICRzcGxpdDJhLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MmInKSB7XG4gICAgZ2FtZS5zcGxpdDJiSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQyYicpO1xuICAgICRzcGxpdDJiLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9XG5cbiAgLy8gcGVyc29uID09PSAnZGVhbGVyJyA/IChcbiAgLy8gICBnYW1lLmRlYWxlckhhbmQucHVzaChjYXJkVmFsdWUpLFxuICAvLyAgIGNoZWNrVG90YWwoJ2RlYWxlcicpLFxuICAvLyAgICRkZWFsZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YClcbiAgLy8gKSA6IChcbiAgLy8gICBnYW1lLnBsYXllckhhbmQucHVzaChjYXJkVmFsdWUpLFxuICAvLyAgIGNoZWNrVG90YWwoJ3BsYXllcicpLFxuICAvLyAgICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YClcbiAgLy8gKVxuICBjaGVja1ZpY3RvcnkoKTtcbn1cblxuLy8gSlNPTiByZXF1ZXN0IGZ1bmN0aW9uIHdpdGggSlNPTlAgcHJveHlcbmZ1bmN0aW9uIGdldEpTT04odXJsLCBjYikge1xuICB2YXIgSlNPTlBfUFJPWFkgPSAnaHR0cHM6Ly9qc29ucC5hZmVsZC5tZS8/dXJsPSc7XG4gIC8vIFRISVMgV0lMTCBBREQgVEhFIENST1NTIE9SSUdJTiBIRUFERVJTXG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJlcXVlc3Qub3BlbignR0VUJywgSlNPTlBfUFJPWFkgKyB1cmwpO1xuICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA+PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgPCA0MDApIHtcbiAgICAgIGNiKEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2IoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgIH07XG4gIH07XG4gIHJlcXVlc3Quc2VuZCgpO1xufTtcbiJdfQ==