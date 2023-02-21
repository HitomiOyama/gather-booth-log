import {Game, Player} from "@gathertown/gather-game-client";
import {SPACE_ID, API_KEY } from "./config";
import {GoogleSpreadsheetService} from "./googleSpreadSheet"

globalThis.WebSocket = require("isomorphic-ws");

const game = new Game(undefined, () => Promise.resolve({apiKey: API_KEY}));
game.init(SPACE_ID);
game.connect();

       
const room1Corners= {
    minX: 11,
    maxX: 20,
    minY: 14,
    maxY: 24
}

const room1EntranceCells = {
    minX: 15,
    maxX: 16,
    y: 26
}

const room2Corners = {
    minX: 11,
    maxX: 20,
    minY: 44,
    maxY: 49
}

const room2EntranceCells = {
    minX: 16,
    maxX: 17,
    y: 43
}

const room3Corners = {
    minX: 22,
    maxX: 31,
    minY: 44,
    maxY: 49
}

const room3EntranceCells = {
    minX: 27,
    maxX: 28,
    y: 43
}

const room4Corners = {
    minX: 33,
    maxX: 42,
    minY: 44,
    maxY: 49
}

const room4EntranceCells = {
    minX: 38,
    maxX: 39,
    y: 43
}

const room5Corners = {
    minX: 44,
    maxX: 47,
    minY: 44,
    maxY: 49
}

const room5EntranceCells = {
    minX: 46,
    maxX: 47,
    y: 43,
    
}
const roomHCorners = {
    minX: 44,
    maxX: 47,
    minY: 44,
    maxY: 49,
}

const roomHEntranceCells = {
    minX: 46,
    maxX: 47,
    y: 43,
}

const rooms = [
    {
        roomCorners: room1Corners,
        entrance: room1EntranceCells,
        roomName: 'room1',
        mapId: 'A_wRyD-Z1lKt3YEqnb_I1',
  
    },
    {
        roomCorners: room2Corners,
        entrance: room2EntranceCells,
        roomName: 'room2',
        mapId: 'A_wRyD-Z1lKt3YEqnb_I1',

    },
    {
        roomCorners: room3Corners,
        entrance: room3EntranceCells,
        roomName: 'room3',
        mapId: 'A_wRyD-Z1lKt3YEqnb_I1',

    },
    {
        roomCorners: room4Corners,
        entrance: room4EntranceCells,
        roomName: 'room4',
        mapId: 'A_wRyD-Z1lKt3YEqnb_I1',

    },
    {
        roomCorners: room5Corners,
        entrance: room5EntranceCells,
        roomName: 'room5',
        mapId: 'A_wRyD-Z1lKt3YEqnb_I1',

    },
    {
        roomCorners: roomHCorners,
        entrance: roomHEntranceCells,
        roomName: 'roomH',
        mapId: "ccVlopHkey2Oo6cE9WM1v",

    },
]

const maps = [
    {
        mapId: 'A_wRyD-Z1lKt3YEqnb_I1',
        mapName: '部活部屋1'
    },
    {
        mapId: 'ccVlopHkey2Oo6cE9WM1v',
        mapName: '部活部屋2'
    }
]


const playersPosInfo:{id: string, position: string, area: string, isIn: boolean}[] = []
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

game.subscribeToEvent('playerJoins', () => {
    for(const playerId of playerIds) {
        const player = game.players[playerId]
        playersPosInfo.push({id: playerId, position: '', area: player.map, isIn: true })
    }
})



/**
 * プレイヤーの移動を検知して入退室を記録する
 */
game.subscribeToEvent('playerMoves', () => {
    const playerIds = Object.keys(game.players)
    
    for(const playerId of playerIds) {
        const player = game.players[playerId]
        playersPosInfo.push({id: playerId, position: '', area: player.map, isIn: true })

        let roomCoordinates: {area: boolean, entrance: boolean, roomName: string}[] = []

        for(let i = 0; i < rooms.length; i ++) {
            const areaCoordinates = generateCoordinate(rooms[i].roomCorners, rooms[i].mapId, player)
            const entranceCoordinates = generateEntranceCoordinate(rooms[i].entrance, rooms[i].mapId, player)
            roomCoordinates.push({area: areaCoordinates, entrance: entranceCoordinates, roomName: rooms[i].roomName})
        }
        
        for(const roomCoordinate of roomCoordinates) {
            // 入室
            isInRoom(roomCoordinate.area, playerId, roomCoordinate.roomName, player)
            // 退室
            isAtEntrance(roomCoordinate.entrance, playerId, player)
        }
    }
})


/**
 * 入室の条件（部屋の範囲）を生成します
 * @param {number} minX X座標の最小値
 * @param {number} maxX X座標の最大値
 * @param {number} minY Y座標の最小値
 * @param {number} maxY Y座標の最大値
 * @param {number} playerY プレイヤー
 */
const generateCoordinate = (
    areaCorners: {
    minX: number, 
    maxX: number, 
    minY: number, 
    maxY: number
    }, 
    mapId: string, 
    player: Player
    ): boolean => {
    return (player.x >= areaCorners.minX && player.x <=areaCorners.maxX) && (player.y >= areaCorners.minY && player.y <= areaCorners.maxY) && player.map == mapId
}


/**
 * 退室の条件(入口のます)を生成します
 * @param {number} minX X座標の最小値
 * @param {number} maxX X座標の最大値
 * @param {number} y ｙ座標
 * @param {number} player プレイヤーの現在地
 */
const generateEntranceCoordinate = (entranceCells:{minX: number, maxX: number, y: number}, mapId: string, player:Player)=> {
    return (player.x === entranceCells.minX || player.x === entranceCells.maxX) && (player.y === entranceCells.y) && (player.map === mapId)
}



/**
 * 入室を検知します
 * @param {boolean} conditions 条件
 * @param {string} playerId プレイヤーのID
 * @param {string} roomName 部屋の名前
 * 
 */
const isInRoom = (conditions: boolean, playerId: string, roomName: string, player: Player) => {
    const playerPosition = playersPosInfo.find(playerPos =>  playerPos.id = playerId)
    if( conditions ) { 
        if(playerPosition == null) return
        if(playerPosition.position !== roomName) {
            playerPosition.position = roomName
            playerPosition.isIn = true
            playerPosition.area = player.map
            writeIntoSpreadSheet(player.name, true, playerPosition.position);
        }    
    } 
}

/**
 * 退室を検知します
 * @param {boolean} conditions 条件
 * @param {string} playerId プレイヤーのID
 */
const isAtEntrance = (conditions: boolean, playerId: string, player: Player) => {
    const playerPosition = playersPosInfo.find(playerPos =>  playerPos.id = playerId)
    if (conditions) {
        if(playerPosition == null)  return
        if(playerPosition.isIn !== false) {
            playerPosition.isIn = false
            writeIntoSpreadSheet(player.name, false, playerPosition.position);
        }
    }
}


/**
 * スプレッドシートへの書き込み
 * @param {string} name プレイヤー名
 * @param {string} room 部屋名
 */
const writeIntoSpreadSheet = async (name: string, isIn: boolean, room: string, ) => {
    if(isIn) {
        await spreadService.addRow(room, [name, 'in', Date()]); 
    } else {
        await spreadService.addRow(room, [name, 'out',Date()]); 
    }
}


document.getElementById('root')?.addEventListener('keypress', (e: KeyboardEvent) => {
    if(e.key === 'x' || e.key === 'X') {
        console.log('You press X')
    }
})