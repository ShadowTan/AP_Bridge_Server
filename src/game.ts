//All game logic will be collected here

//Interfaces
interface Bot{
    deck: string[];
}

export interface Player{
    id: string;
    hand?: string[];
}



export class functions{
    static SuitOrder = ["nc", "spades", "hearts", "diamonds", "clubs"]
    
    constructor(){
        //Empty
    }

    static async createDeck(): Promise <string[]>{
        /** 
        * @returns a list with a standard deck of cards
        */
        
        const suits: string[] = ["Spades", "Hearts", "Diamonds", "Clubs"];
        const ranks: string[] = ["Ace", "King", "Queen", "Jack", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

        let deck: string[] = []
        suits.forEach(suit => {
            for(let i = 0; i < ranks.length; i++){
                deck.push(`${suit}_${ranks[i]}`);
            }
        });

        return deck;
    }


    static async shuffleDeck(Deck: string[]): Promise <string[]>{
        /**
         * Shuffles the unshuffled deck using Fisher-Yates algorithm
         * @param unshuffledDeck - The unshuffled deck of cards
         * @returns The shuffled deck of cards
         */
        
        for (let i = Deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [Deck[i], Deck[j]] = [Deck[j], Deck[i]];
        }
        
        return Deck;
    }

    static async generatePlayerID(testMode: boolean = false): Promise <string>{
        if (testMode){
            return "abc"
        } else {
        return `player_${new Date().getTime()}`
        }
    }

    static async validBet(old_bet: string, bet: string): Promise <boolean>{
        /**
         * @param old_bet The current valid bet
         * @param bet New proposed bet
         * @returns boolean whether bet is legal
         */

        const existingBetAmount = old_bet.slice(0,1)
        const existingBetSuit = old_bet.slice(1).toLowerCase()
        const newBetAmount = bet.slice(0,1);
        const newBetSuit = bet.slice(1).toLowerCase();
   
        console.log("BetSuit", functions.SuitOrder.indexOf(existingBetSuit), ">", functions.SuitOrder.indexOf(newBetSuit),
            functions.SuitOrder.indexOf(existingBetSuit) > functions.SuitOrder.indexOf(newBetSuit))
        console.log("BetRank", newBetAmount, ">", existingBetAmount,
            newBetAmount > existingBetAmount)
        if(newBetAmount > existingBetAmount && functions.SuitOrder.indexOf(existingBetSuit) > functions.SuitOrder.indexOf(newBetSuit))
            {
            return false
        }

        return true

    }
}

class Bot{
    hand: string[];

    constructor(){
        this.hand = [];
    }

    public async setDeck(deck: string[]):Promise <string>{
        /**
         * @param deck receives a hand of cards, and assigns them to the Bot
         */
        try{
            this.hand = deck;
        } catch (error){
            console.log(error)
        }
        return "successful"
    }

    public async getHand(): Promise<string[]>{
        /**
         * @returns current deck
         */

        return this.hand;
    }

}


export class game{
    id: string;
    testMode: boolean;
    deck: string[];
    bet: string;

    playerDict: {[key: string]: any};
    playerList: string[];
    currentPlayerNumber: number;

    currentPlayer: any;

    constructor(player: Player, testMode: boolean = false){
        this.id = player.id;
        this.deck = [];
        this.bet = "";

        this.testMode = testMode;

        this.playerList = ["north", "west", "south", "east"];
        this.currentPlayerNumber = Math.round(Math.random() * 4);
        this.playerDict = {
            "north": player, 
            "west": new Bot(), 
            "south": new Bot(), 
            "east": new Bot()
        }
        this.currentPlayer = this.playerDict[this.playerList[this.currentPlayerNumber]];

        if (this.testMode){
            //TODO make it so player 1 can control all players
        }
        else {
            //TODO create 3 other players (bots) 

        }
    }

    private async nextPlayer(): Promise <string> {
        this.currentPlayerNumber = (this.currentPlayerNumber + 1) % 4
        const cur = this.playerList[this.currentPlayerNumber]
        this.currentPlayer = this.playerDict[cur]
        return cur
    }

    public async info(): Promise <JSON>{
        const message: any = {
            "north_deck": this.playerDict["north"].hand,
            "south_deck": await this.playerDict["south"].getHand(),
            "west_deck": await this.playerDict["west"].getHand(),
            "east_deck": await this.playerDict["east"].getHand(),
        };

        return message
    }

    public async ready(): Promise<JSON>{
        console.log("All players ready, dealing cards");
        let deck = await functions.createDeck();
        deck = await functions.shuffleDeck(deck);

        this.playerDict["north"].hand = deck.slice(0, 13);
        this.playerDict["south"].setDeck(deck.slice(13, 26));
        this.playerDict["west"].setDeck(deck.slice(26, 39));
        this.playerDict["east"].setDeck(deck.slice(39, 52));

        console.log(this.playerDict["north"].id);
        console.log(await this.info());

        const response: any = {
            "playerHand": this.playerDict["north"].hand,
            "turn": this.playerList[this.currentPlayerNumber],
        }
        return response;
    }


    public async doBet(bet: string, player: string = "north"): Promise <JSON>{
        if(!this.bet && this.playerList[this.currentPlayerNumber] === player){
            this.bet = bet;
            this.nextPlayer();
                    
            const response: any = {
                "type": "bet",
                "current_bet": this.bet,
                "turn": this.playerList[this.currentPlayerNumber]
            }
            return response
        }
        
        if(this.testMode){
            if (this.playerList[this.currentPlayerNumber] === player){
                if(await functions.validBet(this.bet, bet)){
                    this.bet = bet;
                    this.nextPlayer();
                    
                    const response: any = {
                        "type": "bet",
                        "current_bet": this.bet,
                        "turn": this.playerList[this.currentPlayerNumber]
                    }
                    return response
                }
                else{
                    const response: any = {
                        "type": "failed_bet",
                        "current_bet": this.bet,
                        "turn": this.playerList[this.currentPlayerNumber]
                    }
                    return response

                }
            } else {
                if(await functions.validBet(this.bet, bet)){
                     //botBetting(); #TODO 
                }
            }
        }

        const response: any = {
            "type": "failed_bet",
            "current_bet": this.bet,
            "turn": this.playerList[this.currentPlayerNumber]
        }
        return response
    }
}