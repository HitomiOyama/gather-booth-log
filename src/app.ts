import {Game, GameMap} from "@gathertown/gather-game-client";
import {SPACE_ID, API_KEY} from "./config";

globalThis.WebSocket = require("isomorphic-ws");

const game = new Game(undefined, () => Promise.resolve({apiKey: API_KEY}));
game.init(SPACE_ID);
game.connect();
console.log('あああああ');
console.log('test');
console.log("world");

game.subscribeToConnection(
    (connected) => {
        console.log("is connected:", connected);
        game.subscribeToEvent("error", console.info);
        game.subscribeToEvent("warn", console.warn);
        game.subscribeToEvent("error", console.error);
    }
)

const atRoomEntrance: string[] = []
const inRoomX: string[] = []

console.log(atRoomEntrance)
console.log(inRoomX)

game.subscribeToEvent('playerMoves', () => {
    const playerIds = Object.keys(game.players)

    const playersPosInfo:{[id: string]: string} = {}

    for(const playerId of playerIds) {
        const player = game.players[playerId]
        if(player.x >= 53 && player.x <=58 && player.y >=17 && player.y <=23) {
            playersPosInfo[playerId] = "roomX"
        }
     
        console.log("x:" + player.x + " y:" + player.y)
        const conditions1 = (player.x === 55 || player.x === 56)

        if(conditions1 && player.y === 24) {
           playersPosInfo[playerId] = "roomXEntrance"

           console.log(playersPosInfo)

        // 入室
        } else if(conditions1 && player.y === 23) {
            playersPosInfo[playerId] = "inRoomX"

            console.log(playersPosInfo)

        // 退室
        } else if (conditions1 && player.y === 25) {
            playersPosInfo[playerId] = "outside"

            console.log(playersPosInfo)
        }
    }


})


