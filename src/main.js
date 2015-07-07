//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// global variables //
/////////////////////

// URLs
var API = "http://deckofcardsapi.com/api/";
// var API =  "http://localhost:8000/api/";
var newDeckURL = API + "shuffle/?deck_count=";
var cardBack = "http://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Card_back_16.svg/209px-Card_back_16.svg.png";

// global variables needed for data that persists beyond each round
var game;
var deckId = "";
var decks = 6;
var count = 0;
var trueCount = count / decksLeft;
var decksLeft = cardsLeft / 52;
var cardsLeft = 52 * decks;
var advantage = -0.5;
var bank = 500;
var betAmt = 10;
var betChangeAllowed = true;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// global jQuery variables //
////////////////////////////

// game buttons
var $deal = $(".deal");
var $hit = $(".hit");
var $stay = $(".stay");
var $double = $(".double");
var $splitButton = $(".splitButton");
var $split1Button = $(".split1Button");
var $split2Button = $(".split2Button");
var $insuranceButton = $(".insuranceButton");

// chip buttons for bet selection
var $chip1 = $(".chip1");
var $chip5 = $(".chip5");
var $chip10 = $(".chip10");
var $chip25 = $(".chip25");
var $chip50 = $(".chip50");
var $chip100 = $(".chip100");

// chip stacks
var $bankChips = $(".bankChips");
var $insuranceChips = $(".insuranceChips");
var $playerChips = $(".playerChips");
var $split1Chips = $(".split1Chips");
var $split2Chips = $(".split2Chips");
var $split1aChips = $(".split1aChips");
var $split1bChips = $(".split1bChips");
var $split2aChips = $(".split2aChips");
var $split2bChips = $(".split2bChips");

// chip totals
var $bankTotal = $(".bankTotal");
var $insuranceWager = $(".insuranceWager");
var $playerWager = $(".playerWager");
var $split1Wager = $(".split1Wager");
var $split2Wager = $(".split2Wager");
var $split1aWager = $(".split1aWager");
var $split1bWager = $(".split1bWager");
var $split2aWager = $(".split2aWager");
var $split2bWager = $(".split2bWager");

// card hand divs
var $dealerHand = $(".dealerHand");
var $playerHand = $(".playerHand");
var $split1Hand = $(".split1Hand");
var $split2Hand = $(".split2Hand");
var $split1aHand = $(".split1aHand");
var $split1bHand = $(".split1bHand");
var $split2aHand = $(".split2aHand");
var $split2bHand = $(".split2bHand");

// card hand parent divs
var $dealer = $(".dealer");
var $player = $(".player");
var $split1 = $(".split1");
var $split2 = $(".split2");
var $split1a = $(".split1a");
var $split1b = $(".split1b");
var $split2a = $(".split2a");
var $split2b = $(".split2b");

// hand total divs
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

// info divs
var $count = $(".count");
var $trueCount = $(".trueCount");



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// on page load //
/////////////////

// create audio elements on page load
var cardPlace = document.createElement('audio');
cardPlace.setAttribute('src', 'sounds/cardPlace1.wav');
var cardPackage = document.createElement('audio');
cardPackage.setAttribute('src', 'sounds/cardOpenPackage2.wav');
var buttonClick = document.createElement('audio');
buttonClick.setAttribute('src', 'sounds/click1.wav');
var chipsToDealerWav = document.createElement('audio');
chipsToDealerWav.setAttribute('src', 'sounds/chips-to-dealer.wav');
var loseWav = document.createElement('audio');
loseWav.setAttribute('src', 'sounds/cardShove3.wav');
var chipsToBankWav = document.createElement('audio');
chipsToBankWav.setAttribute('src', 'sounds/chips-to-bank.wav');
var chipOnFeltWav = document.createElement('audio');
chipOnFeltWav.setAttribute('src', 'sounds/chip-on-felt.wav');
var chipOnChipWav = document.createElement('audio');
chipOnChipWav.setAttribute('src', 'sounds/chip-on-chip.wav');

//populate bank amount on page load
$bankTotal.text("Bank: " + bank);
countChips("bank");


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// button click listeners //
///////////////////////////

// button click sound for all buttons
$("button").click(function () {
  buttonClick.load();
  buttonClick.play();
});

