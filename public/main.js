"use strict";

var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=6";
var cardBack = "http://tinyurl.com/kqzzmbr";

var game;
var deckId = "";
var score = 0;
var count = 0;
var bank = 500;
var betAmt = 25;

//buttons
var $bet = $(".bet");
var $newGame = $(".newGame");
var $hit = $(".hit");
var $stay = $(".stay");

//chips
var $chip1 = $(".chip1");
var $chip5 = $(".chip5");
var $chip25 = $(".chip25");
var $chip100 = $(".chip100");

//scoreboard divs
var $bank = $(".bank");
var $score = $(".score");
var $count = $(".count");
var $announce = $(".announce");
var $announceText = $(".announce p");

//card hand divs
var $dealer = $(".dealer");
var $player = $(".player");

//hand total divs
var $dealerTotal = $(".dealerTotal");
var $playerTotal = $(".playerTotal");

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

//button click listeners
$("button").on("click", function () {
  buttonClick.load();
  buttonClick.play();
});
$bet.click(function () {
  bet(betAmt);
  $bet.attr("disabled", true);
});
$newGame.on("click", newGame);
$hit.on("click", hit);
$stay.on("click", function () {
  console.log("stay");
  stay();
});

//chip click listeners
$chip1.click(function () {
  $chip1.attr("id", "selectedBet");
  $chip5.attr("id", "");
  $chip25.attr("id", "");
  $chip100.attr("id", "");
  betAmt = 1;
});

$chip5.click(function () {
  $chip5.attr("id", "selectedBet");
  $chip1.attr("id", "");
  $chip25.attr("id", "");
  $chip100.attr("id", "");
  betAmt = 5;
});

$chip25.click(function () {
  $chip25.attr("id", "selectedBet");
  $chip5.attr("id", "");
  $chip1.attr("id", "");
  $chip100.attr("id", "");
  betAmt = 25;
});

$chip100.click(function () {
  $chip100.attr("id", "selectedBet");
  $chip5.attr("id", "");
  $chip25.attr("id", "");
  $chip1.attr("id", "");
  betAmt = 100;
});

//game object
function Game() {
  this.hiddenCard = "";
  this.dealerHand = [];
  this.playerHand = [];
  this.dealerTotal = 0;
  this.playerTotal = 0;
  this.wager = 0;
  this.winner = "";
}

function newGame() {
  game = new Game();
  bet(betAmt);
  deal();
}

function deal() {
  clearTable();
  $newGame.attr("disabled", true);
  $hit.attr("disabled", false);
  $stay.attr("disabled", false);
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
}

function draw4() {
  drawCard({
    person: "dealer",
    image: cardBack
  });
  drawCard({
    person: "player"
  });
  drawCard({
    person: "dealer"
  });
  drawCard({
    person: "player"
  });
}

function drawCard(options) {
  var cardURL = API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function (data, cb) {
    var html;
    cardPlace.load();
    cardPlace.play();
    options.image ? (html = "<img class='cardImage' src='" + options.image + "'>", $("." + options.person).append(html), game.hiddenCard = cardImage(data)) : (html = "<img class='cardImage' src='" + cardImage(data) + "'>", $("." + options.person).append(html));
    options.person === "dealer" ? (game.dealerHand.push(data.cards[0].value), checkTotal("dealer"), console.log("dealer's hand - " + game.dealerHand + " **** dealer is at " + game.dealerTotal)) : (game.playerHand.push(data.cards[0].value), checkTotal("player"), console.log("player's hand - " + game.playerHand + " **** player is at " + game.playerTotal));
    $bet.attr("disabled", false);
    $bet.attr("id", "");
    checkVictory();
    updateCount(data.cards[0].value);
    typeof options.callback === "function" && options.callback();
  });
}

function hit() {
  console.log("hit");
  drawCard({
    person: "player"
  });
}

