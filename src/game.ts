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
    public static validBidLetters: string[] = ["c", "d", "h", "s", "nc"]
    public static bidLetterWorth: {[key: string]: number} = {"c": 0, "d": 1, "h": 2, "s": 3, "nc": 4} 
    
    constructor(){
        //Empty
    }

    /**
     * Creates a standard 52 card deck
     * @returns string array with cards
     */
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

    /**
     * Shuffles the unshuffled deck using Fisher-Yates algorithm
     * @param unshuffledDeck - The unshuffled deck of cards
     * @returns The shuffled deck of cards
     */
    static async shuffleDeck(Deck: string[]): Promise <string[]>{
        for (let i = Deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [Deck[i], Deck[j]] = [Deck[j], Deck[i]];
        }
        
        return Deck;
    }

    /**
     * a hand calculator for bridge hand
     * @param hand string[] | your cards
     * @returns number | your hand worth
     */
    static async calculateHandValue(hand: string[]): Promise <number>{
        /*
        Med 16-18 poeng og en jevn hånd, skal spilleren åpne med 1NT

        Based on
        HCP (High card points):
            ace = 4, king = 3, queen = 2, Jack = 1 
        Distribution Points 
            0: 3, 1: 2, 2: 1
        */
        let handValue = 0;

        let suitDict: {[key: string]: number} = {}
        // let rankDict: {[key: string]: number} = {}
        for (let i: number = hand.length; i > 0; i--) {
            const card = hand[i];
            if (card) {
                const parts: string[] = card.split("_");
                suitDict[parts[0]] = (suitDict[parts[0]] || 0) + 1;

                //HCP
                switch(parts[1]){
                    case "Ace": {
                        handValue += 4
                        break;
                    }
                    case "King": {
                        handValue += 3
                        break;
                    }
                    case "Queen": {
                        handValue += 2
                        break;
                    }
                    case "Jack": {
                        handValue += 1
                        break;
                    }
                    
                }
                // rankDict[parts[1]] = (rankDict[parts[1]] || 0) + 1;
            }
        }

        //Distribution Points 
        for (let key in suitDict) {
            let value = suitDict[key]

            switch(value){
                case 0: {
                    handValue += 3
                }
                case 1: {
                    handValue += 2
                }
                case 2: {
                    handValue += 1
                }
                
            }
        }
        console.log(handValue)
        return handValue
    }

    /**
     * @param testMode whether game is in testMode
     * @returns a string with a unique player id
     */
    static async generatePlayerID(testMode: boolean = false): Promise <string>{
        if (testMode){
            return "abc"
        } else {
        return `player_${new Date().getTime()}`
        }
    }

    /**
     * @param oldBid the current highest bid
     * @param bid the new bid
     * @returns a string (empty if bid is valid) else it returns a reason why the bid is invalid)
     */
    static async ValidBid(oldBid: string, bid: string): Promise <string> {
        
        //if skip
        if (bid === "skip"){
            return "skip";
        }
        
        //defining variables for new bid and current bid
        const bidNumber: number = parseInt(bid.slice(0))
        const bidLetters: string = bid.slice(1, bid.length)

        const curNumber: number = parseInt((oldBid).substring(0));
        const curLetters: string = (oldBid).slice(1, (oldBid).length)
        console.log(bidNumber+ ", " + bidLetters)
        

        //if bid is NaN
        if(isNaN(bidNumber)){
            return "missing number"
        }

        // You can't ever bid higher than 7
        if (bidNumber > 7){
            return "can't bid higher than 7"
        }

        //Bid letters aren't valid
        if (!functions.validBidLetters.includes(bidLetters.toLowerCase())){
            return "bid letter is not valid";
        }

        //checks that bid amount and or letter has increased
        if(functions.bidLetterWorth[bidLetters] <= functions.bidLetterWorth[curLetters] && bidNumber <= curNumber){
            if(functions.bidLetterWorth[bidLetters] <= functions.bidLetterWorth[curLetters] && bidNumber <= curNumber){
                return "bid letter and bid number are less than current"
            } else if (functions.bidLetterWorth[bidLetters] <= functions.bidLetterWorth[curLetters]) {
                return "bid letter is less than current"
            } else {
                return "bid number is less than current"
            }
        }
        
        return "";
    }
}


class Bot{
    hand: string[];

    constructor(){
        this.hand = [];
    }

    /**
     * 
     * @param deck string[] | a hand of cards
     * @returns string successful/failed
     */
    public async setDeck(deck: string[]):Promise <string>{
        /**
         * @param deck receives a hand of cards, and assigns them to the Bot
         */
        try{
            this.hand = deck;
        } catch (error){
            console.log(error)
            return "failed"
        }
        return "successful"
    }

    /**
     * 
     * @returns bot's hand
     */
    public async getHand(): Promise<string[]>{

        return this.hand;
    }

}


export class game{
    id: string;
    testMode: boolean;
    deck: string[];
    
