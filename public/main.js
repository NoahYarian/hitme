"use strict";

var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=6";
var cardBack = "http://tinyurl.com/kqzzmbr";

var game;
var deckId = "";
var count = 0;
var bank = 500;
var betAmt = 25;
var betChangeAllowed = true;
// var splitAllowed = false;
var isFirstTurn = true;
var isPlayersTurn = true;
var isDoubledDown = false;
// var isSplit = false;
// var gameHand = "";

//buttons
// var $split = $(".split");
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
var $announce = $(".announce");
var $announceText = $(".announce p");

//card hand divs
var $dealer = $(".dealer");
var $player = $(".player");
// var $playerSplit = $(".playerSplit");
// var $hand1 = $(".hand1");
// var $hand2 = $(".hand2");

//hand total divs
var $dealerTotal = $(".dealerTotal");
var $playerTotal = $(".playerTotal");
// var $hand1Total = $(".hand1Total");
// var $hand2Total = $(".hand2Total");

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

// $split.click(split);

// $(".giveSplitHand").click(function () {
//   game.playerHand = ["KING", "JACK"];
//   checkSplit();
// });

$doubleDown.click(function () {
  $doubleDown.attr("disabled", true);
  bet(betAmt);
  console.log("double down");
  isDoubledDown = true;
  hit();
});

$newGame.click(newGame);

$hit.click(hit);

$stay.click(function () {
  console.log("stay");
  stay();
});

//chip click listeners
$chip1.click(function () {
  if (betChangeAllowed) {
    $chip1.attr("id", "selectedBet");
    $chip5.attr("id", "");
    $chip10.attr("id", "");
    $chip25.attr("id", "");
    $chip50.attr("id", "");
    $chip100.attr("id", "");
    betAmt = 1;
  }
});
$chip5.click(function () {
  if (betChangeAllowed) {
    $chip1.attr("id", "");
    $chip5.attr("id", "selectedBet");
    $chip10.attr("id", "");
    $chip25.attr("id", "");
    $chip50.attr("id", "");
    $chip100.attr("id", "");
    betAmt = 5;
  }
});
$chip10.click(function () {
  if (betChangeAllowed) {
    $chip1.attr("id", "");
    $chip5.attr("id", "");
    $chip10.attr("id", "selectedBet");
    $chip25.attr("id", "");
    $chip50.attr("id", "");
    $chip100.attr("id", "");
    betAmt = 10;
  }
});
$chip25.click(function () {
  if (betChangeAllowed) {
    $chip1.attr("id", "");
    $chip5.attr("id", "");
    $chip10.attr("id", "");
    $chip25.attr("id", "selectedBet");
    $chip50.attr("id", "");
    $chip100.attr("id", "");
    betAmt = 25;
  }
});
$chip50.click(function () {
  if (betChangeAllowed) {
    $chip1.attr("id", "");
    $chip5.attr("id", "");
    $chip10.attr("id", "");
    $chip25.attr("id", "");
    $chip50.attr("id", "selectedBet");
    $chip100.attr("id", "");
    betAmt = 50;
  }
});
$chip100.click(function () {
  if (betChangeAllowed) {
    $chip1.attr("id", "");
    $chip5.attr("id", "");
    $chip10.attr("id", "");
    $chip25.attr("id", "");
    $chip50.attr("id", "");
    $chip100.attr("id", "selectedBet");
    betAmt = 100;
  }
});

//game object
function Game() {
  this.hiddenCard = "";
  this.dealerHand = [];
  this.playerHand = [];
  this.dealerTotal = 0;
  this.playerTotal = 0;
  // this.splitCardImages = [];
  // this.splitHand1 = [];
  // this.splitHand2 = [];
  // this.splitHand1Total = 0;
  // this.splitHand2Total = 0;
  this.wager = 0;
  this.winner = "";
  // this.playerChips = {};
}

function newGame() {
  game = new Game();
  bet(betAmt);
  deal();
}

function deal() {
  isFirstTurn = true;
  if (bank >= betAmt) {
    clearTable();
    $newGame.attr("disabled", true);
    $hit.attr("disabled", false);
    $stay.attr("disabled", false);
    $doubleDown.attr("disabled", false);
    $doubleDown.attr("id", "");
    cardPackage.load();
    cardPackage.play();
    if (deckId === "") {
      getJSON(newDeckURL, function (data) {
        deckId = data.deck_id;
        console.log("About to deal from new deck");
        draw4();
      });
    } else {
      console.log("About to deal from current deck");
      draw4();
    }
    betChangeAllowed = false;
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
    storeImg: true //,
    // callback: checkSplit
  });
}

// function checkSplit() {
//   var checkSplitArr = game.playerHand.map(function(card) {
//   if (card === "KING" || card === "QUEEN" || card === "JACK") {
//       return 10;
//     } else if (!isNaN(card)) {
//       return Number(card);
//     } else if (card === "ACE") {
//       return 1;
//     }
//   });
//   if (checkSplitArr[0] === checkSplitArr[1]) {
//     splitAllowed = true;
//     $split.attr("disabled", false);
//   }
// }

// function split () {
//   game.splitHand1.push(game.playerHand[0]);
//   game.splitHand2.push(game.playerHand[1]);
//   isSplit = true;
//   $split.attr("disabled", true);
//   $player.addClass("hidden");
//   $playerTotal.addClass("hidden");
//   $playerSplit.removeClass("hidden");
//   $hand1.html(`<img class='cardImage' src='${game.splitCardImages[0]}'>`);
//   $hand2.html(`<img class='cardImage' src='${game.splitCardImages[1]}'>`);
//   checkSplitTotal("hand1");
//   checkSplitTotal("hand2");
//   gameHand = "hand1";
//   highlight("hand1");
// }

// function highlight(hand) {
//   hand === "hand1" ? (
//     $hand1.addClass("highlighted"),
//     $hand2.removeClass("highlighted")
//   ) : (
//     $hand2.addClass("highlighted"),
//     $hand1.removeClass("highlighted")
//   );
// }

