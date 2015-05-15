var API = "http://deckofcardsapi.com/api/";

var deckId;

var $dealCards = $(".dealCards"),
  $hit = $(".hit"),
  $stay = $(".stay"),
  dealerHand = [],
  playerHand = [],
  $dealerCard = $(".dealerCard"),
  $playerCard = $(".playerCard");


var $dealer = $(".dealer");
var $player = $(".player");


$dealCards.click(deal);

//$hit.click(hit);

$dealerCard.click(dealerCard);
$playerCard.click(playerCard);

function dealerCard(){
  var cardURL = API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function(data) {
    var html = "<img class='cardImage' src='" + data.cards[0].image + "'>";
    $dealer.append(html);
    dealerHand.push(convertCard(data.cards[0].value));
  });
}

function playerCard(){
  var cardURL = API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function(data) {
    var html = "<img class='cardImage' src='" + data.cards[0].image + "'>";
    $player.append(html);
    playerHand.push(convertCard(data.cards[0].value));
  });
}

function convertCard(value) {
  if (value === "ACE") {
    return 1;
  } else if (isNaN(value)) {
    return 10;
  } else {
    return value;
  }
}

function deal() {
  var shuffleURL = API + "shuffle/?deck_count=6";
  console.log("shuffleURL = " + shuffleURL);
  getJSON(shuffleURL, function(data) {
    deckId = data.deck_id;
    console.log(deckId);
    dealerCard();
    playerCard();
    dealerCard();
    playerCard();
  });
  $( ".cardImage" )
  .attr( "id", function( arr ) {
    return "div-id" + arr;
  });
}

// commented out until i figure out passing event handlers functions with arguments
//function card(person){
  //var cardURL = API + "/draw/" + deckId + "/?count=1";
  //var $person = ( person === 'dealer' ) ? $('.dealer') : $('.player');

  //getJSON(cardURL, function(data) {
    //var html = "<img class='cardImage' src='" + data.cards[0].image + "'>";
    //$person.append(html);
    //[person].push(data.cards[0].value);
  //});
//}

// Scott's cross-origin fix
function getJSON(url, cb) {
  var JSONP_PROXY = 'https://jsonp.afeld.me/?url='
  // THIS WILL ADD THE CROSS ORIGIN HEADERS
  var request = new XMLHttpRequest();
  request.open('GET', JSONP_PROXY + url);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      cb(JSON.parse(request.responseText));
    }
  };
  request.send();
}


//function sixDecks() {
  //var shuffleURL = API + "shuffle/?deck_count=6";
  //console.log("shuffleURL = " + shuffleURL);
  //getJSON(shuffleURL, function(data) {
    //deckId = data.deck_id;
    //console.log(deckId);
  //});
//};

//function dealFour() {
  //var draw4URL = API + "draw/" + deckId + "/?count=4";
  //console.log("draw4URL = " + draw4URL);
  //getJSON(draw4URL, function(data) {
    //$dealer1.attr("src", "http://behance.vo.llnwd.net/profiles/56117/projects/5740089/e86ace60c0d4931bd3a89abe50b4d267.jpg");
    //$player1.attr("src", data.cards[1].image);
    //$dealer2.attr("src", data.cards[2].image);
    //$player2.attr("src", data.cards[3].image);
    //dealerHand.push(data.cards[0].value + " " + data.cards[0].suit);
    //playerHand.push(data.cards[1].value + " " + data.cards[1].suit);
    //dealerHand.push(data.cards[2].value + " " + data.cards[2].suit);
    //playerHand.push(data.cards[3].value + " " + data.cards[3].suit);
  //});
//}

//function hit() {
  //var hitURL = API + "/draw/" + deckId + "/?count=2";
  //getJSON(hitURL, function(data) {
    ////var playerHtml = "  ("src", data.cards[0].image);
    //$dealer3.attr("src", data.cards[1].image);
    //playerHand.push(data.cards[0].value + " " + data.cards[0].suit);
    //dealerHand.push(data.cards[1].value + " " + data.cards[1].suit);
  //});
//}

