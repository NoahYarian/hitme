var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=6";
var cardBack = "http://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Card_back_16.svg/209px-Card_back_16.svg.png";

var game;
var deckId = "";
var decks = 6;
var count = 0;
var trueCount = count / decks;
var cardsLeft = 52 * decks;
var advantage = -.5;
var bank = 500;
var betAmt = 25;
var betChangeAllowed = true;
// var splitAllowed = false;
// var isFirstTurn = true;
// var isPlayersTurn = true;
// var isDoubledDown = false;
// var isFlipped = false;
// var isSplit = false;
// var gameHand = "";

//game buttons
var $deal = $(".deal");
var $hit = $(".hit");
var $stay = $(".stay");
var $double = $(".double");
var $splitButton = $(".splitButton");
var $split1Button = $(".split1Button");
var $split2Button = $(".split2Button");

//chips
var $chip1 = $(".chip1");
var $chip5 = $(".chip5");
var $chip10 = $(".chip10");
var $chip25 = $(".chip25");
var $chip50 = $(".chip50");
var $chip100 = $(".chip100");

//info divs
var $count = $(".count");
var $trueCount = $(".trueCount");

// Chip stacks
var $bankChips = $(".bankChips");
var $playerChips = $(".playerChips");
var $split1Chips = $(".split1Chips");
var $split2Chips = $(".split2Chips");
var $split1aChips = $(".split1aChips");
var $split1bChips = $(".split1bChips");
var $split2aChips = $(".split2aChips");
var $split2bChips = $(".split2bChips");

// Chip totals
var $bankTotal = $(".bankTotal");
var $playerWager = $(".playerWager");
var $split1Wager = $(".split1Wager");
var $split2Wager = $(".split2Wager");
var $split1aWager = $(".split1aWager");
var $split1bWager = $(".split1bWager");
var $split2aWager = $(".split2aWager");
var $split2bWager = $(".split2bWager");

//card hand divs
var $dealerHand = $(".dealerHand");
var $playerHand = $(".playerHand");
var $split1Hand = $(".split1Hand");
var $split2Hand = $(".split2Hand");
var $split1aHand = $(".split1aHand");
var $split1bHand = $(".split1bHand");
var $split2aHand = $(".split2aHand");
var $split2bHand = $(".split2bHand");

//card hand parent divs
var $dealer = $(".dealer");
var $player = $(".player");
var $split1 = $(".split1");
var $split2 = $(".split2");
var $split1a = $(".split1a");
var $split1b = $(".split1b");
var $split2a = $(".split2a");
var $split2b = $(".split2b");

//card split parent divs
var $playerSplit = $(".playerSplit");
var $playerSplit1 = $(".playerSplit1");
var $playerSplit2 = $(".playerSplit2");

//hand total divs
var $dealerTotal = $(".dealerTotal");
var $playerTotal = $(".playerTotal");
var $split1Total = $(".split1Total");
var $split2Total = $(".split2Total");
var $split1aTotal = $(".split1aTotal");
var $split1bTotal = $(".split1bTotal");
var $split2aTotal = $(".split2aTotal");
var $split2bTotal = $(".split2bTotal");

// win - lose - push - blackjack announce divs and text
var $announce = $(".announce");
var $announceText = $(".announce p");
var $announce1 = $(".announce1");
var $announceText1 = $(".announce1 p");
var $announce2 = $(".announce2");
var $announceText2 = $(".announce2 p");
var $announce1a = $(".announce1a");
var $announceText1a = $(".announce1a p");
var $announce1b = $(".announce1b");
var $announceText1b = $(".announce1b p");
var $announce2a = $(".announce2a");
var $announceText2a = $(".announce2a p");
var $announce2b = $(".announce2b");
var $announceText2b = $(".announce2b p");

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

$deal.click(newGame);

$hit.click(hit);

$stay.click(function () {
  console.log("stay");
  flipCard();
  stay();
});

$splitButton.click(split);
$split1Button.click(split);
$split2Button.click(split);

$double.click(function () {
  $double.attr("disabled", true);
  $hit.attr("disabled", true);
  $stay.attr("disabled", true);
  bet(betAmt);
  console.log("double down");
  isDoubledDown = true;
  hit();
});

$(".toggleCountInfo").click(function () {
  $(".countInfo").toggleClass("hidden");
});