function stay() {
  flipCard();
  if (!game.winner && game.dealerTotal < 17) {
    console.log("dealer hits");
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
    game.dealerTotal > game.playerTotal ? (game.winner = "dealer", announce("YOU LOSE"), score -= 1, console.log("dealer's " + game.dealerTotal + " beats player's " + game.playerTotal), gameEnd()) : (game.winner = "player", announce("YOU WIN"), score += 1, console.log("player's " + game.playerTotal + " beats dealer's " + game.dealerTotal), gameEnd());
  }
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

  person === "dealer" ? (game.dealerTotal = total, $dealerTotal.text(game.dealerTotal)) : (game.playerTotal = total, $playerTotal.text(game.playerTotal));
}

function checkVictory() {
  if (game.dealerTotal === 21) {
    console.log("dealer has 21");
    game.winner = "dealer";
    score -= 1;
    announce("YOU LOSE");
  } else if (game.dealerTotal > 21) {
    console.log("dealer busts");
    game.winner = "player";
    score += 1;
    announce("YOU WIN");
  } else if (game.playerTotal === 21) {
    console.log("player has 21");
    game.winner = "player";
    score += 1;
    announce("21!");
  } else if (game.playerTotal > 21) {
    console.log("player busts");
    game.winner = "dealer";
    score -= 1;
    announce("BUST");
  }

  game.winner && gameEnd();
}

function gameEnd() {
  if (game.winner === "player") {
    bank += game.wager * 2;
    console.log("giving player " + game.wager * 2);
  } else if (game.winner === "push") {
    bank += game.wager;
    console.log("giving player " + game.wager);
  }
  $bank.text("Bank: " + bank);
  flipCard();
  updateScore();
  $dealerTotal.removeClass("hidden");
  $bet.attr("id", "bet-hidden");
  $newGame.attr("disabled", false);
  $hit.attr("disabled", true);
  $stay.attr("disabled", true);
}

function clearTable() {
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
  var $flipped = $(".dealer .cardImage").first();
  $flipped.attr("src", game.hiddenCard);
}

function updateScore() {
  $score.empty();
  $score.append("<p>Score: " + score + "</p>");
}

function updateCount(card) {
  if (isNaN(Number(card)) || card === "10") {
    count -= 1;
  } else if (card < 7) {
    count += 1;
  }
  $count.empty();
  $count.append("<p>Count: " + count + "</p>");
}