// game buttons
$deal.click(newGame);
$hit.click(hit);
$stay.click(stay);
$double.click(double);
$insuranceButton.click(insurance);

// split buttons
$(".hand ~ button").click(function () {
  var hand = $(this).parent().attr("class");
  if (bank - betAmt >= 0) {
      split(hand);
  } else {
    console.log("Insufficient funds.");
  }
});

// chips for changing bet amount
$(".chip").click(function() {
  if (betChangeAllowed) {
    $(".chip").attr("id", "");
    $(this).attr("id", "selectedBet");
    betAmt = Number($(this).attr("data-id"));
  }
});

// show/hide more count info by clicking the advantage meter
$(".toggleCountInfo").click(function () {
  $(".countInfo").toggleClass("hidden");
});

// enlarge/shrink strategy chart
$(".strategyImg").click(function () {
  $(".strategyImg").toggleClass("strategyBig");
});

// show/hide hand testing panel
$(".toggleTestPanel").click(function () {
  $(".testPanel").toggleClass("hidden");
});

// testing panel buttons
$(".testDeal").click(testDeal);
$(".giveCardButton").click(giveCard);



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// game object creation //
/////////////////////////

function Game() {
  this.dealer = new Hand();
  // while not a hand, insurance makes use of winner, wager, winnings, chipLeft, and chipTop for bet counting and chip display.
  this.insurance = new Hand();
  this.player = new Hand();
  this.split1 = new Hand();
  this.split2 = new Hand();
  this.split1a = new Hand();
  this.split1b = new Hand();
  this.split2a = new Hand();
  this.split2b = new Hand();
  // isFlipped tracks the status of the dealer's hole card.
  this.isFlipped = false;
  this.currentHand = "player";
  // handsToPlay tracks how many hands the player still needs to play. Only used for turning off highlighting.
  this.handsToPlay = 1;
  // undecidedHands tracks the number of hands for which the dealer will need to continue drawing cards.
  // Splitting increases the number by 1 while busts, blackjacks, and 5-card charlies decrease it by 1.
  this.undecidedHands = 1;
  // chipsWonHeight is the negative height of the chips already stacked on top of the bank chips.
  this.chipsWonHeight = 0;
  // dealerCouldHaveBlackjack is true when the dealer's upcard is a 10, jack, queen, king, or ace.
  // This allows for displaying the Blackjack! announcement on split hands before others are finished.
  this.dealerCouldHaveBlackjack = false;
}

