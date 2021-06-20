// <ul id=xxx class=xxx> classList.add .remove
const MAX_PLAYERS = 4;
const MAX_CARDS = 52;
const MAX_CARD_SUIT = 5;
const MAX_HAND_CARDS = MAX_CARDS / MAX_PLAYERS;

const STATE_UNUSED = 0;
const STATE_CONNECTED = 1;
const STATE_BID = 2;
const STATE_MY_TURN = 3
const STATE_ANIME_EAT = 4;
const STATE_OTHER_TURN = 5;

var gState = STATE_UNUSED;
var gCardSuit = ['&spades;', '&hearts;', '&diams;', '&clubs;', '&empty;'];
var gCards = [];
var gPlayerName;
var gPlayerNameList = ["", "", "", ""];
var gPlayerNo; // 0, 1, 2 or 3
var gTurn = 0;
var gFirstPlayerNo = 0;
var gNextFirstPlayerNo = MAX_PLAYERS - 1;
var gBid = [0, 0, 0, 0];
var gEat = [0, 0, 0, 0];
var gDeskCards = ["", "", "", ""];
var gTrump = MAX_CARD_SUIT - 1;
var gScore = [0, 0, 0, 0];
var gScoreOld = [0, 0, 0, 0];
var gHandCardLeft;

for (var i = 0; i < MAX_CARDS / MAX_PLAYERS; i++)
    gCards.push(0);

function init()
{
    btnJoin = document.getElementById("btnJoin");
    btnJoin.disabled = false;
    
    init_layout();    
}

/*while !(document.readyState === 'complete') 
{
  // The page is fully loaded
  console.log("asdfasdf");
}*/

function abort_game(playerNo)
{
    console.log('abort_game', playerNo, gPlayerNameList[playerNo]);
    gPlayerNameList[playerNo] = "<font color='red'>此人離線</font>";
    display_playernames(gPlayerNameList);
    
    var table = document.getElementById("table4");
    table.style.display = 'none';
}

// 發牌
function deal_cards(cards)
{   
    gNextFirstPlayerNo = (gNextFirstPlayerNo + 1) % MAX_PLAYERS;
    gFirstPlayerNo = gNextFirstPlayerNo;
    gTurn = gFirstPlayerNo;
    gTrump = (gTrump + 1) % MAX_CARD_SUIT;
    
    gHandCardLeft = MAX_CARDS / MAX_PLAYERS;    
    
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        if (gPlayerNameList[i] == "")
            gPlayerNameList[i] = "電腦" + i;
        display_playernames(gPlayerNameList);
    }
    
    for (var i = 0; i < MAX_PLAYERS; i++)
        gEat[i] = 0;
    
    for (var i = 0; i < MAX_CARDS / MAX_PLAYERS; i++)
    {
        gCards[i] = cards[gPlayerNo * 13 + i];
    }
    
    gCards.sort(function(a,b) {
        suitA = Math.floor(a / 13);
        suitB = Math.floor(b / 13);
        valueA = a % 13;
        if (valueA == 0) 
            valueA = 13;
        valueB = b % 13;
        if (valueB == 0)
            valueB = 13;

        if (suitA == suitB)
            return valueA - valueB;
        
        return suitA - suitB;
    });    
    
    gState = STATE_BID;
    
    add_message(gCards);   // debug
    display_hand_cards(gCards);
    display_bid_panel();   
    display_trump();
    display_first_player_desk_card();
}

// 玩家叫牌
function bid()
{           
    var bidPanel = document.getElementById("bidPanel");
    bidPanel.style.display = 'none';
    console.log(this.innerHTML);
    bid = parseInt(this.innerHTML);
    
    for (var i = 0; i < MAX_PLAYERS; i++)
        gBid[i] = "等待其他人叫牌";
    gBid[gPlayerNo] = bid;
    display_bid_label(gBid);        
    
    console.log('emit bid');
    gSocket.emit('bid', gPlayerNo, bid);        
}

