import {Game, Player, SetItemString} from "@gathertown/gather-game-client";
import {SPACE_ID, API_KEY } from "./config";
import {GoogleSpreadsheetService} from "./googleSpreadSheet"
import {rooms} from "./rooms"
import { PlayerPosInfo } from "./type";
import {detectInOutOfRoom, generateCoordinates} from './recordEntranceExit'

globalThis.WebSocket = require("isomorphic-ws");

const game = new Game(undefined, () => Promise.resolve({apiKey: API_KEY}));
game.init(SPACE_ID);
game.connect();

const playersPosInfo: PlayerPosInfo[] = []
let spreadService: GoogleSpreadsheetService;

const playerIds = Object.keys(game.players)

/**
 * Gatherへの接続
 */
game.subscribeToConnection(
    async (connected) => {
        console.log("is connected:", connected);
        game.subscribeToEvent("error", console.info);
        game.subscribeToEvent("warn", console.warn);
        game.subscribeToEvent("error", console.error);

        // スプレッドシート書き込みを行うインスタンスの生成
        spreadService = await GoogleSpreadsheetService.getInstance();
    }   
)

/**
 * プログラム開始時に全ての室内にいる人を検出しスプレッドシートに記録
 */
game.subscribeToEvent('playerJoins', () => {
    for(const playerId of playerIds) {
        const player = game.players[playerId]

        playersPosInfo.push({id: playerId, roomName: '', map: player.map, isIn: true })

        const roomCoordinates = generateCoordinates(rooms, player)

        detectInOutOfRoom(roomCoordinates, playerId, player, playersPosInfo, spreadService)
    }
    
})

/**
 * プレイヤーの移動を検知して入退室を記録する
 */
game.subscribeToEvent('playerMoves', () => {
    const playerIds = Object.keys(game.players)
   
    
    for(const playerId of playerIds) {
        const player = game.players[playerId]

        playersPosInfo.push({id: playerId, roomName: '', map: player.map, isIn: true })
        const roomCoordinates = generateCoordinates(rooms, player)

        detectInOutOfRoom(roomCoordinates, playerId, player, playersPosInfo, spreadService)
    }
})


// game.subscribeToEvent('playerTriggersItem', (x) => {
//     const playerIds = Object.keys(game.players)
//     console.log('key', x)

//     // for(const playerId of playerIds) {
//     //     const player = game.players[playerId]

//     //     console.log("emote " + player.emote)
//     // }
// })


//Gets events on X near object
game.subscribeToEvent("playerInteracts",({ playerInteracts }, context) => {
    console.log("playerInteracts " + playerInteracts);
});

game.subscribeToEvent("playerTriggersItem", ({ playerTriggersItem }, context) => {
    console.log("playerTriggersItem " + playerTriggersItem);
});
