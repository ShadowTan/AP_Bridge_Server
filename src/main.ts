//Entry file for the Bridge program

//Library imports


import express from "express";


//App imports
import { Player, functions, game } from "./game";


let currentGames: {[key: string]: game} = {};


const app = express();
const PORT = 3000;
app.use(express.json());

app.get('/', async (req, res) => {



    const response = {
        "type": "info",
        "message": "Please use another command"
    }
    
    res.send(JSON.stringify(response))
})


app.get('/game', async function(request, response) {
    switch(request.body.type){
        case "info":
            {
                if(request.body.game_id){
                    const currentGame: any = await currentGames[request.body.game_id].info();
                    const res: any = {
                        "type": "success",
                        "info": currentGame
                    }
                    response.send(JSON.stringify(res))
                    break;
                }
                console.log("hi")
            }

        default:
            {
                const res: any = {
                    "type": "unknown"
                }
                response.send(JSON.stringify(res))
                break;
            }
    }
})


/**
 * Main point for access
 */
app.post('/game', async function(request, response) {
    console.log(request.body.type)
    // const test: JSON = JSON.parse(req.body);
    // console.log(test);
    switch(request.body.type){
        case "new_game": {
            let testMode: boolean = false;
            if (request.body.test_mode === "true") {
                testMode = true;
            }

            //Game generation code
            const player: Player = {
                id: await functions.generatePlayerID(testMode),
            }
            const Game = new game(player, testMode);
            currentGames[Game.id] = Game;

            const res: any = {
                "type": "success",
                "game_id": Game.id
            }
            response.send(JSON.stringify(res))
            break;
        }


        case "ready": {
            if(!request.body.game_id){
                const res: any = {
                    "type": "missing \"game_id\""
                }
                response.send(JSON.stringify(res))
                break;
            }
            const currentGame: any = currentGames[request.body.game_id];
            const res = await currentGame.ready();
            response.send(JSON.stringify(res))
            break;
        }

        
        case "bid": {

            if(!request.body.bid || !request.body.game_id){
                const res: any = {
                    "type": "missing \"bid\" or \"game_id\""
                }
                response.send(JSON.stringify(res))
                break;
            }
            
            const currentGame: any = currentGames[request.body.game_id];

            const res: JSON = await currentGame.do_bidding(request.body.bid, request.body.player);
            response.send(JSON.stringify(res))
            break;
        }

        default: {
            const res: any = {
                "type": "failed"
            }
            response.send(JSON.stringify(res))
            break;
    }
    }
})

 app.listen(PORT, () => {
     console.log('Server is running')
 })