function bet(amt) {
  game.wager += amt;
  bank -= amt;
  $bank.text("Bank: " + bank);
  $(".currentWager").text("Current Wager: " + game.wager);
  console.log("betting " + amt);
  console.log("wager at " + game.wager);
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
    }
  };
  request.send();
}
//# sourceMappingURL=data:application/json;base64,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QztBQUN4RCxTQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUM5QixTQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDdkM7OztBQUdELFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDeEIsTUFBSSxXQUFXLEdBQUcsOEJBQThCLENBQUM7O0FBRWpELE1BQUksT0FBTyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7QUFDbkMsU0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsV0FBVyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLFNBQU8sQ0FBQyxNQUFNLEdBQUcsWUFBVztBQUMxQixRQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO0FBQ2pELFFBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0tBQ3RDLE1BQU07QUFDTCxRQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztLQUN0QztHQUNGLENBQUM7QUFDRixTQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDaEIiLCJmaWxlIjoic3JjL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQVBJID0gXCJodHRwOi8vZGVja29mY2FyZHNhcGkuY29tL2FwaS9cIjtcbnZhciBuZXdEZWNrVVJMID0gQVBJICsgXCJzaHVmZmxlLz9kZWNrX2NvdW50PTZcIjtcbnZhciBjYXJkQmFjayA9IFwiaHR0cDovL3Rpbnl1cmwuY29tL2txenptYnJcIjtcblxudmFyIGdhbWU7XG52YXIgZGVja0lkID0gXCJcIjtcbnZhciBzY29yZSA9IDA7XG52YXIgY291bnQgPSAwO1xudmFyIGJhbmsgPSA1MDA7XG52YXIgYmV0QW10ID0gMjU7XG5cbi8vYnV0dG9uc1xudmFyICRiZXQgPSAkKFwiLmJldFwiKTtcbnZhciAkbmV3R2FtZSA9ICQoXCIubmV3R2FtZVwiKTtcbnZhciAkaGl0ID0gJChcIi5oaXRcIik7XG52YXIgJHN0YXkgPSAkKFwiLnN0YXlcIik7XG5cbi8vY2hpcHNcbnZhciAkY2hpcDEgPSAkKFwiLmNoaXAxXCIpO1xudmFyICRjaGlwNSA9ICQoXCIuY2hpcDVcIik7XG52YXIgJGNoaXAyNSA9ICQoXCIuY2hpcDI1XCIpO1xudmFyICRjaGlwMTAwID0gJChcIi5jaGlwMTAwXCIpO1xuXG4vL3Njb3JlYm9hcmQgZGl2c1xudmFyICRiYW5rID0gJChcIi5iYW5rXCIpO1xudmFyICRzY29yZSA9ICQoXCIuc2NvcmVcIik7XG52YXIgJGNvdW50ID0gJChcIi5jb3VudFwiKTtcbnZhciAkYW5ub3VuY2UgPSAkKFwiLmFubm91bmNlXCIpXG52YXIgJGFubm91bmNlVGV4dCA9ICQoXCIuYW5ub3VuY2UgcFwiKVxuXG4vL2NhcmQgaGFuZCBkaXZzXG52YXIgJGRlYWxlciA9ICQoXCIuZGVhbGVyXCIpO1xudmFyICRwbGF5ZXIgPSAkKFwiLnBsYXllclwiKTtcblxuLy9oYW5kIHRvdGFsIGRpdnNcbnZhciAkZGVhbGVyVG90YWwgPSAkKFwiLmRlYWxlclRvdGFsXCIpO1xudmFyICRwbGF5ZXJUb3RhbCA9ICQoXCIucGxheWVyVG90YWxcIik7XG5cbi8vY3JlYXRlIGF1ZGlvIGVsZW1lbnRzXG52YXIgY2FyZFBsYWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQbGFjZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFBsYWNlMS53YXYnKTtcblxudmFyIGNhcmRQYWNrYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQYWNrYWdlLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jYXJkT3BlblBhY2thZ2UyLndhdicpO1xuXG52YXIgYnV0dG9uQ2xpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuYnV0dG9uQ2xpY2suc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NsaWNrMS53YXYnKTtcblxudmFyIHdpbldhdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG53aW5XYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NoaXBzSGFuZGxlNS53YXYnKTtcblxudmFyIGxvc2VXYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xubG9zZVdhdi5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFNob3ZlMy53YXYnKTtcblxuLy9idXR0b24gY2xpY2sgbGlzdGVuZXJzXG4kKFwiYnV0dG9uXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICBidXR0b25DbGljay5sb2FkKCk7XG4gIGJ1dHRvbkNsaWNrLnBsYXkoKTtcbn0pO1xuJGJldC5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGJldChiZXRBbXQpO1xuICAkYmV0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbn0pO1xuJG5ld0dhbWUub24oXCJjbGlja1wiLCBuZXdHYW1lKTtcbiRoaXQub24oXCJjbGlja1wiLCBoaXQpO1xuJHN0YXkub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKFwic3RheVwiKTtcbiAgc3RheSgpO1xufSk7XG5cbi8vY2hpcCBjbGljayBsaXN0ZW5lcnNcbiRjaGlwMS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICRjaGlwMS5hdHRyKFwiaWRcIiwgXCJzZWxlY3RlZEJldFwiKTtcbiAgJGNoaXA1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgJGNoaXAyNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICRjaGlwMTAwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgYmV0QW10ID0gMTtcbn0pO1xuXG4kY2hpcDUuY2xpY2soZnVuY3Rpb24gKCkge1xuICAkY2hpcDUuYXR0cihcImlkXCIsIFwic2VsZWN0ZWRCZXRcIik7XG4gICRjaGlwMS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICRjaGlwMjUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAkY2hpcDEwMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gIGJldEFtdCA9IDU7XG59KTtcblxuJGNoaXAyNS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICRjaGlwMjUuYXR0cihcImlkXCIsIFwic2VsZWN0ZWRCZXRcIik7XG4gICRjaGlwNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICRjaGlwMS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICRjaGlwMTAwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgYmV0QW10ID0gMjU7XG59KTtcblxuJGNoaXAxMDAuY2xpY2soZnVuY3Rpb24gKCkge1xuICAkY2hpcDEwMC5hdHRyKFwiaWRcIiwgXCJzZWxlY3RlZEJldFwiKTtcbiAgJGNoaXA1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgJGNoaXAyNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICRjaGlwMS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gIGJldEFtdCA9IDEwMDtcbn0pO1xuXG4vL2dhbWUgb2JqZWN0XG5mdW5jdGlvbiBHYW1lKCkge1xuICB0aGlzLmhpZGRlbkNhcmQgPSBcIlwiO1xuICB0aGlzLmRlYWxlckhhbmQgPSBbXTtcbiAgdGhpcy5wbGF5ZXJIYW5kID0gW107XG4gIHRoaXMuZGVhbGVyVG90YWwgPSAwO1xuICB0aGlzLnBsYXllclRvdGFsID0gMDtcbiAgdGhpcy53YWdlciA9IDA7XG4gIHRoaXMud2lubmVyID0gXCJcIjtcbn1cblxuZnVuY3Rpb24gbmV3R2FtZSgpIHtcbiAgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gIGJldChiZXRBbXQpO1xuICBkZWFsKCk7XG59XG5cbmZ1bmN0aW9uIGRlYWwoKSB7XG4gIGNsZWFyVGFibGUoKTtcbiAgJG5ld0dhbWUuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkaGl0LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gIGNhcmRQYWNrYWdlLmxvYWQoKTtcbiAgY2FyZFBhY2thZ2UucGxheSgpO1xuICBpZiAoZGVja0lkID09PSBcIlwiKSB7XG4gICAgZ2V0SlNPTihuZXdEZWNrVVJMLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBkZWNrSWQgPSBkYXRhLmRlY2tfaWQ7XG4gICAgICBjb25zb2xlLmxvZyhcIkFib3V0IHRvIGRlYWwgZnJvbSBuZXcgZGVja1wiKTtcbiAgICAgIGRyYXc0KCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJBYm91dCB0byBkZWFsIGZyb20gY3VycmVudCBkZWNrXCIpO1xuICAgIGRyYXc0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZHJhdzQoKSB7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwiZGVhbGVyXCIsXG4gICAgaW1hZ2U6IGNhcmRCYWNrXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcInBsYXllclwiXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcImRlYWxlclwiXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcInBsYXllclwiXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkcmF3Q2FyZChvcHRpb25zKSB7XG4gIHZhciBjYXJkVVJMID0gQVBJICsgXCJkcmF3L1wiICsgZGVja0lkICsgXCIvP2NvdW50PTFcIjtcbiAgZ2V0SlNPTihjYXJkVVJMLCBmdW5jdGlvbihkYXRhLCBjYikge1xuICAgIHZhciBodG1sO1xuICAgIGNhcmRQbGFjZS5sb2FkKCk7XG4gICAgY2FyZFBsYWNlLnBsYXkoKTtcbiAgICBvcHRpb25zLmltYWdlID8gKFxuICAgICAgaHRtbCA9IFwiPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9J1wiICsgb3B0aW9ucy5pbWFnZSArIFwiJz5cIixcbiAgICAgICQoXCIuXCIgKyBvcHRpb25zLnBlcnNvbikuYXBwZW5kKGh0bWwpLFxuICAgICAgZ2FtZS5oaWRkZW5DYXJkID0gY2FyZEltYWdlKGRhdGEpXG4gICAgKSA6IChcbiAgICAgIGh0bWwgPSBcIjxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPSdcIiArIGNhcmRJbWFnZShkYXRhKSArIFwiJz5cIixcbiAgICAgICQoXCIuXCIgKyBvcHRpb25zLnBlcnNvbikuYXBwZW5kKGh0bWwpXG4gICAgKTtcbiAgICBvcHRpb25zLnBlcnNvbiA9PT0gXCJkZWFsZXJcIiA/IChcbiAgICAgIGdhbWUuZGVhbGVySGFuZC5wdXNoKGRhdGEuY2FyZHNbMF0udmFsdWUpLFxuICAgICAgY2hlY2tUb3RhbChcImRlYWxlclwiKSxcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyJ3MgaGFuZCAtIFwiICsgZ2FtZS5kZWFsZXJIYW5kICsgXCIgKioqKiBkZWFsZXIgaXMgYXQgXCIgKyBnYW1lLmRlYWxlclRvdGFsKVxuICAgICkgOiAoXG4gICAgICBnYW1lLnBsYXllckhhbmQucHVzaChkYXRhLmNhcmRzWzBdLnZhbHVlKSxcbiAgICAgIGNoZWNrVG90YWwoXCJwbGF5ZXJcIiksXG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllcidzIGhhbmQgLSBcIiArIGdhbWUucGxheWVySGFuZCArIFwiICoqKiogcGxheWVyIGlzIGF0IFwiICsgZ2FtZS5wbGF5ZXJUb3RhbClcbiAgICApO1xuICAgICRiZXQuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkYmV0LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICBjaGVja1ZpY3RvcnkoKTtcbiAgICB1cGRhdGVDb3VudChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICB0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zLmNhbGxiYWNrKCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBoaXQoKSB7XG4gIGNvbnNvbGUubG9nKFwiaGl0XCIpO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcInBsYXllclwiXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzdGF5KCkge1xuICBmbGlwQ2FyZCgpO1xuICBpZiAoIWdhbWUud2lubmVyICYmIGdhbWUuZGVhbGVyVG90YWwgPCAxNykge1xuICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhpdHNcIik7XG4gICAgZHJhd0NhcmQoe1xuICAgICAgcGVyc29uOiBcImRlYWxlclwiLFxuICAgICAgY2FsbGJhY2s6IHN0YXlcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSBnYW1lLnBsYXllclRvdGFsKSB7XG4gICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICBhbm5vdW5jZShcIlBVU0hcIik7XG4gICAgY29uc29sZS5sb2coXCJwdXNoXCIpO1xuICAgIGdhbWVFbmQoKTtcbiAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsIDwgMjIpIHtcbiAgICBnYW1lLmRlYWxlclRvdGFsID4gZ2FtZS5wbGF5ZXJUb3RhbCA/IChcbiAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIixcbiAgICAgIGFubm91bmNlKFwiWU9VIExPU0VcIiksXG4gICAgICBzY29yZSAtPSAxLFxuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIncyBcIiArIGdhbWUuZGVhbGVyVG90YWwgKyBcIiBiZWF0cyBwbGF5ZXIncyBcIiArIGdhbWUucGxheWVyVG90YWwpLFxuICAgICAgZ2FtZUVuZCgpXG4gICAgKSA6IChcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIixcbiAgICAgIGFubm91bmNlKFwiWU9VIFdJTlwiKSxcbiAgICAgIHNjb3JlICs9IDEsXG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllcidzIFwiICsgZ2FtZS5wbGF5ZXJUb3RhbCArIFwiIGJlYXRzIGRlYWxlcidzIFwiICsgZ2FtZS5kZWFsZXJUb3RhbCksXG4gICAgICBnYW1lRW5kKClcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrVG90YWwocGVyc29uKSB7XG4gIHZhciB0b3RhbCA9IDA7XG4gIHZhciBoYW5kID0gcGVyc29uID09PSBcImRlYWxlclwiID8gZ2FtZS5kZWFsZXJIYW5kIDogZ2FtZS5wbGF5ZXJIYW5kO1xuICB2YXIgYWNlcyA9IDA7XG5cbiAgaGFuZC5mb3JFYWNoKGZ1bmN0aW9uKGNhcmQpIHtcbiAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4gICAgICB0b3RhbCArPSAxMDtcbiAgICB9IGVsc2UgaWYgKCFpc05hTihjYXJkKSkge1xuICAgICAgdG90YWwgKz0gTnVtYmVyKGNhcmQpO1xuICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuICAgICAgYWNlcyArPSAxO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGFjZXMgPiAwKSB7XG4gICAgaWYgKHRvdGFsICsgYWNlcyArIDEwID4gMjEpIHtcbiAgICAgIHRvdGFsICs9IGFjZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvdGFsICs9IGFjZXMgKyAxMDtcbiAgICB9XG4gIH1cblxuICBwZXJzb24gPT09IFwiZGVhbGVyXCIgPyAoXG4gICAgZ2FtZS5kZWFsZXJUb3RhbCA9IHRvdGFsLFxuICAgICRkZWFsZXJUb3RhbC50ZXh0KGdhbWUuZGVhbGVyVG90YWwpXG4gICkgOiAoXG4gICAgZ2FtZS5wbGF5ZXJUb3RhbCA9IHRvdGFsLFxuICAgICRwbGF5ZXJUb3RhbC50ZXh0KGdhbWUucGxheWVyVG90YWwpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrVmljdG9yeSgpIHtcbiAgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxKSB7XG4gICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIDIxXCIpO1xuICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICBzY29yZSAtPSAxO1xuICAgIGFubm91bmNlKFwiWU9VIExPU0VcIik7XG4gIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA+IDIxKSB7XG4gICAgY29uc29sZS5sb2coXCJkZWFsZXIgYnVzdHNcIik7XG4gICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiO1xuICAgIHNjb3JlICs9IDE7XG4gICAgYW5ub3VuY2UoXCJZT1UgV0lOXCIpO1xuICB9IGVsc2UgaWYgKGdhbWUucGxheWVyVG90YWwgPT09IDIxKSB7XG4gICAgY29uc29sZS5sb2coXCJwbGF5ZXIgaGFzIDIxXCIpO1xuICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICBzY29yZSArPSAxO1xuICAgIGFubm91bmNlKFwiMjEhXCIpO1xuICB9IGVsc2UgaWYgKGdhbWUucGxheWVyVG90YWwgPiAyMSkge1xuICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGJ1c3RzXCIpO1xuICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICBzY29yZSAtPSAxO1xuICAgIGFubm91bmNlKFwiQlVTVFwiKTtcbiAgfVxuXG4gIGdhbWUud2lubmVyICYmIGdhbWVFbmQoKTtcbn1cblxuZnVuY3Rpb24gZ2FtZUVuZCgpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcInBsYXllclwiKSB7XG4gICAgYmFuayArPSAoZ2FtZS53YWdlciAqIDIpO1xuICAgIGNvbnNvbGUubG9nKFwiZ2l2aW5nIHBsYXllciBcIiArIChnYW1lLndhZ2VyICogMikpO1xuICB9IGVsc2UgaWYgKGdhbWUud2lubmVyID09PSBcInB1c2hcIikge1xuICAgIGJhbmsgKz0gZ2FtZS53YWdlcjtcbiAgICBjb25zb2xlLmxvZyhcImdpdmluZyBwbGF5ZXIgXCIgKyBnYW1lLndhZ2VyKTtcbiAgfVxuICAkYmFuay50ZXh0KFwiQmFuazogXCIgKyBiYW5rKTtcbiAgZmxpcENhcmQoKTtcbiAgdXBkYXRlU2NvcmUoKTtcbiAgJGRlYWxlclRvdGFsLnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuICAkYmV0LmF0dHIoXCJpZFwiLCBcImJldC1oaWRkZW5cIik7XG4gICRuZXdHYW1lLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRoaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyVGFibGUoKSB7XG4gICRkZWFsZXIuZW1wdHkoKTtcbiAgJHBsYXllci5lbXB0eSgpO1xuICAkZGVhbGVyVG90YWwuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRwbGF5ZXJUb3RhbC5lbXB0eSgpO1xuICAkYW5ub3VuY2UucmVtb3ZlQ2xhc3MoXCJ3aW4gbG9zZSBwdXNoXCIpO1xuICBjb25zb2xlLmxvZyhcIi0tdGFibGUgY2xlYXJlZC0tXCIpO1xufVxuXG5mdW5jdGlvbiBjYXJkSW1hZ2UoZGF0YSkge1xuICB2YXIgY2FyZFZhbHVlID0gZGF0YS5jYXJkc1swXS52YWx1ZTtcbiAgdmFyIGNhcmRTdWl0ID0gZGF0YS5jYXJkc1swXS5zdWl0O1xuICB2YXIgZmlsZW5hbWUgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGNhcmRWYWx1ZSArIFwiX29mX1wiICsgY2FyZFN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICByZXR1cm4gZmlsZW5hbWU7XG59XG5cbmZ1bmN0aW9uIGFubm91bmNlKHRleHQpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcImRlYWxlclwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwibG9zZVwiKTtcbiAgICBsb3NlV2F2LmxvYWQoKTtcbiAgICBsb3NlV2F2LnBsYXkoKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwbGF5ZXJcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcIndpblwiKTtcbiAgICB3aW5XYXYubG9hZCgpO1xuICAgIHdpbldhdi5wbGF5KCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicHVzaFwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwicHVzaFwiKTtcbiAgfVxuICAkYW5ub3VuY2VUZXh0LnRleHQodGV4dCk7XG59XG5cbmZ1bmN0aW9uIGZsaXBDYXJkKCkge1xuICB2YXIgJGZsaXBwZWQgPSAkKFwiLmRlYWxlciAuY2FyZEltYWdlXCIpLmZpcnN0KCk7XG4gICRmbGlwcGVkLmF0dHIoXCJzcmNcIiwgZ2FtZS5oaWRkZW5DYXJkKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU2NvcmUoKSB7XG4gICRzY29yZS5lbXB0eSgpO1xuICAkc2NvcmUuYXBwZW5kKFwiPHA+U2NvcmU6IFwiICsgc2NvcmUgKyBcIjwvcD5cIik7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvdW50KGNhcmQpIHtcbiAgaWYgKGlzTmFOKE51bWJlcihjYXJkKSkgfHwgY2FyZCA9PT0gXCIxMFwiKSB7XG4gICAgY291bnQgLT0gMTtcbiAgfSBlbHNlIGlmIChjYXJkIDwgNykge1xuICAgIGNvdW50ICs9IDE7XG4gIH1cbiAgJGNvdW50LmVtcHR5KCk7XG4gICRjb3VudC5hcHBlbmQoXCI8cD5Db3VudDogXCIgKyBjb3VudCArIFwiPC9wPlwiKTtcbn1cblxuZnVuY3Rpb24gYmV0KGFtdCkge1xuICBnYW1lLndhZ2VyICs9IGFtdDtcbiAgYmFuayAtPSBhbXQ7XG4gICRiYW5rLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuICAkKFwiLmN1cnJlbnRXYWdlclwiKS50ZXh0KFwiQ3VycmVudCBXYWdlcjogXCIgKyBnYW1lLndhZ2VyKTtcbiAgY29uc29sZS5sb2coXCJiZXR0aW5nIFwiICsgYW10KTtcbiAgY29uc29sZS5sb2coXCJ3YWdlciBhdCBcIiArIGdhbWUud2FnZXIpO1xufVxuXG4vLyBKU09OIHJlcXVlc3QgZnVuY3Rpb24gd2l0aCBKU09OUCBwcm94eVxuZnVuY3Rpb24gZ2V0SlNPTih1cmwsIGNiKSB7XG4gIHZhciBKU09OUF9QUk9YWSA9ICdodHRwczovL2pzb25wLmFmZWxkLm1lLz91cmw9JztcbiAgLy8gVEhJUyBXSUxMIEFERCBUSEUgQ1JPU1MgT1JJR0lOIEhFQURFUlNcbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCBKU09OUF9QUk9YWSArIHVybCk7XG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgY2IoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYihKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgfVxuICB9O1xuICByZXF1ZXN0LnNlbmQoKTtcbn1cbiJdfQ==