$(".toggleTestPanel").click(function () {
  $(".testPanel").toggleClass("hidden");
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
  this.cards = [];
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
  bet("player", betAmt) && deal();
}

function deal() {
  betChangeAllowed = false;
  clearTable();
  $deal.attr("disabled", true);
  $(".hit, .stay, .double").attr("disabled", false);
  $double.attr("id", "");
  cardPackage.load();
  cardPackage.play();
  if (deckId === "" || cardsLeft < 33) {
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
    hand: "dealer",
    image: cardBack
  });
  drawCard({
    hand: "player"
  });
  drawCard({
    hand: "dealer"
  });
  drawCard({
    hand: "player",
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
  var cardURL = `${API}draw/${deckId}/?count=${decks}`;
  getJSON(cardURL, function(data, cb) {
    var html;
    var cardImage = cardImage(data);
    $(`game[options.hand].cardImages`).push(cardImage);
    cardPlace.load();
    cardPlace.play();
    options.image ? (
      html = `<img class="cardImage" src="${options.image}">`,
      $dealerHand.prepend(html)
    ) : (
      html = `<img class="cardImage" src="${cardImage(data)}">`,
      $("." + options.hand).append(html)
    );
    if (options.person === "dealer") {
      if (options.image) {
        game.dealer.cards.unshift(data.cards[0].value);
      } else {
        game.dealer.cards.push(data.cards[0].value);
        updateCount(data.cards[0].value);
      }
      checkTotal("dealer");
      console.log(`dealer - ${game.dealer.cards} **** dealer is at ${game.dealer.total}`);
    } else {
      game[options.hand].cards.push(data.cards[0].value);
      updateCount(data.cards[0].value);
      checkTotal(options.hand);
      console.log(`${options.hand} - ${game[options.hand].cards} **** ${options.hand} is at ${game.playerTotal}`);
    }
    checkVictory(options.hand);
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

function checkVictory(hand) {
  //guards against checking before the deal is complete
  if (game.dealer.cards.length >= 2 && game.player.cards.length >= 2) {
    if (game.dealer.total === 21 && game.dealer.cards.length === 2 && game[hand].total === 21 && game[hand].cards.length === 2) {
      console.log("double blackjack push!");
      game[hand].winner = "push";
      announce(hand, "PUSH");
    } else if (game.dealer.total === 21 && game.dealer.cards.length === 2 && game[hand].total === 21) {
      console.log("dealer has blackjack");
      game[hand].winner = "dealer";
      announce(hand, "YOU LOSE");
    } else if (game[hand].total === 21 && game[hand].cards.length === 2) {
      console.log("player has blackjack");
      game[hand].winner = "player";
      game[hand].wager *= 1.25;
      announce(hand, "BLACKJACK!");
    } else if (game.dealer.total === 21 && game[hand].total === 21) {
      console.log("push");
      game[hand].winner = "push";
      announce(hand, "PUSH");
    } else if (game.dealer.total === 21 && game.dealer.cards.length === 2 && game.isPlayersTurn && game[hand].total < 21) {
      console.log("dealer has blackjack, doing nothing...");
    } else if (game.dealer.total === 21) {
      console.log("dealer has 21");
      game[hand].winner = "dealer";
      announce(hand, "YOU LOSE");
    } else if (game.dealer.total > 21) {
      console.log("dealer busts");
      game[hand].winner = "player";
      announce(hand, "YOU WIN");
    } else if (game[hand].total === 21) {
      console.log("player has 21");
      game[hand].winner = "player";
      announce(hand, "21!");
    } else if (game[hand].total > 21) {
      console.log("player busts");
      game[hand].winner = "dealer";
      announce(hand, "BUST");
    }
  }

//  Need to replace this with something elsewhere

//  game.winner && gameEnd();
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
  $(".hand, .wager, .total, .chips").empty();
  $(".dealerTotal, .playerSplit, .playerSplit1, .playerSplit2, .popup").addClass("hidden");
  $(".popup").removeClass("win lose push");
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

function bet(hand, amt) {
  if (bank >= amt) {
    game[hand].wager += amt;
    bank -= amt;
    $bankTotal.text("Bank: " + bank);
    countChips("bank");
    countChips(hand);
    $(`.${hand}Wager`).text(game[hand].wager);
    console.log(`betting ${amt} on ${hand}`);
    console.log(`${hand} wager at ${game[hand].wager}`);
    return true;
  } else {
    console.log("Insufficient funds.");
    return false;
  }
}

function countChips(location) {
  var amt = location === "bank" ? bank : game[location].wager;
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
  } else {
    $(`.${location}Chips`).html(html);
    $(`.${location}Chips img`).each(function(i, c) {
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
