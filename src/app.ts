import {Game, GameMap} from "@gathertown/gather-game-client";
import {SPACE_ID, API_KEY} from "./config";

globalThis.WebSocket = require("isomorphic-ws");

const game = new Game(undefined, () => Promise.resolve({apiKey: API_KEY}));
game.init(SPACE_ID);
game.connect();
console.log('test');
console.log("hello world");
function moveProgram(){
    const playerIds = Object.keys(game.players)

    const playersPosInfo:{[id: string]: string} = {}

    var now = new Date()
    var year = now.getFullYear()
    var month = now.getMonth()+1
    var date = now.getDate()
    var hour = now.getHours()
    var min = now.getMinutes()
    var sec = now.getSeconds()

    for(const playerId of playerIds) {
        const player = game.players[playerId]
        if(player.x >= 53 && player.x <=58 && player.y >=17 && player.y <=23) {
            playersPosInfo[playerId] = "roomX"
            console.log(playersPosInfo)
        }
    
        console.log("x:" + player.x + " y:" + player.y)
        const conditions1 = (player.x === 55 || player.x === 56)

        if(conditions1 && player.y === 24) {
        playersPosInfo[playerId] = "roomXEntrance"

        console.log(playersPosInfo)
        console.log(year + "年" + month + "月" + date + "日" + hour + ":" + min + ":" + sec)

        // 入室
        } else if(conditions1 && player.y === 23) {
            playersPosInfo[playerId] = "inRoomX"

            console.log(playersPosInfo)
            console.log(year + "年" + month + "月" + date + "日" + hour + ":" + min + ":" + sec)

        // 退室
        } else if (conditions1 && player.y === 25) {
            playersPosInfo[playerId] = "outside"

            console.log(playersPosInfo)
            console.log(year + "年" + month + "月" + date + "日" + hour + ":" + min + ":" + sec)
        }
    }

}

game.subscribeToConnection(
    (connected) => {
        console.log("is connected:", connected);
        game.subscribeToEvent("error", console.info);
        game.subscribeToEvent("warn", console.warn);
        game.subscribeToEvent("error", console.error);
        moveProgram();
    }
)

const atRoomEntrance: string[] = []
const inRoomX: string[] = []

console.log(atRoomEntrance)
console.log(inRoomX)

game.subscribeToEvent('playerMoves', () => {
    moveProgram ();
})


