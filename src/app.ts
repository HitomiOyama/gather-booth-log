import {Game, Player, PlayerSetsCurrentArea, SetItemString} from "@gathertown/gather-game-client";
import {SPACE_ID, API_KEY } from "./config";
import {GoogleSpreadsheetService} from "./googleSpreadSheet"
import {rooms} from "./rooms"
import { PlayerPosInfo, RoomCoordinates } from "./type";
import {detectInOutOfRoom, generateCoordinates, detectInteract} from './recordEntranceExit'

globalThis.WebSocket = require("isomorphic-ws");

const game = new Game(undefined, () => Promise.resolve({apiKey: API_KEY}));
game.init(SPACE_ID);
game.connect();

let playerPositions: PlayerPosInfo[] = []
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

        playerPositions = []

        // スプレッドシート書き込みを行うインスタンスの生成
        spreadService = await GoogleSpreadsheetService.getInstance();
    }   
)

/**
 * プログラム開始時に全ての室内にいる人を検出しスプレッドシートに記録
 */
game.subscribeToEvent('playerJoins', ({ playerJoins }, context) => {
    const uid = game.getPlayerUidFromEncId(playerJoins.encId)
    let player: Player;

    if(uid) {
        player = game.players[uid]
        if(!playerPositions.find(playerPosision => playerPosision.id == uid)) {
            player = game.players[uid]
            playerPositions.push({
                id: uid,
                roomName: 'outside',
                mapId: player.map,
                mapName: 'undefined',
                isIn: false
            })
        }
        const playerPosition = playerPositions.find(playerPosition => playerPosition.id == uid)

        const coordinates = generateCoordinates(rooms, player)
        if(playerPosition) {
            detectInOutOfRoom(coordinates, player, playerPosition, spreadService)
        } 
    }
})

/**
 * プレイヤーの移動を検知して入退室を記録する
 */
game.subscribeToEvent('playerMoves', ({ playerMoves }, context) => {
    let player: Player;
    
    const uid = game.getPlayerUidFromEncId(playerMoves.encId)
    if(uid) {
        
    }
    if(uid) {
        player = game.players[uid]

        if(!playerPositions.find(playerPosision => playerPosision.id == uid)) {
            player = game.players[uid]
            playerPositions.push({
                id: uid,
                roomName: 'outside',
                mapId: player.map,
                mapName: 'undefined',
                isIn: false
            })
        } 

        const playerPosition = playerPositions.find(playerPosition => playerPosition.id == uid)

        const coordinates = generateCoordinates(rooms,player)

        if(playerPosition) {
            detectInOutOfRoom(coordinates, player, playerPosition, spreadService)
        }   
        
    }
}) 



//Gets events on X near object
game.subscribeToEvent("playerInteracts",({ playerInteracts }, context) => {
    const uid = game.getPlayerUidFromEncId(playerInteracts.encId)

    // const player = uid ? game.players[uid] : {name: 'undefined'}

    // writeIntoSpreadSheet(player.name, 'pressX', 'room1', false, spreadService);

    let player: Player;
    if(uid) {
        player = game.players[uid]

        const playerPosition = playerPositions.find(playerPosition => playerPosition.id == uid)

        const coordinates = generateCoordinates(rooms,player)

        if(playerPosition) {
            detectInteract(coordinates, player, playerPosition, spreadService)
        }   
    }
});