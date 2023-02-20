import {Game, Player} from "@gathertown/gather-game-client";
import {SPACE_ID, API_KEY } from "./config";
import {GoogleSpreadsheetService} from "./googleSpreadSheet"

globalThis.WebSocket = require("isomorphic-ws");

const game = new Game(undefined, () => Promise.resolve({apiKey: API_KEY}));
game.init(SPACE_ID);
game.connect();

const playerIds = Object.keys(game.players)
console.log("playerIds are " + Object.keys(game.players))

const playersPosInfo:{[id: string]: string} = {}
let spreadService: GoogleSpreadsheetService;

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
 * プレイヤーの移動を検知して入退室を記録する
 */
game.subscribeToEvent('playerMoves', () => {
    const playerIds = Object.keys(game.players)
    
    for(const playerId of playerIds) {
        const player = game.players[playerId] 
        console.log("x:" + player.x + " y:" + player.y)

        const room1AreaX = generateCoordinate(53, 58, player.x)
        const room1AreaY = generateCoordinate(17, 23, player.y)
        const room1EntranceX = generateEntranceCoordinate(55, player.x, 56)
        const room1EntranceY = generateEntranceCoordinate(24, player.y)

        const room2AreaX = generateCoordinate(60, 65, player.x)
        const room2AreaY = generateCoordinate(17, 23, player.y)
        const room2EntranceX = generateEntranceCoordinate(62, player.x, 63)
        const room2EntranceY = generateEntranceCoordinate(24, player.y)
 
        // room1入室
        isInRoom(room1AreaX, room1AreaY, playerId, "room1")

        // room2退室
        isAtEntrance(room1EntranceX, room1EntranceY, playerId)

        // room2入室
        isInRoom(room2AreaX, room2AreaY, playerId, "room2")

        // room2退室
        isAtEntrance(room2EntranceX, room2EntranceY, playerId)
    }
})



/**
 * スプレッドシートへの書き込み
 * @param {string} name プレイヤー名
 * @param {string} room 部屋名
 */
const writeIntoSpreadSheet = async (name: string, room: string) => {
    
    await spreadService.addRow('シート1', {name: name, room: room, time: Date()}); // ヘッダ似合うような形で行を追加
}

/**
 * 入室を検知しますす
 * @param {boolean} conditionX x軸についての条件
 * @param {boolean} conditionY y軸についての条件
 * @param {string} playerId プレイヤーのID
 * @param {string} roomName 部屋の名前
 * 
 */
const isInRoom = (condition1: boolean, condition2: boolean, playerId: string, roomName: string) => {
    const player = game.players[playerId]
    if( condition1 && condition2 ) { 
        if(playersPosInfo[playerId] !== roomName) {
            playersPosInfo[playerId] = roomName
            writeIntoSpreadSheet(player.name,playersPosInfo[playerId]);
        }    
    } 
}

/**
 * 退室を検知します
 * @param {boolean} conditionX x軸についての条件
 * @param {boolean} conditionY y軸についての条件
 * @param {string} playerId プレイヤーのID
 */
const isAtEntrance = (conditionX: boolean, conditionY: boolean, playerId: string) => {
    const player = game.players[playerId]
    if (conditionX && conditionY ) {
        if(playersPosInfo[playerId] !== "outside") {
            playersPosInfo[playerId] = "outside"
            writeIntoSpreadSheet(player.name,playersPosInfo[playerId]);
        }
    }
}


/**
 * 入室の条件（部屋の範囲）を生成します
 * @param {number} min 最小値
 * @param {number} max 最大値
 * @param {number} player プレイヤーの現在地
 */
const generateCoordinate = (min: number, max: number, player: number) => {
    return player >= min && player <=max
}


/**
 * 退室の条件(入口のます)を生成します
 * @param {number} min 最小値
 * @param {number} player プレイヤーの現在地
 * @param {number} max 最大値
 */
const generateEntranceCoordinate = (min: number, player: number, max?: number)=> {
    if(max) {
        return player === min || player === max
    }
    
    return player === min
}