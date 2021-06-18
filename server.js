const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

var gPlayerNameList = ["", "", "", ""];
var gGameStarted = false;
var gReady = [1, 1, 1, 1];
var gHandCardLeft;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/*.*', (req, res) => {
    console.log(req.url);
    res.sendFile(__dirname + req.url);
});  

io.on('connection', (socket) => {
    socket.on('join game', name => {
        console.log(name + ' joined');
        
        socket.nickname = name;
        for (var i = 0; i < gPlayerNameList.length; i++)
        {
            if (gPlayerNameList[i] == "")
            {
                gPlayerNameList[i] = name;
                break;
            }
        }        
        io.emit('get player names', gPlayerNameList);        
    });
            
    socket.on('start game', () => {
        console.log('start game');
        start_game();
        io.emit('deal cards', gCards);
    });
    
    socket.on('bid', (playerNo, hands) => {
        console.log(socket.nickname + ' ' + playerNo + ': bid ' + hands);
        gGuessHands[playerNo] = hands;
        
        for (var i = 0; i < MAX_PLAYERS; i++)
        {
            if (gGuessHands[i] == -1)
                return;
        }
        
        io.emit('get bid', gGuessHands);   
    });
       
    // 已完成一墩
    socket.on('finish turn', (playerNo) => {
        console.log("finish turn playerNo/gHandCardLeft=" + playerNo + " " + gHandCardLeft);
        gReady[playerNo] = 1;
        for (var i = 0; i < MAX_PLAYERS; i++)       
        {
            if (gReady[i] == 0)
                return;
        }
        
        gHandCardLeft--;
        if (gHandCardLeft == 0)
        {
            // 已完成一局
            console.log("finish a game");
            return;
        }
        //io.emit('next turn');
        
        // 看看是否換電腦出牌
        while (true)
        {                        
            if (gPlayerNameList[gTurn].length > 0)
                break;
                
            card = ai_play_card(gTurn);
            gDeskCards[gTurn] = card;
            io.emit('play a card', gTurn, card);  

            gTurn = (gTurn + 1) % MAX_PLAYERS;
        }        
    });
    
    // 玩家出了一張牌
    socket.on('play a card', (playerNo, card) => {
        console.log(socket.nickname + ' ' + playerNo + ': play a card ' + card);
        gDeskCards[playerNo] = card;
        io.emit('play a card', playerNo, card);   
        gReady[playerNo] = 0;
        
        // 看看是否換電腦出牌
        while (true)
        {
            gTurn = (gTurn + 1) % MAX_PLAYERS;

            // 四個人都出牌了，看誰吃這墩
            if (gTurn == gFirstPlayerNo)
            {
                gTurn = proc_desk_card();
                gFirstPlayerNo = gTurn;
                break;
            }
            console.log(gTurn + " " + gFirstPlayerNo);
            
            if (gPlayerNameList[gTurn].length > 0)
                break;
                
            card = ai_play_card(gTurn);
            gDeskCards[gTurn] = card;
            io.emit('play a card', gTurn, card);            
        }
    });
    
    socket.on('disconnect', () => {   
        console.log(socket.nickname + ' disconnected');
        var name = socket.nickname;
        for (var i = 0; i < gPlayerNameList.length; i++)
        {
            if (name == gPlayerNameList[i])
                gPlayerNameList[i] = "";
        }
        io.emit('get player names', gPlayerNameList);        
    });
});


http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});


//////////////////////  game related //////////////////
const MAX_CARDS = 52;
const MAX_PLAYERS = 4;

var gCards = [];
var gTurn = 0;
var gFirstPlayerNo = 0;
var gGuessHands = [-1, -1, -1, -1];
var gDeskCards = [-1, -1, -1, -1];
var gCardSuit = ['S', 'H', 'D', 'C'];
var gTrump = 0;

for (var i = 0; i < MAX_CARDS; i++)
    gCards.push(i); 
    
function start_game()
{
    gGameStarted = true;
   
    gFirstPlayerNo = gTurn;
       
    for (var i = 0; i < MAX_PLAYERS; i++)       
        gGuessHands[i] = -1;
    
    for (var i = 0; i < MAX_PLAYERS; i++)
    {        
        if (gPlayerNameList[i] == "")
        {
            gGuessHands[i] = ai_guess_hands(i);
        }
    }
    
    for (var i = 0; i < MAX_CARDS; i++)
        gCards[i] = i;
    shuffle_cards();
    gHandCardLeft = MAX_CARDS / MAX_PLAYERS;
    console.log(gCards.toString());    
}

function get_random(x){
    return Math.floor(Math.random()*x);
};

function shuffle_cards()
{
   for (var i = 0; i < MAX_CARDS; i++)
   {
       var a = get_random(MAX_CARDS);
       var b = get_random(MAX_CARDS);
       var tmp = gCards[a];
       gCards[a] = gCards[b];
       gCards[b] = tmp;       
   }
}

////////////////////////////////////////////////////////
function ai_guess_hands(playerNo)
{
    return get_random(13);
}

function ai_play_card(playerNo)
{
    for (var i = playerNo * 13; i < playerNo * 13 + 13; i++)
    {
        if (gCards[i] == -1) continue;
        if (ai_validate_card(playerNo, gCards[i]))
        {
            var card = gCards[i];
            gCards[i] = -1;
            return card;
        }
    }
}

function ai_validate_card(playerNo, card)
{    
    // 第一人可以任出一張牌
    if (gTurn == gFirstPlayerNo)
        return true;
    
    // 該牌與第一人出的花色相同
    if (get_card_suit(card) == get_card_suit(gDeskCards[gFirstPlayerNo]))
        return true;
    
    // 檢查手上牌是否還有與第一人出的花色相同
    for (var i = playerNo * 13; i < playerNo * 13 + 13; i++)
    {
        if (gCards[i] == -1) continue;
        if (gCards[i] == card) continue;
        //console.log(i + " " + gCards[i] + " " + gFirstPlayerNo + " " + gDeskCards[gFirstPlayerNo]);
        if (get_card_suit(gCards[i]) == get_card_suit(gDeskCards[gFirstPlayerNo]))
            return false;
    }
    return true;  
}

// 四個人都出牌了，看誰吃這墩
function proc_desk_card()
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
///////////////////////////////////////////////////////