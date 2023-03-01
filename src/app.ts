import {Game, Player} from "@gathertown/gather-game-client";
import {SPACE_ID, API_KEY } from "./config";
import {rooms} from "./rooms"
import { PlayerPosInfo } from "./type";
import {detectInOutOfRoom, generateCoordinates, detectInteract} from './recordEntranceExit'

globalThis.WebSocket = require("isomorphic-ws");

const game = new Game(undefined, () => Promise.resolve({apiKey: API_KEY}));
game.init(SPACE_ID);
game.connect();

let playerPositions: PlayerPosInfo[] = []


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
    }   
)

/**
 * プログラム開始時に全ての室内にいる人を検出し記録
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
            detectInOutOfRoom(coordinates, player, playerPosition)
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
            detectInOutOfRoom(coordinates, player, playerPosition)
        }   
        
    }
}) 



/**
 * Xボタンの押下を検知して記録する
 */
game.subscribeToEvent("playerInteracts",({ playerInteracts }, context) => {
    const uid = game.getPlayerUidFromEncId(playerInteracts.encId)

    let player: Player;
    if(uid) {
        player = game.players[uid]

        const playerPosition = playerPositions.find(playerPosition => playerPosition.id == uid)

        const coordinates = generateCoordinates(rooms,player)

        if(playerPosition) {
            detectInteract(coordinates, player, playerPosition)
        }   
    }
});