function drawCard(options) {
  var cardURL = API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function (data, cb) {
    var html;
    cardPlace.load();
    cardPlace.play();
    options.image ? (html = "<img class='cardImage' src='" + options.image + "'>", $("." + options.person).append(html), game.hiddenCard = cardImage(data)) : (html = "<img class='cardImage' src='" + cardImage(data) + "'>", $("." + options.person).append(html));
    options.person === "dealer" ? (game.dealerHand.push(data.cards[0].value), checkTotal("dealer"), console.log("dealer's hand - " + game.dealerHand + " **** dealer is at " + game.dealerTotal)) : (game.playerHand.push(data.cards[0].value), checkTotal("player"), console.log("player's hand - " + game.playerHand + " **** player is at " + game.playerTotal));
    checkVictory();
    updateCount(data.cards[0].value);
    // options.storeImg && game.splitCardImages.push(cardImage(data));
    typeof options.callback === "function" && options.callback();
  });
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
    $doubleDown.attr("disabled", true);
  }
}

function stay() {
  flipCard();
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

// function checkSplitTotal(handNum) {
//   var total = 0;
//   var hand = handNum === "hand1" ? game.splitHand1 : game.splitHand2;
//   var aces = 0;

//   hand.forEach(function(card) {
//     if (card === "KING" || card === "QUEEN" || card === "JACK") {
//       total += 10;
//     } else if (!isNaN(card)) {
//       total += Number(card);
//     } else if (card === "ACE") {
//       aces += 1;
//     }
//   });

//   if (aces > 0) {
//     if (total + aces + 10 > 21) {
//       total += aces;
//     } else {
//       total += aces + 10;
//     }
//   }

//   handNum === "hand1" ? (
//     game.splitHand1Total = total,
//     $hand1Total.text(game.splitHand1Total)
//   ) : (
//     game.splitHand2Total = total,
//     $hand2Total.text(game.splitHand2Total)
//   );
// }

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

  person === "dealer" ? (game.dealerTotal = total, $dealerTotal.text(game.dealerTotal)) : (game.playerTotal = total, $playerTotal.text(game.playerTotal));
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
      //do nothing
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
  betChangeAllowed = true;
  flipCard();
  $dealerTotal.removeClass("hidden");
  $newGame.attr("disabled", false);
  $hit.attr("disabled", true);
  $stay.attr("disabled", true);
  isDoubledDown = false;
  $doubleDown.attr("id", "doubleDown-hidden");
  // splitAllowed = false;
  // $split.attr("disabled", true);
}

function clearTable() {
  isFirstTurn = true;
  $dealer.empty();
  $player.empty();
  $dealerTotal.addClass("hidden");
  $playerTotal.empty();
  $announce.removeClass("win lose push");
  console.log("--table cleared--");
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
  var $flipped = $(".dealer .cardImage").first();
  $flipped.remove();
  var html = "<img src='" + game.hiddenCard + "' class='cardImage'>";
  $dealer.prepend(html);
}