// 可以進行下一個turn
function start_a_new_turn()
{    
    console.log('start_a_new_turn', gHandCardLeft, gTurn, gPlayerNo);
    if (gTurn == gPlayerNo)
    {               
        /*gHandCardLeft--;
        if (gHandCardLeft == 0)
        {
            calculate_score();
            display_score(gScore);
            gState = STATE_BID;
        }
        else*/
        {
            gState = STATE_MY_TURN;
            display_your_turn(true);
            console.log("換你了");           
        }
    }         
        
    /*if (gTurn == gPlayerNo)
    {
        gState = STATE_MY_TURN;
        display_your_turn(true);
        console.log("換你了");
        
        var deskPanel = document.getElementById("deskPanel0");
        deskPanel.innerHTML = "請出牌";
        
        return;
    } */     
}

// 玩家出一張牌
function play_card()
{
    console.log(gState + " " + this.tag);
    if (gState == STATE_MY_TURN)
    {
        display_your_turn(false);
        
        var card = parseInt(this.tag);
        if (validate_card(card) == true)
        {
            gState = STATE_OTHER_TURN;
            
            
            var index = gCards.indexOf(card);
            gCards[index] = -1;
            display_hand_cards(gCards);
            //document.getElementById('msgDesk').innerHTML = gCards;
            
            console.log('emit play a card');
            gSocket.emit('play a card', gPlayerNo, card);            
        }
        else
            display_message("不可出此牌 " + card);               
    }
}

// 是否可以出這張牌
function validate_card(card)
{
    console.log(gCards);
    // 第一人可以任出一張牌
    if (gTurn == gFirstPlayerNo)
        return true;
    
    // 該牌與第一人出的花色相同
    if (get_card_suit(card) == get_card_suit(gDeskCards[gFirstPlayerNo]))
        return true;
    
    // 檢查手上牌是否還有與第一人出的花色相同
    for (var i = 0; i < 13; i++)
    {
        if (gCards[i] == -1) continue;
        if (gCards[i] == card) continue;        
        console.log(i + " " + gCards[i] + " " + gFirstPlayerNo + " " + gDeskCards[gFirstPlayerNo]);
        if (get_card_suit(gCards[i]) == get_card_suit(gDeskCards[gFirstPlayerNo]))
            return false;
    }
    return true;    
}

// 四個人都出牌了，看誰吃這墩
function get_next_first_player()
{
    card = gDeskCards[gFirstPlayerNo];
    turn = gFirstPlayerNo;
    
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        if (i == gFirstPlayerNo) continue;
        if (compare_card(card, gDeskCards[i]) < 0)
        {
            card = gDeskCards[i];
            turn = i;
        }
    }
    
    return turn;
}

// Returns: positive => card1 is bigger, 0 => even,  negative => card2 is bigger 
function compare_card(card1, card2)
{
    if (card1 == card2)
        return 0;
    if (card_is_trump(card1) && !card_is_trump(card2))
        return 1;
    if (!card_is_trump(card1) && card_is_trump(card2))
        return -1;
    if (get_card_suit(card1) != get_card_suit(card2))
        return 1;
    return get_card_value(card1) - get_card_value(card2);   
}

function get_card_value(card)
{
    value = card % 13;
    if (value == 0)
        value = 13; // Ace
    return value;
}

function get_card_suit(card)
{
    return Math.floor(card / 13);
}

function card_is_trump(card)
{
    if (get_card_suit(card) == gTrump)
        return true;
    return false;
}

function calculate_score()
{
    for (i = 0; i < MAX_PLAYERS; i++)
    {
        gScoreOld[i] = gScore[i];
        
        var eat = gEat[i];
        var bid = gBid[i];
        
        if (bid == 0)
        {
            if (eat == 0)
                gScore[i] += 7;
            else
                gScore[i] -= (7 + eat);
        }
        else if (eat == bid)
            gScore[i] += eat;
        else if (eat > bid)
            gScore[i] += (bid - (eat - bid));
        else
            gScore[i] -= (bid + (bid - eat));
    }
}
