//Entry file for the Bridge program

//Library imports


import express from "express";


//App imports
import { Player, functions, game } from "./game";


let currentGames: {[key: string]: game} = {};


const app = express();
const PORT = 3000;

app.get('/', async (req, res) => {



    const response = {
        "type": "info",
        "message": "Please use another command"
    }
    
    res.send(JSON.stringify(response))
})

app.get('/start/:testmode', async(req, res) => {
    const testmode = req.params.testmode === "true";
    const player: Player = {
        id: await functions.generatePlayerID(testmode),
    }
    const Game = new game(player, testmode);
    currentGames[Game.id] = Game;
    
    console.log(currentGames);

    const response = {
        "type": "GameStart",
        "PlayerID": player.id,
        "message": "please ready up",
    }
    res.send(JSON.stringify(response));
})


app.get('/game/:key/info', async function(req, res) {
    const params = req.params.key;
    const currentGame: any = await currentGames[params].info();

    const response = {
        "type": "info",
        "message": currentGame
    }
    res.send(JSON.stringify(response));
})

app.get('/game/:key/ready', async function(req, res) {
    const gameKey = req.params.key;
    const currentGame: any = currentGames[gameKey];

    const gameInfo = await currentGame.ready();

    const response = {
        "type": "ready",
        "hand": gameInfo.playerHand,
        "turn": gameInfo.turn,
    }
    res.send(JSON.stringify(response));
});


app.get('/game/:key/bet/:bet-:player', async function(req, res){
    const gameKey = req.params.key;
    const player = req.params.player || "north";
    const bet = req.params.bet;

    const currentGame: any = currentGames[gameKey];

    const response = await currentGame.doBet(bet, player)
    res.send(response);
    
})

app.listen(PORT, () => {
    console.log('Server is running')
})