function updateCount(card) {
  if (isNaN(Number(card)) || card === "10") {
    count -= 1;
  } else if (card < 7) {
    count += 1;
  }
  $count.empty();
  $count.append("<p>Count: " + count + "</p>");

  if (count >= 20) {
    $count.addClass("hot");
  } else if (count > -20 && count < 20) {
    $count.removeClass("hot cold");
  } else if (count <= -20) {
    $count.addClass("cold");
  }
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
  } else {
    console.log("Insufficient funds.");
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
  // game.playerChips = {
  //   "num100s": num100s,
  //   "num50s": num50s,
  //   "num25s": num25s,
  //   "num10s": num10s,
  //   "num5s": num5s,
  //   "num1s": num1s,
  //   "num05s": num05s
  // };
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

// Deal specific cards for testing purposes
$(".testDeal").click(function () {
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
  game.dealerHand = [dealer1Value, dealer2Value];
  game.playerHand = [player1Value, player2Value];
  checkTotal("player");
  checkTotal("dealer");
  $dealer.empty();
  $player.empty();
});

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
//# sourceMappingURL=data:application/json;base64,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RUFBRSxDQUFDLENBQUM7QUFDdEIsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsWUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEIsVUFBTSxHQUFHLENBQUMsQ0FBQztHQUNaO0NBQ0YsQ0FBQyxDQUFDO0FBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZO0FBQ3ZCLE1BQUksZ0JBQWdCLEVBQUU7QUFDcEIsVUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdEIsVUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDakMsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsWUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEIsVUFBTSxHQUFHLENBQUMsQ0FBQztHQUNaO0NBQ0YsQ0FBQyxDQUFDO0FBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZO0FBQ3hCLE1BQUksZ0JBQWdCLEVBQUU7QUFDcEIsVUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdEIsVUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdEIsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDbEMsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsWUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEIsVUFBTSxHQUFHLEVBQUUsQ0FBQztHQUNiO0NBQ0YsQ0FBQyxDQUFDO0FBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZO0FBQ3hCLE1BQUksZ0JBQWdCLEVBQUU7QUFDcEIsVUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdEIsVUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdEIsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDbEMsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsWUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEIsVUFBTSxHQUFHLEVBQUUsQ0FBQztHQUNiO0NBQ0YsQ0FBQyxDQUFDO0FBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZO0FBQ3hCLE1BQUksZ0JBQWdCLEVBQUU7QUFDcEIsVUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdEIsVUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdEIsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDbEMsWUFBUSxD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QUFPLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDakIsQ0FBQyxDQUFDOzs7QUFHSCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFO0FBQ3hCLE1BQUksV0FBVyxHQUFHLDhCQUE4QixDQUFDOztBQUVqRCxNQUFJLE9BQU8sR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBQ25DLFNBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFdBQVcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUN2QyxTQUFPLENBQUMsTUFBTSxHQUFHLFlBQVc7QUFDMUIsUUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtBQUNqRCxRQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztLQUN0QyxNQUFNO0FBQ0wsUUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7S0FDdEMsQ0FBQztHQUNILENBQUM7QUFDRixTQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDaEIsQ0FBQyIsImZpbGUiOiJzcmMvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBBUEkgPSBcImh0dHA6Ly9kZWNrb2ZjYXJkc2FwaS5jb20vYXBpL1wiO1xudmFyIG5ld0RlY2tVUkwgPSBBUEkgKyBcInNodWZmbGUvP2RlY2tfY291bnQ9NlwiO1xudmFyIGNhcmRCYWNrID0gXCJodHRwOi8vdGlueXVybC5jb20va3F6em1iclwiO1xuXG52YXIgZ2FtZTtcbnZhciBkZWNrSWQgPSBcIlwiO1xudmFyIGNvdW50ID0gMDtcbnZhciBiYW5rID0gNTAwO1xudmFyIGJldEFtdCA9IDI1O1xudmFyIGJldENoYW5nZUFsbG93ZWQgPSB0cnVlO1xuLy8gdmFyIHNwbGl0QWxsb3dlZCA9IGZhbHNlO1xudmFyIGlzRmlyc3RUdXJuID0gdHJ1ZTtcbnZhciBpc1BsYXllcnNUdXJuID0gdHJ1ZTtcbnZhciBpc0RvdWJsZWREb3duID0gZmFsc2U7XG4vLyB2YXIgaXNTcGxpdCA9IGZhbHNlO1xuLy8gdmFyIGdhbWVIYW5kID0gXCJcIjtcblxuLy9idXR0b25zXG4vLyB2YXIgJHNwbGl0ID0gJChcIi5zcGxpdFwiKTtcbnZhciAkZG91YmxlRG93biA9ICQoXCIuZG91YmxlRG93blwiKTtcbnZhciAkbmV3R2FtZSA9ICQoXCIubmV3R2FtZVwiKTtcbnZhciAkaGl0ID0gJChcIi5oaXRcIik7XG52YXIgJHN0YXkgPSAkKFwiLnN0YXlcIik7XG5cbi8vY2hpcHNcbnZhciAkY2hpcDEgPSAkKFwiLmNoaXAxXCIpO1xudmFyICRjaGlwNSA9ICQoXCIuY2hpcDVcIik7XG52YXIgJGNoaXAxMCA9ICQoXCIuY2hpcDEwXCIpO1xudmFyICRjaGlwMjUgPSAkKFwiLmNoaXAyNVwiKTtcbnZhciAkY2hpcDUwID0gJChcIi5jaGlwNTBcIik7XG52YXIgJGNoaXAxMDAgPSAkKFwiLmNoaXAxMDBcIik7XG5cbi8vaW5mbyBkaXZzXG52YXIgJGhhbmRDaGlwcyA9ICQoXCIuaGFuZENoaXBzXCIpO1xudmFyICRiYW5rQ2hpcHMgPSAkKFwiLmJhbmtDaGlwc1wiKTtcbnZhciAkYmFua1RvdGFsID0gJChcIi5iYW5rVG90YWxcIik7XG52YXIgJGNvdW50ID0gJChcIi5jb3VudFwiKTtcbnZhciAkYW5ub3VuY2UgPSAkKFwiLmFubm91bmNlXCIpO1xudmFyICRhbm5vdW5jZVRleHQgPSAkKFwiLmFubm91bmNlIHBcIik7XG5cbi8vY2FyZCBoYW5kIGRpdnNcbnZhciAkZGVhbGVyID0gJChcIi5kZWFsZXJcIik7XG52YXIgJHBsYXllciA9ICQoXCIucGxheWVyXCIpO1xuLy8gdmFyICRwbGF5ZXJTcGxpdCA9ICQoXCIucGxheWVyU3BsaXRcIik7XG4vLyB2YXIgJGhhbmQxID0gJChcIi5oYW5kMVwiKTtcbi8vIHZhciAkaGFuZDIgPSAkKFwiLmhhbmQyXCIpO1xuXG4vL2hhbmQgdG90YWwgZGl2c1xudmFyICRkZWFsZXJUb3RhbCA9ICQoXCIuZGVhbGVyVG90YWxcIik7XG52YXIgJHBsYXllclRvdGFsID0gJChcIi5wbGF5ZXJUb3RhbFwiKTtcbi8vIHZhciAkaGFuZDFUb3RhbCA9ICQoXCIuaGFuZDFUb3RhbFwiKTtcbi8vIHZhciAkaGFuZDJUb3RhbCA9ICQoXCIuaGFuZDJUb3RhbFwiKTtcblxuLy9jcmVhdGUgYXVkaW8gZWxlbWVudHNcbnZhciBjYXJkUGxhY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuY2FyZFBsYWNlLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jYXJkUGxhY2UxLndhdicpO1xuXG52YXIgY2FyZFBhY2thZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuY2FyZFBhY2thZ2Uuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NhcmRPcGVuUGFja2FnZTIud2F2Jyk7XG5cbnZhciBidXR0b25DbGljayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5idXR0b25DbGljay5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2xpY2sxLndhdicpO1xuXG52YXIgd2luV2F2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbndpbldhdi5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2hpcHNIYW5kbGU1LndhdicpO1xuXG52YXIgbG9zZVdhdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5sb3NlV2F2LnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jYXJkU2hvdmUzLndhdicpO1xuXG4vL3BvcHVsYXRlIGJhbmsgYW1vdW50IG9uIHBhZ2UgbG9hZFxuJGJhbmtUb3RhbC50ZXh0KFwiQmFuazogXCIgKyBiYW5rKTtcbmNvdW50Q2hpcHMoXCJiYW5rXCIpO1xuXG4vL2J1dHRvbiBjbGljayBsaXN0ZW5lcnNcbiQoXCJidXR0b25cIikuY2xpY2soZnVuY3Rpb24gKCkge1xuICBidXR0b25DbGljay5sb2FkKCk7XG4gIGJ1dHRvbkNsaWNrLnBsYXkoKTtcbn0pO1xuXG4vLyAkc3BsaXQuY2xpY2soc3BsaXQpO1xuXG4vLyAkKFwiLmdpdmVTcGxpdEhhbmRcIikuY2xpY2soZnVuY3Rpb24gKCkge1xuLy8gICBnYW1lLnBsYXllckhhbmQgPSBbXCJLSU5HXCIsIFwiSkFDS1wiXTtcbi8vICAgY2hlY2tTcGxpdCgpO1xuLy8gfSk7XG5cbiRkb3VibGVEb3duLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICBiZXQoYmV0QW10KTtcbiAgY29uc29sZS5sb2coXCJkb3VibGUgZG93blwiKTtcbiAgaXNEb3VibGVkRG93biA9IHRydWU7XG4gIGhpdCgpO1xufSk7XG5cbiRuZXdHYW1lLmNsaWNrKG5ld0dhbWUpO1xuXG4kaGl0LmNsaWNrKGhpdCk7XG5cbiRzdGF5LmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coXCJzdGF5XCIpO1xuICBzdGF5KCk7XG59KTtcblxuLy9jaGlwIGNsaWNrIGxpc3RlbmVyc1xuJGNoaXAxLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgaWYgKGJldENoYW5nZUFsbG93ZWQpIHtcbiAgICAkY2hpcDEuYXR0cihcImlkXCIsIFwic2VsZWN0ZWRCZXRcIik7XG4gICAgJGNoaXA1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDEwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDI1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDUwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDEwMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgYmV0QW10ID0gMTtcbiAgfVxufSk7XG4kY2hpcDUuY2xpY2soZnVuY3Rpb24gKCkge1xuICBpZiAoYmV0Q2hhbmdlQWxsb3dlZCkge1xuICAgICRjaGlwMS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1LmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgICRjaGlwMTAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMjUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwNTAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICBiZXRBbXQgPSA1O1xuICB9XG59KTtcbiRjaGlwMTAuY2xpY2soZnVuY3Rpb24gKCkge1xuICBpZiAoYmV0Q2hhbmdlQWxsb3dlZCkge1xuICAgICRjaGlwMS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDEwLmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgICRjaGlwMjUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwNTAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICBiZXRBbXQgPSAxMDtcbiAgfVxufSk7XG4kY2hpcDI1LmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgaWYgKGJldENoYW5nZUFsbG93ZWQpIHtcbiAgICAkY2hpcDEuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAxMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAyNS5hdHRyKFwiaWRcIiwgXCJzZWxlY3RlZEJldFwiKTtcbiAgICAkY2hpcDUwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDEwMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgYmV0QW10ID0gMjU7XG4gIH1cbn0pO1xuJGNoaXA1MC5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJGNoaXAxLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMjUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwNTAuYXR0cihcImlkXCIsIFwic2VsZWN0ZWRCZXRcIik7XG4gICAgJGNoaXAxMDAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgIGJldEFtdCA9IDUwO1xuICB9XG59KTtcbiRjaGlwMTAwLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgaWYgKGJldENoYW5nZUFsbG93ZWQpIHtcbiAgICAkY2hpcDEuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAxMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAyNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1MC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAxMDAuYXR0cihcImlkXCIsIFwic2VsZWN0ZWRCZXRcIik7XG4gICAgYmV0QW10ID0gMTAwO1xuICB9XG59KTtcblxuLy9nYW1lIG9iamVjdFxuZnVuY3Rpb24gR2FtZSgpIHtcbiAgdGhpcy5oaWRkZW5DYXJkID0gXCJcIjtcbiAgdGhpcy5kZWFsZXJIYW5kID0gW107XG4gIHRoaXMucGxheWVySGFuZCA9IFtdO1xuICB0aGlzLmRlYWxlclRvdGFsID0gMDtcbiAgdGhpcy5wbGF5ZXJUb3RhbCA9IDA7XG4gIC8vIHRoaXMuc3BsaXRDYXJkSW1hZ2VzID0gW107XG4gIC8vIHRoaXMuc3BsaXRIYW5kMSA9IFtdO1xuICAvLyB0aGlzLnNwbGl0SGFuZDIgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdEhhbmQxVG90YWwgPSAwO1xuICAvLyB0aGlzLnNwbGl0SGFuZDJUb3RhbCA9IDA7XG4gIHRoaXMud2FnZXIgPSAwO1xuICB0aGlzLndpbm5lciA9IFwiXCI7XG4gIC8vIHRoaXMucGxheWVyQ2hpcHMgPSB7fTtcbn1cblxuZnVuY3Rpb24gbmV3R2FtZSgpIHtcbiAgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gIGJldChiZXRBbXQpO1xuICBkZWFsKCk7XG59XG5cbmZ1bmN0aW9uIGRlYWwoKSB7XG4gIGlzRmlyc3RUdXJuID0gdHJ1ZTtcbiAgaWYgKGJhbmsgPj0gYmV0QW10KSB7XG4gICAgY2xlYXJUYWJsZSgpO1xuICAgICRuZXdHYW1lLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAkaGl0LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJHN0YXkuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICBjYXJkUGFja2FnZS5sb2FkKCk7XG4gICAgY2FyZFBhY2thZ2UucGxheSgpO1xuICAgIGlmIChkZWNrSWQgPT09IFwiXCIpIHtcbiAgICAgIGdldEpTT04obmV3RGVja1VSTCwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBkZWNrSWQgPSBkYXRhLmRlY2tfaWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQWJvdXQgdG8gZGVhbCBmcm9tIG5ldyBkZWNrXCIpO1xuICAgICAgICBkcmF3NCgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQWJvdXQgdG8gZGVhbCBmcm9tIGN1cnJlbnQgZGVja1wiKTtcbiAgICAgIGRyYXc0KCk7XG4gICAgfVxuICAgIGJldENoYW5nZUFsbG93ZWQgPSBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkcmF3NCgpIHtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJkZWFsZXJcIixcbiAgICBpbWFnZTogY2FyZEJhY2tcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwicGxheWVyXCIsXG4gICAgc3RvcmVJbWc6IHRydWVcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwiZGVhbGVyXCJcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwicGxheWVyXCIsXG4gICAgc3RvcmVJbWc6IHRydWUvLyxcbiAgICAvLyBjYWxsYmFjazogY2hlY2tTcGxpdFxuICB9KTtcbn1cblxuLy8gZnVuY3Rpb24gY2hlY2tTcGxpdCgpIHtcbi8vICAgdmFyIGNoZWNrU3BsaXRBcnIgPSBnYW1lLnBsYXllckhhbmQubWFwKGZ1bmN0aW9uKGNhcmQpIHtcbi8vICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuLy8gICAgICAgcmV0dXJuIDEwO1xuLy8gICAgIH0gZWxzZSBpZiAoIWlzTmFOKGNhcmQpKSB7XG4vLyAgICAgICByZXR1cm4gTnVtYmVyKGNhcmQpO1xuLy8gICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuLy8gICAgICAgcmV0dXJuIDE7XG4vLyAgICAgfVxuLy8gICB9KTtcbi8vICAgaWYgKGNoZWNrU3BsaXRBcnJbMF0gPT09IGNoZWNrU3BsaXRBcnJbMV0pIHtcbi8vICAgICBzcGxpdEFsbG93ZWQgPSB0cnVlO1xuLy8gICAgICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuLy8gICB9XG4vLyB9XG5cbi8vIGZ1bmN0aW9uIHNwbGl0ICgpIHtcbi8vICAgZ2FtZS5zcGxpdEhhbmQxLnB1c2goZ2FtZS5wbGF5ZXJIYW5kWzBdKTtcbi8vICAgZ2FtZS5zcGxpdEhhbmQyLnB1c2goZ2FtZS5wbGF5ZXJIYW5kWzFdKTtcbi8vICAgaXNTcGxpdCA9IHRydWU7XG4vLyAgICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4vLyAgICRwbGF5ZXIuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4vLyAgICRwbGF5ZXJUb3RhbC5hZGRDbGFzcyhcImhpZGRlblwiKTtcbi8vICAgJHBsYXllclNwbGl0LnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuLy8gICAkaGFuZDEuaHRtbChgPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9JyR7Z2FtZS5zcGxpdENhcmRJbWFnZXNbMF19Jz5gKTtcbi8vICAgJGhhbmQyLmh0bWwoYDxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPScke2dhbWUuc3BsaXRDYXJkSW1hZ2VzWzFdfSc+YCk7XG4vLyAgIGNoZWNrU3BsaXRUb3RhbChcImhhbmQxXCIpO1xuLy8gICBjaGVja1NwbGl0VG90YWwoXCJoYW5kMlwiKTtcbi8vICAgZ2FtZUhhbmQgPSBcImhhbmQxXCI7XG4vLyAgIGhpZ2hsaWdodChcImhhbmQxXCIpO1xuLy8gfVxuXG4vLyBmdW5jdGlvbiBoaWdobGlnaHQoaGFuZCkge1xuLy8gICBoYW5kID09PSBcImhhbmQxXCIgPyAoXG4vLyAgICAgJGhhbmQxLmFkZENsYXNzKFwiaGlnaGxpZ2h0ZWRcIiksXG4vLyAgICAgJGhhbmQyLnJlbW92ZUNsYXNzKFwiaGlnaGxpZ2h0ZWRcIilcbi8vICAgKSA6IChcbi8vICAgICAkaGFuZDIuYWRkQ2xhc3MoXCJoaWdobGlnaHRlZFwiKSxcbi8vICAgICAkaGFuZDEucmVtb3ZlQ2xhc3MoXCJoaWdobGlnaHRlZFwiKVxuLy8gICApO1xuLy8gfVxuXG5mdW5jdGlvbiBkcmF3Q2FyZChvcHRpb25zKSB7XG4gIHZhciBjYXJkVVJMID0gQVBJICsgXCJkcmF3L1wiICsgZGVja0lkICsgXCIvP2NvdW50PTFcIjtcbiAgZ2V0SlNPTihjYXJkVVJMLCBmdW5jdGlvbihkYXRhLCBjYikge1xuICAgIHZhciBodG1sO1xuICAgIGNhcmRQbGFjZS5sb2FkKCk7XG4gICAgY2FyZFBsYWNlLnBsYXkoKTtcbiAgICBvcHRpb25zLmltYWdlID8gKFxuICAgICAgaHRtbCA9IFwiPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9J1wiICsgb3B0aW9ucy5pbWFnZSArIFwiJz5cIixcbiAgICAgICQoXCIuXCIgKyBvcHRpb25zLnBlcnNvbikuYXBwZW5kKGh0bWwpLFxuICAgICAgZ2FtZS5oaWRkZW5DYXJkID0gY2FyZEltYWdlKGRhdGEpXG4gICAgKSA6IChcbiAgICAgIGh0bWwgPSBcIjxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPSdcIiArIGNhcmRJbWFnZShkYXRhKSArIFwiJz5cIixcbiAgICAgICQoXCIuXCIgKyBvcHRpb25zLnBlcnNvbikuYXBwZW5kKGh0bWwpXG4gICAgKTtcbiAgICBvcHRpb25zLnBlcnNvbiA9PT0gXCJkZWFsZXJcIiA/IChcbiAgICAgIGdhbWUuZGVhbGVySGFuZC5wdXNoKGRhdGEuY2FyZHNbMF0udmFsdWUpLFxuICAgICAgY2hlY2tUb3RhbChcImRlYWxlclwiKSxcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyJ3MgaGFuZCAtIFwiICsgZ2FtZS5kZWFsZXJIYW5kICsgXCIgKioqKiBkZWFsZXIgaXMgYXQgXCIgKyBnYW1lLmRlYWxlclRvdGFsKVxuICAgICkgOiAoXG4gICAgICBnYW1lLnBsYXllckhhbmQucHVzaChkYXRhLmNhcmRzWzBdLnZhbHVlKSxcbiAgICAgIGNoZWNrVG90YWwoXCJwbGF5ZXJcIiksXG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllcidzIGhhbmQgLSBcIiArIGdhbWUucGxheWVySGFuZCArIFwiICoqKiogcGxheWVyIGlzIGF0IFwiICsgZ2FtZS5wbGF5ZXJUb3RhbClcbiAgICApO1xuICAgIGNoZWNrVmljdG9yeSgpO1xuICAgIHVwZGF0ZUNvdW50KGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgIC8vIG9wdGlvbnMuc3RvcmVJbWcgJiYgZ2FtZS5zcGxpdENhcmRJbWFnZXMucHVzaChjYXJkSW1hZ2UoZGF0YSkpO1xuICAgIHR5cGVvZiBvcHRpb25zLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nICYmIG9wdGlvbnMuY2FsbGJhY2soKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGhpdCgpIHtcbiAgY29uc29sZS5sb2coXCJoaXRcIik7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwicGxheWVyXCIsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uICgpIHsgaWYgKGlzRG91YmxlZERvd24gJiYgIWdhbWUud2lubmVyKSB7XG4gICAgICBzdGF5KCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgaWYgKGlzRmlyc3RUdXJuKSB7XG4gICAgaXNGaXJzdFR1cm4gPSBmYWxzZTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RheSgpIHtcbiAgZmxpcENhcmQoKTtcbiAgaWYgKCFnYW1lLndpbm5lciAmJiBnYW1lLmRlYWxlclRvdGFsIDwgMTcpIHtcbiAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoaXRzXCIpO1xuICAgIGlzUGxheWVyc1R1cm4gPSBmYWxzZTtcbiAgICBkcmF3Q2FyZCh7XG4gICAgICBwZXJzb246IFwiZGVhbGVyXCIsXG4gICAgICBjYWxsYmFjazogc3RheVxuICAgIH0pO1xuICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IGdhbWUucGxheWVyVG90YWwpIHtcbiAgICBnYW1lLndpbm5lciA9IFwicHVzaFwiO1xuICAgIGFubm91bmNlKFwiUFVTSFwiKTtcbiAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XG4gICAgZ2FtZUVuZCgpO1xuICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPCAyMikge1xuICAgIGdhbWUuZGVhbGVyVG90YWwgPiBnYW1lLnBsYXllclRvdGFsID8gKFxuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiLFxuICAgICAgYW5ub3VuY2UoXCJZT1UgTE9TRVwiKSxcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyJ3MgXCIgKyBnYW1lLmRlYWxlclRvdGFsICsgXCIgYmVhdHMgcGxheWVyJ3MgXCIgKyBnYW1lLnBsYXllclRvdGFsKSxcbiAgICAgIGdhbWVFbmQoKVxuICAgICkgOiAoXG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCIsXG4gICAgICBhbm5vdW5jZShcIllPVSBXSU5cIiksXG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllcidzIFwiICsgZ2FtZS5wbGF5ZXJUb3RhbCArIFwiIGJlYXRzIGRlYWxlcidzIFwiICsgZ2FtZS5kZWFsZXJUb3RhbCksXG4gICAgICBnYW1lRW5kKClcbiAgICApO1xuICB9XG59XG5cbi8vIGZ1bmN0aW9uIGNoZWNrU3BsaXRUb3RhbChoYW5kTnVtKSB7XG4vLyAgIHZhciB0b3RhbCA9IDA7XG4vLyAgIHZhciBoYW5kID0gaGFuZE51bSA9PT0gXCJoYW5kMVwiID8gZ2FtZS5zcGxpdEhhbmQxIDogZ2FtZS5zcGxpdEhhbmQyO1xuLy8gICB2YXIgYWNlcyA9IDA7XG5cbi8vICAgaGFuZC5mb3JFYWNoKGZ1bmN0aW9uKGNhcmQpIHtcbi8vICAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4vLyAgICAgICB0b3RhbCArPSAxMDtcbi8vICAgICB9IGVsc2UgaWYgKCFpc05hTihjYXJkKSkge1xuLy8gICAgICAgdG90YWwgKz0gTnVtYmVyKGNhcmQpO1xuLy8gICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuLy8gICAgICAgYWNlcyArPSAxO1xuLy8gICAgIH1cbi8vICAgfSk7XG5cbi8vICAgaWYgKGFjZXMgPiAwKSB7XG4vLyAgICAgaWYgKHRvdGFsICsgYWNlcyArIDEwID4gMjEpIHtcbi8vICAgICAgIHRvdGFsICs9IGFjZXM7XG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgIHRvdGFsICs9IGFjZXMgKyAxMDtcbi8vICAgICB9XG4vLyAgIH1cblxuLy8gICBoYW5kTnVtID09PSBcImhhbmQxXCIgPyAoXG4vLyAgICAgZ2FtZS5zcGxpdEhhbmQxVG90YWwgPSB0b3RhbCxcbi8vICAgICAkaGFuZDFUb3RhbC50ZXh0KGdhbWUuc3BsaXRIYW5kMVRvdGFsKVxuLy8gICApIDogKFxuLy8gICAgIGdhbWUuc3BsaXRIYW5kMlRvdGFsID0gdG90YWwsXG4vLyAgICAgJGhhbmQyVG90YWwudGV4dChnYW1lLnNwbGl0SGFuZDJUb3RhbClcbi8vICAgKTtcbi8vIH1cblxuZnVuY3Rpb24gY2hlY2tUb3RhbChwZXJzb24pIHtcbiAgdmFyIHRvdGFsID0gMDtcbiAgdmFyIGhhbmQgPSBwZXJzb24gPT09IFwiZGVhbGVyXCIgPyBnYW1lLmRlYWxlckhhbmQgOiBnYW1lLnBsYXllckhhbmQ7XG4gIHZhciBhY2VzID0gMDtcblxuICBoYW5kLmZvckVhY2goZnVuY3Rpb24oY2FyZCkge1xuICAgIGlmIChjYXJkID09PSBcIktJTkdcIiB8fCBjYXJkID09PSBcIlFVRUVOXCIgfHwgY2FyZCA9PT0gXCJKQUNLXCIpIHtcbiAgICAgIHRvdGFsICs9IDEwO1xuICAgIH0gZWxzZSBpZiAoIWlzTmFOKGNhcmQpKSB7XG4gICAgICB0b3RhbCArPSBOdW1iZXIoY2FyZCk7XG4gICAgfSBlbHNlIGlmIChjYXJkID09PSBcIkFDRVwiKSB7XG4gICAgICBhY2VzICs9IDE7XG4gICAgfVxuICB9KTtcblxuICBpZiAoYWNlcyA+IDApIHtcbiAgICBpZiAodG90YWwgKyBhY2VzICsgMTAgPiAyMSkge1xuICAgICAgdG90YWwgKz0gYWNlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdG90YWwgKz0gYWNlcyArIDEwO1xuICAgIH1cbiAgfVxuXG4gIHBlcnNvbiA9PT0gXCJkZWFsZXJcIiA/IChcbiAgICBnYW1lLmRlYWxlclRvdGFsID0gdG90YWwsXG4gICAgJGRlYWxlclRvdGFsLnRleHQoZ2FtZS5kZWFsZXJUb3RhbClcbiAgKSA6IChcbiAgICBnYW1lLnBsYXllclRvdGFsID0gdG90YWwsXG4gICAgJHBsYXllclRvdGFsLnRleHQoZ2FtZS5wbGF5ZXJUb3RhbClcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tWaWN0b3J5KCkge1xuICBpZiAoZ2FtZS5kZWFsZXJIYW5kLmxlbmd0aCA+PSAyICYmIGdhbWUucGxheWVySGFuZC5sZW5ndGggPj0gMikge1xuICAgIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlckhhbmQubGVuZ3RoID09PSAyICYmIGdhbWUucGxheWVyVG90YWwgPT09IDIxICYmIGdhbWUucGxheWVySGFuZC5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZG91YmxlIGJsYWNramFjayBwdXNoIVwiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwdXNoXCI7XG4gICAgICBhbm5vdW5jZShcIlBVU0hcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlckhhbmQubGVuZ3RoID09PSAyICYmIGdhbWUucGxheWVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgYmxhY2tqYWNrXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoXCJZT1UgTE9TRVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUucGxheWVyVG90YWwgPT09IDIxICYmIGdhbWUucGxheWVySGFuZC5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGhhcyBibGFja2phY2tcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBnYW1lLndhZ2VyICo9IDEuMjU7XG4gICAgICBhbm5vdW5jZShcIkJMQUNLSkFDSyFcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLnBsYXllclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwdXNoXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICAgIGFubm91bmNlKFwiUFVTSFwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPT09IDIgJiYgaXNQbGF5ZXJzVHVybiAmJiBnYW1lLnBsYXllclRvdGFsIDwgMjEpIHtcbiAgICAgIC8vZG8gbm90aGluZ1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIGJsYWNramFjaywgZG9pbmcgbm90aGluZy4uXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyAyMVwiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICAgIGFubm91bmNlKFwiWU9VIExPU0VcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID4gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGJ1c3RzXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiO1xuICAgICAgYW5ub3VuY2UoXCJZT1UgV0lOXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGhhcyAyMVwiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGFubm91bmNlKFwiMjEhXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5wbGF5ZXJUb3RhbCA+IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllciBidXN0c1wiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICAgIGFubm91bmNlKFwiQlVTVFwiKTtcbiAgICB9XG4gIH1cblxuICBnYW1lLndpbm5lciAmJiBnYW1lRW5kKCk7XG59XG5cbmZ1bmN0aW9uIGdhbWVFbmQoKSB7XG4gIGlmIChnYW1lLndpbm5lciA9PT0gXCJwbGF5ZXJcIikge1xuICAgIGJhbmsgKz0gKGdhbWUud2FnZXIgKiAyKTtcbiAgICBjb25zb2xlLmxvZyhgZ2l2aW5nIHBsYXllciAke2dhbWUud2FnZXIgKiAyfS4gQmFuayBhdCAke2Jhbmt9YCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicHVzaFwiKSB7XG4gICAgYmFuayArPSBnYW1lLndhZ2VyO1xuICAgIGNvbnNvbGUubG9nKGByZXR1cm5pbmcgJHtnYW1lLndhZ2VyfSB0byBwbGF5ZXIuIEJhbmsgYXQgJHtiYW5rfWApO1xuICB9XG4gICRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG4gIGJldENoYW5nZUFsbG93ZWQgPSB0cnVlO1xuICBmbGlwQ2FyZCgpO1xuICAkZGVhbGVyVG90YWwucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRuZXdHYW1lLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRoaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIGlzRG91YmxlZERvd24gPSBmYWxzZTtcbiAgJGRvdWJsZURvd24uYXR0cihcImlkXCIsIFwiZG91YmxlRG93bi1oaWRkZW5cIik7XG4gIC8vIHNwbGl0QWxsb3dlZCA9IGZhbHNlO1xuICAvLyAkc3BsaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xufVxuXG5mdW5jdGlvbiBjbGVhclRhYmxlKCkge1xuICBpc0ZpcnN0VHVybiA9IHRydWU7XG4gICRkZWFsZXIuZW1wdHkoKTtcbiAgJHBsYXllci5lbXB0eSgpO1xuICAkZGVhbGVyVG90YWwuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRwbGF5ZXJUb3RhbC5lbXB0eSgpO1xuICAkYW5ub3VuY2UucmVtb3ZlQ2xhc3MoXCJ3aW4gbG9zZSBwdXNoXCIpO1xuICBjb25zb2xlLmxvZyhcIi0tdGFibGUgY2xlYXJlZC0tXCIpO1xufVxuXG5mdW5jdGlvbiBjYXJkSW1hZ2UoZGF0YSkge1xuICB2YXIgY2FyZFZhbHVlID0gZGF0YS5jYXJkc1swXS52YWx1ZTtcbiAgdmFyIGNhcmRTdWl0ID0gZGF0YS5jYXJkc1swXS5zdWl0O1xuICB2YXIgZmlsZW5hbWUgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGNhcmRWYWx1ZSArIFwiX29mX1wiICsgY2FyZFN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICByZXR1cm4gZmlsZW5hbWU7XG59XG5cbmZ1bmN0aW9uIGFubm91bmNlKHRleHQpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcImRlYWxlclwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwibG9zZVwiKTtcbiAgICBsb3NlV2F2LmxvYWQoKTtcbiAgICBsb3NlV2F2LnBsYXkoKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwbGF5ZXJcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcIndpblwiKTtcbiAgICB3aW5XYXYubG9hZCgpO1xuICAgIHdpbldhdi5wbGF5KCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicHVzaFwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwicHVzaFwiKTtcbiAgfVxuICAkYW5ub3VuY2VUZXh0LnRleHQodGV4dCk7XG59XG5cbmZ1bmN0aW9uIGZsaXBDYXJkKCkge1xuICBjb25zb2xlLmxvZygnZmxpcCcpO1xuICB2YXIgJGZsaXBwZWQgPSAkKFwiLmRlYWxlciAuY2FyZEltYWdlXCIpLmZpcnN0KCk7XG4gICRmbGlwcGVkLnJlbW92ZSgpO1xuICB2YXIgaHRtbCA9IGA8aW1nIHNyYz0nJHtnYW1lLmhpZGRlbkNhcmR9JyBjbGFzcz0nY2FyZEltYWdlJz5gO1xuICAkZGVhbGVyLnByZXBlbmQoaHRtbCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvdW50KGNhcmQpIHtcbiAgaWYgKGlzTmFOKE51bWJlcihjYXJkKSkgfHwgY2FyZCA9PT0gXCIxMFwiKSB7XG4gICAgY291bnQgLT0gMTtcbiAgfSBlbHNlIGlmIChjYXJkIDwgNykge1xuICAgIGNvdW50ICs9IDE7XG4gIH1cbiAgJGNvdW50LmVtcHR5KCk7XG4gICRjb3VudC5hcHBlbmQoXCI8cD5Db3VudDogXCIgKyBjb3VudCArIFwiPC9wPlwiKTtcblxuICBpZiAoY291bnQgPj0gMjApIHtcbiAgICAkY291bnQuYWRkQ2xhc3MoXCJob3RcIik7XG4gIH0gZWxzZSBpZiAoY291bnQgPiAtMjAgJiYgY291bnQgPCAyMCkge1xuICAgICRjb3VudC5yZW1vdmVDbGFzcyhcImhvdCBjb2xkXCIpO1xuICB9IGVsc2UgaWYgKGNvdW50IDw9IC0yMCkge1xuICAgICRjb3VudC5hZGRDbGFzcyhcImNvbGRcIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gYmV0KGFtdCkge1xuICBpZiAoYmFuayA+PSBhbXQpIHtcbiAgICBnYW1lLndhZ2VyICs9IGFtdDtcbiAgICBiYW5rIC09IGFtdDtcbiAgICAkYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuICAgIGNvdW50Q2hpcHMoXCJiYW5rXCIpO1xuICAgIGNvdW50Q2hpcHMoXCJoYW5kXCIpO1xuICAgICQoXCIuY3VycmVudFdhZ2VyXCIpLnRleHQoXCJDdXJyZW50IFdhZ2VyOiBcIiArIGdhbWUud2FnZXIpO1xuICAgIGNvbnNvbGUubG9nKFwiYmV0dGluZyBcIiArIGFtdCk7XG4gICAgY29uc29sZS5sb2coXCJ3YWdlciBhdCBcIiArIGdhbWUud2FnZXIpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiSW5zdWZmaWNpZW50IGZ1bmRzLlwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3VudENoaXBzKGxvY2F0aW9uKSB7XG4gIHZhciBhbXQgPSBsb2NhdGlvbiA9PT0gXCJiYW5rXCIgPyBiYW5rIDogZ2FtZS53YWdlcjtcbiAgdmFyIG51bTEwMHMgPSBNYXRoLmZsb29yKGFtdCAvIDEwMCk7XG4gIHZhciBudW01MHMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwKSAvIDUwKTtcbiAgdmFyIG51bTI1cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCkgLyAyNSk7XG4gIHZhciBudW0xMHMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSkgLyAxMCk7XG4gICB2YXIgbnVtNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwKSAvIDUpO1xuICAgdmFyIG51bTFzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCAtIG51bTVzICogNSkgLyAxKTtcbiAgdmFyIG51bTA1cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTAgLSBudW01cyAqIDUgLSBudW0xcyAqIDEpIC8gLjUpO1xuICAvLyBnYW1lLnBsYXllckNoaXBzID0ge1xuICAvLyAgIFwibnVtMTAwc1wiOiBudW0xMDBzLFxuICAvLyAgIFwibnVtNTBzXCI6IG51bTUwcyxcbiAgLy8gICBcIm51bTI1c1wiOiBudW0yNXMsXG4gIC8vICAgXCJudW0xMHNcIjogbnVtMTBzLFxuICAvLyAgIFwibnVtNXNcIjogbnVtNXMsXG4gIC8vICAgXCJudW0xc1wiOiBudW0xcyxcbiAgLy8gICBcIm51bTA1c1wiOiBudW0wNXNcbiAgLy8gfTtcbiAgdmFyIGh0bWwgPSBcIlwiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTEwMHM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMTAwLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtNTBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTUwLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMjVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTI1LnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMTBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEwLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtNXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtNS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTFzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0wNXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMDUucG5nJz5cIjtcbiAgfTtcbiAgaWYgKGxvY2F0aW9uID09PSBcImJhbmtcIikge1xuICAgICRiYW5rQ2hpcHMuaHRtbChodG1sKTtcbiAgICAkKCcuYmFua0NoaXBzIGltZycpLmVhY2goZnVuY3Rpb24oaSwgYykge1xuICAgICAgJChjKS5jc3MoJ3RvcCcsIC01ICogaSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAobG9jYXRpb24gPT09IFwiaGFuZFwiKSB7XG4gICAgJGhhbmRDaGlwcy5odG1sKGh0bWwpO1xuICAgICQoJy5oYW5kQ2hpcHMgaW1nJykuZWFjaChmdW5jdGlvbihpLCBjKSB7XG4gICAgICAkKGMpLmNzcygndG9wJywgLTUgKiBpKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBEZWFsIHNwZWNpZmljIGNhcmRzIGZvciB0ZXN0aW5nIHB1cnBvc2VzXG4kKFwiLnRlc3REZWFsXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgdmFyIGRlYWxlcjFWYWx1ZSA9ICQoXCIuZGVhbGVyMVZhbHVlXCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMlZhbHVlID0gJChcIi5kZWFsZXIyVmFsdWVcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIxVmFsdWUgPSAkKFwiLnBsYXllcjFWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjJWYWx1ZSA9ICQoXCIucGxheWVyMlZhbHVlXCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMVN1aXQgPSAkKFwiLmRlYWxlcjFTdWl0XCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMlN1aXQgPSAkKFwiLmRlYWxlcjJTdWl0XCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMVN1aXQgPSAkKFwiLnBsYXllcjFTdWl0XCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMlN1aXQgPSAkKFwiLnBsYXllcjJTdWl0XCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgZGVhbGVyMVZhbHVlICsgXCJfb2ZfXCIgKyBkZWFsZXIxU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBkZWFsZXIyID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBkZWFsZXIyVmFsdWUgKyBcIl9vZl9cIiArIGRlYWxlcjJTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIHBsYXllcjEgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIHBsYXllcjFWYWx1ZSArIFwiX29mX1wiICsgcGxheWVyMVN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgcGxheWVyMiA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgcGxheWVyMlZhbHVlICsgXCJfb2ZfXCIgKyBwbGF5ZXIyU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIGdhbWUuZGVhbGVySGFuZCA9IFtkZWFsZXIxVmFsdWUsIGRlYWxlcjJWYWx1ZV07XG4gIGdhbWUucGxheWVySGFuZCA9IFtwbGF5ZXIxVmFsdWUsIHBsYXllcjJWYWx1ZV07XG4gIGNoZWNrVG90YWwoXCJwbGF5ZXJcIik7XG4gIGNoZWNrVG90YWwoXCJkZWFsZXJcIik7XG4gICRkZWFsZXIuZW1wdHkoKTtcbiAgJHBsYXllci5lbXB0eSgpO1xufSk7XG5cbi8vIEpTT04gcmVxdWVzdCBmdW5jdGlvbiB3aXRoIEpTT05QIHByb3h5XG5mdW5jdGlvbiBnZXRKU09OKHVybCwgY2IpIHtcbiAgdmFyIEpTT05QX1BST1hZID0gJ2h0dHBzOi8vanNvbnAuYWZlbGQubWUvP3VybD0nO1xuICAvLyBUSElTIFdJTEwgQUREIFRIRSBDUk9TUyBPUklHSU4gSEVBREVSU1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIEpTT05QX1BST1hZICsgdXJsKTtcbiAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKSB7XG4gICAgICBjYihKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNiKEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpKTtcbiAgICB9O1xuICB9O1xuICByZXF1ZXN0LnNlbmQoKTtcbn07XG4iXX0=