function Hand() {
  // cards holds the card values for each hand, e.g. "ACE", "9", "10", etc.
  this.cards = [];
  // cardImages holds the URLs pointing to cards in the hand.
  this.cardImages = [];
  // total is the hand's card total as determined by checkTotal().
  this.total = 0;
  // winner is set to "dealer", "player", or "push" by insurance(), checkLoss21(), and checkVictory().
  this.winner = "";
  // wager is the amount that has been bet on the hand.
  this.wager = 0;
  // winnings is determined by handPayout() and is used by countChips() to change to showing chips won.
  this.winnings = 0;
  // isSplit is set to true by split() and checked by handEnd() to correctly calculate game.handsToPlay.
  this.isSplit = false;
  // isDoubled is set to true by double() and is checked by checkLoss21() to end the hand after hitting.
  this.isDoubled = false;
  // isDone is set by various functions and is checked by checkFocus() to control the flow of the game.
  this.isDone = true;
  // chipLeft and chipTop are used by setChipLocation() to absolutely position chip stacks on the table.
  this.chipLeft = 0;
  this.chipTop = 0;
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// gameplay functions //
///////////////////////
//////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// newGame() is invoked by clicking Deal. It creates a new game object, resets the table, and if there's
// enough in the bank it bets the selected bet amount and calls deal() to deal the cards.
function newGame() {
  game = new Game();
  clearTable();
  bet("player", betAmt) && deal();
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// deal() first disables changing the bet amount, replaces the Deal button with the Double, Hit and Stay buttons,
// and plays a card shuffling sound. Next it makes a call to the deckofcards API if it hasn't yet or if there is
// less than 3/4 of a deck left. If it makes the call it stores the deckId for later calls for cards, resets card
// counting global variables to initial values, and calls draw4() to deal two hands. If it already has a full-enough
// deck it calls draw4();
function deal() {
  betChangeAllowed = false;
  game.player.isDone = false;
  $deal.addClass("hidden");
  $(".hit, .stay, .double").removeClass("hidden");
  cardPackage.load();
  cardPackage.play();
  if (deckId === "" || cardsLeft < 39) {
    getJSON(newDeckURL + decks, function(data) {
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// draw4() calls drawCard() four times, alternating between the dealer and the player.
function draw4() {
  // The first call for the dealer's hole card specifies that its image is to be replaced with the cardBack image.
  drawCard({
    hand: "dealer",
    image: cardBack
  });
  // The second call for the player's first card specifies that once the card is retrieved the chips and wager amount
  // are to be shown and a chip placement sound is to be played.
  drawCard({
    hand: "player",
    callback: function () {
      $playerChips.removeClass("hidden");
      $playerWager.removeClass("hidden");
      chipOnFeltWav.play();
    }
  });
  // The third call for the dealer's second card specifies that once the card is retrieved it should check to see if
  // blackjack is possible and if the insurance button should be shown.
  drawCard({
    hand: "dealer",
    callback: couldDealerHaveBlackjack
  });
  // The fourth call for the player's second card specifies that once the card is retrieved it is to see if the player's
  // cards have matching values.
  drawCard({
    hand: "player",
    callback: function () {
      checkSplit("player");
    }
  });
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// drawCard() takes an object as an argument to allow for optional parameters. These are hand, image, and callback.
//   hand refers to the string value of the hand to deal a card to, such as "dealer" and "split1a".
//   image will replace the card's face image with the URL specified.
//   callback is a function to be run upon completion of the deckofcards API call.
function drawCard(options) {
  // drawCard() first makes a call to the API with an updated URL to draw 1 card from the current deck.
  var cardURL = `${API}draw/${deckId}/?count=1`;
  getJSON(cardURL, function(data, cb) {
    // variable for holding html string created
    var html;
    // hand is set to options.hand to allow for the string's use inside brackets below
    var hand = options.hand;
    // card image source is changed to local card image URL
    var cardImageSrc = cardImage(data);
    // card image is pushed to hand's array
    game[hand].cardImages.push(cardImageSrc);
    // cardPlace.wav is loaded and played. This means the sound will cut itself if it is still playing.
    cardPlace.load();
    cardPlace.play();
    // If a card back image has been specified for the dealer's first card...
    options.image ? (
      // create an html img element with its source
      html = `<img class="cardImage" src="${options.image}">`,
      // and add it to the front of the dealer's hand. This was necessary as responses
      // from the API don't always come back in the order the requests were sent.
      $dealerHand.prepend(html)
    // If this is any other card...
    ) : (
      // create an html img element with the card's front as its source
      html = `<img class="cardImage" src="${cardImageSrc}">`,
      // and add it to the end of the hand.
      $(`.${hand}Hand`).append(html)
    );
    if (hand === "dealer") {
      if (options.image) {
        // If this is the dealer's hole card, put its value at the front of the array.
        // Necessary for the same reason as above.
        game.dealer.cards.unshift(data.cards[0].value);
      } else {
        // If this is any other dealer card, put its value at the end of the array.
        game.dealer.cards.push(data.cards[0].value);
        // Since this is a visible card, send its value off for advantage calculation.
        updateCount(data.cards[0].value);
      }
      // Check what the dealer's cards add up to.
      checkTotal("dealer");
      console.log(`dealer - ${game.dealer.cards} **** dealer is at ${game.dealer.total}`);
    // If this isn't a card for the dealer's hand...
    } else {
      //put its value at the end of the array
      game[hand].cards.push(data.cards[0].value);
      // Update the count
      updateCount(data.cards[0].value);
      // and check the hand's total
      checkTotal(hand);
      console.log(`${hand} - ${game[hand].cards} **** ${hand} is at ${game.player.total}`);
      // Now that the total is checked, check to see if more action is allowed on the hand or not.
      checkLoss21(hand);
    }
    // If a callback has been specified and is a function, run it.
    // With just "options.callback()" it was not an optional parameter.
    typeof options.callback === 'function' && options.callback();
  });
  // Subtract 1 from the number of cards left in the deck.
  cardsLeft--;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function checkTotal(hand) {
  var total = 0;
  var handToCheck = hand === "dealer" ? game.dealer.cards : game[hand].cards;
  var aces = 0;

  handToCheck.forEach(function(card) {
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

  game[hand].total = total;
  $(`.${hand}Total`).text(total).css("color", textColor);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// couldDealerHaveBlackjack() checks to see if the dealer's up card is a 10, jack, queen, king, or ace.
// If it's an ace it shows the Insurance button.
// If it's an ace, 10, jack, queen, or king it sets dealerCouldHaveBlackjack to true.
function couldDealerHaveBlackjack() {
  switch (game.dealer.cards[1]) {
    case 'ACE':
      console.log("Insurance is available");
      $insuranceButton.removeClass("hidden");
    case '10':
    case 'JACK':
    case 'QUEEN':
    case 'KING':
      console.log('Dealer could have Blackjack');
      game.dealerCouldHaveBlackjack = true;
      break;
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// checkSplit() takes two arguments: hand and test.
//   hand refers to the string value of the hand to deal a card to, such as "dealer" and "split1a".
//   test is a boolean value the specifies whether or not to allow splitting regardless of matching card values
function checkSplit(hand, test) {
  // A new array is created to hold the two card values
  // For each card in the hand the numeric value is passed to the new array.
  var checkSplitArr = game[hand].cards.map(function(card) {
    if (card === "KING" || card === "QUEEN" || card === "JACK") {
      return "10";
    } else {
      return card;
    }
  });
  // If the two values are equal, and there is enough in the bank to bet on a new hand, or if the Split box is checked...
  if ((checkSplitArr[0] === checkSplitArr[1] && bank >= betAmt) || $(".splitTesting").is(":checked")) {
    // Show the Split button for the hand
    $(`.${hand} > button`).removeClass("hidden");
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function checkLoss21(hand) {
    if (game[hand].total > 21 && game[hand].cards.length < 5) {
      console.log("player busts");
      game[hand].winner = "dealer";
      announce(hand, "BUST");
      game.undecidedHands--;
      handEnd(hand);
    } else if (game[hand].total === 21) {
      if (game[hand].cards.length === 2) {
        game.undecidedHands--;
        if (!game.dealerCouldHaveBlackjack) {
          console.log("player has blackjack");
          game[hand].winner = "player";
          announce(hand, "BLACKJACK!");
        }
      }
      if (game[hand].cards.length === 5) {
        game.undecidedHands--;
        console.log("five card 21!");
        game[hand].winner = "player";
        announce(hand, "5 CARD 21!");
      }
      handEnd(hand);
    } else if (game[hand].cards.length === 5) {
      game.undecidedHands--;
      console.log("five card charlie!");
      game[hand].winner = "player";
      announce(hand, "5 CARD!");
      handEnd(hand);
    } else if (game[hand].isDoubled) {
      handEnd(hand);
    }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// player's turn //
//////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function hit() {
  console.log("hit");
  var hand = game.currentHand;
  drawCard({
    hand: hand
  });
  $double.attr("disabled", true);
  $(`.${hand} > button`).addClass("hidden");
  $insuranceButton.addClass("hidden");
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function stay() {
  console.log("stay");
  var hand = game.currentHand;
  $(`.${hand} > button`).addClass("hidden");
  $insuranceButton.addClass("hidden");
  handEnd(hand);
}

/////////////////
// side rules //
///////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function double() {
  var hand = game.currentHand;
  if (bank - betAmt >= 0) {
    $(".hit, .stay, .double").addClass("hidden");
    $insuranceButton.addClass("hidden");
    game[hand].isDoubled = true;
    bet(hand, betAmt);
    chipOnChipWav.play();
    console.log("double down");
    hit();
  } else {
    console.log("Insufficient funds.");
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function split(hand) {
  console.log("splitting " + hand);
  var hand1;
  var hand2;
  var $button;
  if (hand === "player") {
    hand1 = "split1";
    hand2 = "split2";
    $button = $splitButton;
  } else if (hand === "split1") {
    hand1 = "split1a";
    hand2 = "split1b";
    $button = $split1Button;
  } else if (hand === "split2") {
    hand1 = "split2a";
    hand2 = "split2b";
    $button = $split2Button;
  }
  game[hand1].cards.push(game[hand].cards.shift());
  game[hand2].cards.push(game[hand].cards.shift());
  game[hand].isSplit = true;
  $insuranceButton.addClass("hidden");
  game[hand].isDone = true;
  game[hand1].isDone = false;
  game[hand2].isDone = false;
  $button.addClass("hidden");
  $(`.${hand}`).addClass("hidden");
  $(`.${hand}Chips`).empty();
  $(`.${hand1}, .${hand2}`).removeClass("hidden");
  game[hand1].wager = betAmt;
  game[hand2].wager = betAmt;
  game[hand].wager = 0;
  bank -= betAmt;
  countChips("bank");
  $bankTotal.text("Bank: " + bank);
  countChips(hand1);
  countChips(hand2);
  chipOnFeltWav.play();
  $(`.${hand1}Wager`).text(game[hand1].wager);
  $(`.${hand2}Wager`).text(game[hand2].wager);
  game[hand1].cardImages.push(game[hand].cardImages.shift());
  game[hand2].cardImages.push(game[hand].cardImages.shift());
  $(`.${hand1}Hand`).append(`<img class='cardImage' src='${game[hand1].cardImages[0]}'>`);
  $(`.${hand2}Hand`).append(`<img class='cardImage' src='${game[hand2].cardImages[0]}'>`);
  drawCard({
    hand: hand1,
    callback: function () {
      checkSplit(hand1);
    }
  });
  drawCard({
    hand: hand2,
    callback: function () {
      checkSplit(hand2);
    }
  });
  game.handsToPlay++;
  game.undecidedHands++;
  checkFocus();
  highlight(game.currentHand);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function insurance() {
  if (bank - (betAmt / 2) >= 0) {
    $insuranceButton.addClass("hidden");
    bank -= (betAmt / 2);
    game.insurance.wager = betAmt / 2;
    countChips("insurance");
    chipOnFeltWav.play();
    $(".insuranceWager").text(game.insurance.wager);
    countChips("bank");
    $bankTotal.text("Bank: " + bank);
    if (game.dealer.total === 21) {
      flipCard();
      game.insurance.winner = "player"
      handPayout("insurance");
      checkVictory("player");
      gameEnd();
    } else {
      $(".noDealerBlackjack").removeClass("hidden");
      game.insurance.winner = "dealer"
    }
  } else {
    console.log("Insufficient funds.");
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ending the hand //
////////////////////



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function handEnd(hand) {
  game[hand].isDone = true;
  !game[hand].isSplit && game.handsToPlay--;
  checkFocus();
  game.handsToPlay > 0 ? highlight(game.currentHand) : highlight("none");
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function checkFocus() {
  if (game.split1a.isDone === false) {
    game.currentHand = "split1a";
  } else if (game.split1b.isDone === false) {
    game.currentHand = "split1b";
  } else if (game.split1.isDone === false) {
    game.currentHand = "split1";
  } else if (game.split2a.isDone === false) {
    game.currentHand = "split2a";
  } else if (game.split2b.isDone === false) {
    game.currentHand = "split2b";
  } else if (game.split2.isDone === false) {
    game.currentHand = "split2";
  } else {
    dealerTurn();
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function highlight(hand) {
  $(".hand").removeClass("highlighted");
  if (hand !== "none") {
    $(`.${hand}Hand`).addClass("highlighted");
    $(".hit, .stay, .double").removeClass("hidden");
    $double.attr("disabled", false);
  }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// dealer's turn and endgame //
//////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function dealerTurn() {
  console.log("--dealerTurn--");
  flipCard();
  if (game.dealer.total < 17 && game.undecidedHands > 0) {
    console.log(`dealer hits on ${game.dealer.total}`);
    drawCard({
      hand: "dealer",
      callback: function () {
        checkTotal("dealer");
        dealerTurn();
      }
    });
  } else if (game.dealer.total >= 17 || game.undecidedHands === 0 || game.player.total === 21 || game.player.cards.length === 5) {
    console.log(`dealer is finished with ${game.dealer.total}`);
    game.player.cards.length >= 2 && checkVictory("player");
    game.split1.cards.length >= 2 && checkVictory("split1");
    game.split2.cards.length >= 2 && checkVictory("split2");
    game.split1a.cards.length >= 2 && checkVictory("split1a");
    game.split1b.cards.length >= 2 && checkVictory("split1b");
    game.split2a.cards.length >= 2 && checkVictory("split2a");
    game.split2b.cards.length >= 2 && checkVictory("split2b");
    gameEnd();
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function checkVictory(hand) {
    if (game[hand].cards.length === 5 && game[hand].total === 21) {
      console.log("five card 21!");
      game[hand].winner = "player";
      game[hand].wager *= 2.5;
      announce(hand, "5 CARD 21!");
    } else if (game[hand].cards.length === 5) {
      console.log("five card charlie!");
      game[hand].winner = "player";
      game[hand].wager *= 1.25;
      announce(hand, "5 CARD!");
    } else if (game.dealer.total === 21 && game.dealer.cards.length === 2 && game[hand].total === 21 && game[hand].cards.length === 2) {
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
    } else if (game.dealer.total === 21) {
      console.log("dealer has 21");
      game[hand].winner = "dealer";
      announce(hand, "YOU LOSE");
    } else if (game.dealer.total > 21 && game[hand].total < 22) {
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
    } else if (game.dealer.total === game[hand].total) {
      game[hand].winner = "push";
      announce(hand, "PUSH");
      console.log("push");
    } else if (game.dealer.total < 22) {
      game.dealer.total > game[hand].total ? (
        game[hand].winner = "dealer",
        announce(hand, "YOU LOSE"),
        console.log("dealer's " + game.dealer.total + " beats player's' " + game[hand].total)
      ) : (
        game[hand].winner = "player",
        announce(hand, "YOU WIN"),
        console.log("player's " + game[hand].total + " beats dealer's " + game.dealer.total)
      );
    }
  handPayout(hand);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function handPayout(hand) {
  if (game[hand].winner === "player") {
    game[hand].winnings = Number((game[hand].wager * 2).toFixed());
    console.log(`giving player ${game[hand].winnings}. Bank is at ${bank + game[hand].winnings}`);
  } else if (game[hand].winner === "push") {
    game[hand].winnings = game[hand].wager;
    console.log(`returning ${game[hand].wager} to player. Bank is at ${bank + game[hand].wager}`);
  }
  bank += game[hand].winnings;
  game[hand].winner === "player" && countChips(hand, true);
  if (game[hand].winnings > 0) {
    $(`.${hand}Wager`).text(game[hand].winnings);
    chipOnChipWav.play();
  } else {
    $(`.${hand}Wager`).empty();
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function gameEnd() {
  finalChipMovement();
  !game.isFlipped && flipCard();
  betChangeAllowed = true;
  $dealerTotal.removeClass("hidden");
  $deal.removeClass("hidden");
  $(".hit, .stay, .double").addClass("hidden");
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// display related functions //
//////////////////////////////
/////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function clearTable() {
  chipStacksToBankNow();
  $(".hand, .total, .chips, .wager").empty();
  $(".dealerTotal, .playerSplit, .playerSplit1, .playerSplit2, .popup, .playerChips, .playerWager, .noDealerBlackjack, .insuranceButton").addClass("hidden");
  $player.removeClass("hidden");
  $double.attr("disabled", false);
  $(".popup").removeClass("win lose push");
  chipStacksToHands();
  console.log("------------table cleared------------");
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function cardImage(data) {
  var cardValue = data.cards[0].value;
  var cardSuit = data.cards[0].suit;
  var filename = "../images/cards/" + cardValue + "_of_" + cardSuit.toLowerCase() + ".svg";
  return filename;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function flipCard() {
  console.log('--flipCard--');
  game.isFlipped = true;
  var $flipped = $(".dealerHand .cardImage").first();
  $flipped.remove();
  var html = `<img src='${game.dealer.cardImages[0]}' class='cardImage'>`;
  $dealerHand.prepend(html);
  updateCount(game.dealer.cards[0]);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function announce(hand, text) {
  var popupWidth = 113 + (game[hand].cards.length - 1) * 22;
  if (game[hand].winner === "dealer") {
    $(`.announce${_.capitalize(hand)}`).addClass("lose");
  } else if (game[hand].winner === "player") {
    $(`.announce${_.capitalize(hand)}`).addClass("win");
  } else if (game[hand].winner === "push") {
    $(`.announce${_.capitalize(hand)}`).addClass("push");
  }
  if (hand !== "player") {
    if (text === "BLACKJACK!") {
      $(`.announce${_.capitalize(hand)}`).css("width", "164px");
      $(`.announce${_.capitalize(hand)}`).css("left", "-10px");
    } else {
      $(`.announce${_.capitalize(hand)}`).css("width", popupWidth);
    }
  }
  $(`.announce${_.capitalize(hand)}`).removeClass("hidden");
  $(`.announce${_.capitalize(hand)}`).html(`<p>${text}</p>`);
}


////////////////////
// chip movement //
//////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function countChips(location, winnings) {
  var amt = location === "bank" ? bank : winnings ? game[location].winnings : game[location].wager;
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function setChipLocations(location) {
  var bankTop = 393 + ($bankChips.children().length * -5) + game.chipsWonHeight;
  var bankLeft = 287;
  var dealerTop = -24
  var dealerLeft = 458;
  if (location === "bank") {
    game.insurance.chipTop =
    game.player.chipTop =
    game.split1.chipTop =
    game.split2.chipTop =
    game.split1a.chipTop =
    game.split1b.chipTop =
    game.split2a.chipTop =
    game.split2b.chipTop = bankTop;
    game.insurance.chipLeft =
    game.player.chipLeft =
    game.split1.chipLeft =
    game.split2.chipLeft =
    game.split1a.chipLeft =
    game.split1b.chipLeft =
    game.split2a.chipLeft =
    game.split2b.chipLeft = bankLeft;
  } else if (location === "hand") {
    game.insurance.chipTop = 74;
    game.insurance.chipLeft = 553;
    game.player.chipTop = 386;
    game.player.chipLeft = 457;
    game.split1.chipTop = 347;
    game.split1.chipLeft = 328;
    game.split2.chipTop = 347;
    game.split2.chipLeft = 604;
    game.split1a.chipTop = 347;
    game.split1a.chipLeft = 119;
    game.split1b.chipTop = 347;
    game.split1b.chipLeft = 343;
    game.split2a.chipTop = 347;
    game.split2a.chipLeft = 567;
    game.split2b.chipTop = 347;
    game.split2b.chipLeft = 792;
  } else if (location === "dealer") {
    game.insurance.chipTop =
    game.player.chipTop =
    game.split1.chipTop =
    game.split2.chipTop =
    game.split1a.chipTop =
    game.split1b.chipTop =
    game.split2a.chipTop =
    game.split2b.chipTop = dealerTop;
    game.insurance.chipLeft =
    game.player.chipLeft =
    game.split1.chipLeft =
    game.split2.chipLeft =
    game.split1a.chipLeft =
    game.split1b.chipLeft =
    game.split2a.chipLeft =
    game.split2b.chipLeft = dealerLeft;
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function moveChips(hand, location) {
  setChipLocations(location);
  location === "bank" && (game.chipsWonHeight += $(`.${hand}Chips`).children().length * -5);
  $(`.${hand}Chips`).animate({
    top: `${game[hand].chipTop}px`,
    left: `${game[hand].chipLeft}px`
  }, {
    duration: 400
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function moveChipsNow(hand, location) {
  setChipLocations(location);
  location === "bank" && (game.chipsWonHeight = 0);
  $(`.${hand}Chips`).css({
    top: `${game[hand].chipTop}px`,
    left: `${game[hand].chipLeft}px`
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function chipStacksToHands() {
  // setChipLocations("hand");
  var hands = ["insurance", "player", "split1", "split1a", "split1b", "split2", "split2a", "split2b"];
  hands.forEach(function(hand, i) {
    moveChips(hand, "hand");
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function chipStacksToBankNow() {
  // setChipLocations("hand");
  var hands = ["insurance", "player", "split1", "split1a", "split1b", "split2", "split2a", "split2b"];
  hands.forEach(function(hand, i) {
    moveChipsNow(hand, "bank");
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function finalChipMovement() {
var hands = ["split1a", "split1b", "split1", "split2a", "split2b", "split2", "player", "insurance"];
  hands.forEach(function(hand, i) {
    var location;
    var j = 0;
    if ($(`.${hand}Chips`).children().length > 0) {
      if (game[hand].winner === "dealer") {
        location = "dealer";
      } else {
        location = "bank";
        setTimeout(function () {
          $bankTotal.text("Bank: " + bank);
        }, 200 * j + 600);
      }
      setTimeout(function () {
        if (game[hand].winner === "dealer") {
          setTimeout(function() {
            chipsToDealerWav.load();
            chipsToDealerWav.play();
          }, 400);
        } else {
          setTimeout(function() {
            chipsToBankWav.load();
            chipsToBankWav.play();
          }, 500);
        }
        moveChips(hand, location);
        $(`.${hand}Wager`).empty();
      }, 200 * (j + 1));
      j++;
    }
  });
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// card counting and strategy //
///////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
  decksLeft = cardsLeft / 52;
  trueCount = count / decksLeft;
  advantage = (trueCount * 0.5) - 0.5;
  var num = advantage * 18;
  $(".gauge-needle").css("transform", "rotate(" + num + "deg)");
  $count.empty();
  $count.append("<p>Count: " + count + "</p>");
  $trueCount.empty();
  $trueCount.append("<p>True Count: " + trueCount.toPrecision(2) + "</p>");
  $('.cardsLeft').empty();
  $('.cardsLeft').append("<p>Cards left: " + cardsLeft + "</p>");
  $('.decksLeft').empty();
  $('.decksLeft').append("<p>Decks left: " + decksLeft.toPrecision(2) + " of " + decks + "</p>");
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// testing //
////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function testDeal() {
  game = new Game();
  bet("player", betAmt);
  betChangeAllowed = false;
  if (bank >= betAmt) {
    clearTable();

    $(".hit, .stay, .double").removeClass("hidden");
    $deal.addClass("hidden");
    cardPackage.load();
    cardPackage.play();
    getJSON(newDeckURL + decks, function(data) {
      deckId = data.deck_id;
    });
  }
  var dealer1Value = $(".dealer1Value").val().toUpperCase();
  var dealer2Value = $(".dealer2Value").val().toUpperCase();
  var player1Value = $(".player1Value").val().toUpperCase();
  var player2Value = $(".player2Value").val().toUpperCase();
  var dealer1Suit = $(".dealer1Suit").val();
  var dealer2Suit = $(".dealer2Suit").val();
  var player1Suit = $(".player1Suit").val();
  var player2Suit = $(".player2Suit").val();
  var dealer1 = "../images/cards/" + dealer1Value + "_of_" + dealer1Suit + ".svg";
  var dealer2 = "../images/cards/" + dealer2Value + "_of_" + dealer2Suit + ".svg";
  var player1 = "../images/cards/" + player1Value + "_of_" + player1Suit + ".svg";
  var player2 = "../images/cards/" + player2Value + "_of_" + player2Suit + ".svg";
  game.player.cardImages.push(player1);
  game.player.cardImages.push(player2);
  game.dealer.cards = [dealer1Value, dealer2Value];
  game.player.cards = [player1Value, player2Value];
  game.dealer.cardImages = [dealer1];
  $dealerHand.prepend(`<img src='${cardBack}' class='cardImage'>`);
  $dealerHand.append(`<img src='${dealer2}' class='cardImage'>`);
  $playerHand.append(`<img src='${player1}' class='cardImage'>`);
  $playerHand.append(`<img src='${player2}' class='cardImage'>`);
  checkTotal("dealer");
  checkTotal("player");
  checkLoss21("player");
  checkSplit("player");
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function giveCard() {
  var cardValue = $('.giveCardValue').val();
  var cardSuit = $('.giveCardSuit').val();
  var cardSrc = "../images/cards/" + cardValue + "_of_" + cardSuit + ".svg";
  var hand = $('.giveCardToHand').val();
  game[hand].cards.push(cardValue.toUpperCase());
  checkTotal(hand);
  $(`.${hand}Hand`).append(`<img src='${cardSrc}' class='cardImage'>`);
  hand !== "dealer" && checkLoss21(hand);
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// JSON request function with JSONP proxy //
///////////////////////////////////////////

function getJSON(url, cb) {
  //var JSONP_PROXY = 'https://jsonp.afeld.me/?url=';
  // THIS WILL ADD THE CROSS ORIGIN HEADERS
  var request = new XMLHttpRequest();
  request.open('GET', /*JSONP_PROXY + */url);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      cb(JSON.parse(request.responseText));
    } else {
      cb(JSON.parse(request.responseText));
    };
  };
  request.send();
};