    //Bidding
    bid: string;
    bidding_active: boolean;
    bidskips: number;
    trump_suit: string;

    //Player Handling
    playerDict: {[key: string]: any};
    playerList: string[];
    currentPlayerNumber: number;

    currentPlayer: any;

    constructor(player: Player, testMode: boolean = false){
        this.id = player.id;
        this.deck = [];

        this.bidding_active = true;
        this.bid = "";
        this.bidskips = 0;
        this.trump_suit = "nc";

        this.testMode = testMode;

        this.playerList = ["north", "west", "south", "east"];
        this.playerDict = {
            "north": player, 
            "west": new Bot(), 
            "south": new Bot(), 
            "east": new Bot()
        }

        this.currentPlayerNumber = Math.round(Math.random() * 4);
        this.currentPlayer = this.playerDict[this.playerList[this.currentPlayerNumber]];
    }

    private async nextPlayer(): Promise <string> {
        this.currentPlayerNumber = (this.currentPlayerNumber + 1) % 4
        const cur = this.playerList[this.currentPlayerNumber]
        this.currentPlayer = this.playerDict[cur]
        return cur
    }

    /**
     * Only works if testMode is active
     * @returns every player's hand
     */
    public async info(): Promise <JSON>{
        if(!this.testMode){
            const message: any = {
                "error": "You're not allowed to see info in a non-test game"
            }
            return message
        }

        let message: any = {
            "id": this.id,
            "bid": this.bid,
        }
        if(this.playerDict["north"].hand){
            message["decks"] = {
                "north_deck": this.playerDict["north"].hand,
                "south_deck": await this.playerDict["south"].getHand(),
                "west_deck": await this.playerDict["west"].getHand(),
                "east_deck": await this.playerDict["east"].getHand(),
            } 
        } else {
            message["decks"] = {  
                "error": "No hands have been dealt yet"
            } 
        }
        return message
    }

    /**
     * Function to start dealing out hands after all players are ready (currently only for 1 player)
     * @returns Promise <JSON> with player info
     */
    public async ready(): Promise<JSON>{
        console.log("All players ready, dealing cards");
        let deck = await functions.createDeck();
        deck = await functions.shuffleDeck(deck);

        this.playerDict["north"].hand = deck.slice(0, 13);
        this.playerDict["south"].setDeck(deck.slice(13, 26));
        this.playerDict["west"].setDeck(deck.slice(26, 39));
        this.playerDict["east"].setDeck(deck.slice(39, 52));

        const response: any = {
            "playerHand": this.playerDict["north"].hand,
            "handValue": await functions.calculateHandValue(this.playerDict["north"].hand),
            "turn": this.playerList[this.currentPlayerNumber],
        }
        return response;
    }


    /**
     * Bidding functionality
     * @param bet new bet
     * @param player current player, automatically north
     * @returns json with information
     */
    public async do_bidding(bid: string, player: string = "north"): Promise <JSON>{
        if(!this.bidding_active){
            const response: any = {
                "type": "bidding is inactive",
                "playing_bid": this.bid,
            }
            return response
        }
        
        if(!(this.playerList[this.currentPlayerNumber] === player)){
            const response: any = {
                "type": "wrong_player",
                "text": `entered ${player} but it's ${this.playerList[this.currentPlayerNumber]} turn`,
                "current_bid": this.bid,
            }
            return response
        }
        const bid_text: string = await functions.ValidBid(this.bid, bid);
        if(this.testMode){
                if(bid_text === "skip"){
                    this.bidskips += 1
                    this.nextPlayer()
                    if(this.bidskips === 3){
                        this.bidding_active = false;
                        //TODO add Dummy logic
                        //TODO set trump suit
                        //TODO person to the left of winning bid starts
                        //TODO if 4 people skip, with no bid, redeal the cards

                        const response: any = {
                            "type": "bidding_won",
                            "winning_bid": this.bid,
                            "turn": this.playerList[this.currentPlayerNumber]
                        }
                        return response
                    }

                    const response: any = {
                        "type": "player_skip",
                        "description": `${player} has skipped`,
                        "turn": this.playerList[this.currentPlayerNumber]
                    }
                    return response;
                }

                if(bid_text){
                    const response: any = {
                        "type": "failed_bid",
                        "description": bid_text,
                        "current_bid": this.bid,
                        "turn": this.playerList[this.currentPlayerNumber]
                    }
                    return response

                }
                else{
                    this.bid = bid;
                    this.bidskips = 0;
                    this.nextPlayer();
                    
                    const response: any = {
                        "type": "bet_success",
                        "current_bid": this.bid,
                        "turn": this.playerList[this.currentPlayerNumber]
                    }
                    return response
                }
            } 
            // else {
            //     if(await functions.isValidBid(this.bet, bet)){
            //          //botBetting(); #TODO 
            //     }
            // }

        const response: any = {
            "type": "failed_bid",
            "current_bid": this.bid,
            "turn": this.playerList[this.currentPlayerNumber]
        }
        return response
    }
}