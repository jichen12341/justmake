var gCardImages = [];
var gWindowHeight = window.innerHeight;
var gWindowWidth = window.innerWidth;
var gCardHeight;
var gCardWidth;

init_layout();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function init_layout()
{
    // load playing cards
    for (var i = 0; i < MAX_CARDS; i++)
    {
        var img = new Image();
        img.src = "images/" + i + ".jpg";
        img.tag = i;
        img.onclick = play_card;
        //img.style = 'height: 100%; width: 100%;';// object-fit: contain';
        gCardImages.push(img);
    }
    gCardHeight = gCardImages[0].height;
    gCardWidth = gCardImages[0].width;

    // Adjust size of each table
    document.getElementById('table1').style.height = Math.floor(gWindowHeight / 6) + "px";
    document.getElementById('table2').style.height = Math.floor(2 * gWindowHeight / 6) + "px";
    document.getElementById('table3').style.height = Math.floor(gWindowHeight / 6) + "px";
    document.getElementById('table4').style.height = Math.floor(gWindowHeight / 6) + "px";
    
    // Adjust Desk card position
    var table = document.getElementById('table2');
    var width = table.rows[0].cells[1].offsetWidth;
    var height = table.rows[0].cells[1].offsetHeight;
    
    var x, y;
    x = width/2;
    y = height/2;
    document.getElementById('deskPanel0').style.transform = "translate(" + x + "px, " + y + "px)";
    
    x = (width/2 - gCardWidth*2);
    y = (height/2 - gCardHeight/2);
    document.getElementById('deskPanel1').style.transform = "translate(" + x + "px, " + y + "px)";
    
    x = (width/2 - gCardWidth*2);
    y = (height/2 - gCardHeight);
    document.getElementById('deskPanel2').style.transform = "translate(" + x + "px, " + y + "px)";  
    
    x = (width/2 - gCardWidth*2);
    y = (height/2 - gCardHeight/2 );
    document.getElementById('deskPanel3').style.transform = "translate(" + x + "px, " + y + "px)";
    
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        var deskPanel = document.getElementById('deskPanel' + i);
        deskPanel.style.width = gCardWidth + "px";
        deskPanel.style.height = gCardHeight + "px";
        deskPanel.style.border = "1px solid #666";               
    }
}

function display_playernames(playerNames)
{
    //console.log(playerNames);
    for (var i = 0; i < MAX_PLAYERS; i++)
    {        
        var index = (i + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS;
        
        if (playerNames[i].length > 0)            
        {            
            //console.log(i + " " + gPlayerNo + " " + index);
            var title = (i == gPlayerNo) ? "你: " : "玩家: ";
            document.getElementById('lblPlayerName' + index).innerHTML = title + playerNames[i];
        }
        else
            document.getElementById('lblPlayerName' + index).innerHTML = "";
    }
}

// 顯示所有人的叫牌墩數
function display_bid_label(bid)
{
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        var index = (i + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS;        
        document.getElementById('lblBid' + index).innerHTML = "叫 " + bid[i] + " 墩";
    }
}
    
function display_hand_cards(cards)
{/*
    var index = 0;
    for (var i = 0; i < cards.length; i++)
    {   
        if (cards[i] >= 0)
        {
            var handCardsPanel = document.getElementById('handCardsPanel' + index);
            handCardsPanel.innerHTML = "";
            handCardsPanel.appendChild(gCardImages[cards[i]]);
            index++;
        }        
    }*/
    
    var index = 0;
    
    for (var i = 0; i < cards.length; i++)
    {   
        if (cards[i] >= 0)
        {                        
            var cHandCardsPanel = document.getElementById('cHandCardsPanel' + index);
            cHandCardsPanel.innerHTML = "";
            cHandCardsPanel.appendChild(gCardImages[cards[i]]);
            
            var handCardsPanel = document.getElementById('handCardsPanel' + index);
            handCardsPanel.style = "transform: translate(" + (-3 * index) + "em, 0em);"
            index++;           
        }        
    }
}

function display_bid_panel()
{
    var bidPanel = document.getElementById("bidPanel");
        
    for (var i = 0; i <= 13; i++)
    {
        var btn = document.createElement("button");
        btn.innerHTML = i;
        btn.style.width = '50px';
        btn.style.height = '50px';
        btn.onclick = bid;
        bidPanel.appendChild(btn);
    }
}

function display_eat_label()
{           
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        var index = (i + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS;        
        document.getElementById('lblEat' + index).innerHTML = "吃 " + gEat[i] + " 墩";
    }   
}

// 顯示玩家的排到牌桌上
function display_desk_card(playerNo, card)
{   
    //console.log(playerNo + " " + card);
    var index = (playerNo + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS;
    
    var deskPanel = document.getElementById("deskPanel" + index);
    deskPanel.innerHTML = "";
    deskPanel.appendChild(gCardImages[card]);
}

// 顯示該玩家吃到這墩
async function display_eat(playerNo)
{
    gState = STATE_ANIME_EAT;    
    playerNo = (playerNo + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS; 
    
    await sleep(2000);
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        var deskPanel = document.getElementById("deskPanel" + i);
        if (i == playerNo) continue;
        deskPanel.innerHTML = "";
        await sleep(1000);
    }
    
    var deskPanel = document.getElementById("deskPanel" + playerNo);
    deskPanel.innerHTML = "";
    
    display_eat_label();   
   
    
    // 告知伺服器已完成一墩
    console.log("finish turn");
    gSocket.emit('finish turn', gPlayerNo);     
}

function display_message(msg)
{
    //var lblMessage = document.getElementById("lblMessage");
    //lblMessage.innerHTML = msg;
}

function display_your_turn(enable)
{    
    /*var playerPanel = document.getElementById("playerPanel0");
    if (enable)
        playerPanel.classList.add("yourturn");
    else
        playerPanel.classList.remove("yourturn");*/
}

function display_score(score)
{
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        var index = (i + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS;
        
        var lblScore = document.getElementById("lblScore" + index);
        lblScore.innerHTML = gScoreOld[i] + " --> " + gScore[i];
    }
}