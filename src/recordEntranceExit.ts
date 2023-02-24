import {Player, PlayerSpotlights} from "@gathertown/gather-game-client";
import {GoogleSpreadsheetService} from "./googleSpreadSheet"
import { RoomCorners, RoomEntrance, Rooms, RoomCoordinates, PlayerPosInfo } from "./type";

    /**
     * 入退室の条件文を生成します
     * @param {Rooms} rooms 部屋の情報（四隅、入口）
     * @param {Player} player プレイヤー
     * @return {RoomCoordinates[]}  全ての部屋の入退室条件文
     */
    const generateCoordinates = (rooms: Rooms[], player: Player): RoomCoordinates[] => {
        const roomCoordinates: RoomCoordinates[] = []

        for(let i = 0; i < rooms.length; i ++) {
            const areaCoordinates = generateCoordinate(rooms[i].roomCorners, rooms[i].mapId, player)
            const entranceCoordinates = generateEntranceCoordinate(rooms[i].entrance, rooms[i].mapId, player)
    
            roomCoordinates.push({isInRoom: areaCoordinates, isAtEntrance: entranceCoordinates, roomName: rooms[i].roomName, mapName: rooms[i].mapName})
        }

        return roomCoordinates
    }


    /**
     * 入退室を検知してスプレッドシートに記載します。
     * @param {RoomCoordinates[]} roomCoordinates 部屋の情報（四隅、入口）
     * @param {string} playerId プレイヤー
     * @param {Player} player プレイヤー
     * @return {void} 
     */
    const detectInOutOfRoom = (roomCoordinates: RoomCoordinates[], playerId: string, player: Player, playersPosInfo: PlayerPosInfo[], spreadService: GoogleSpreadsheetService): void => {
        for(const roomCoordinate of roomCoordinates) {
            // 入室
            isInRoom(playerId, player, roomCoordinate, playersPosInfo, spreadService)
            // 退室
            isAtEntrance(playerId, player, roomCoordinate, playersPosInfo, spreadService)
        }
    }


    /**
     * 入室の条件（部屋の範囲）を生成します
     * @param {number} minX X座標の最小値
     * @param {number} maxX X座標の最大値
     * @param {number} minY Y座標の最小値
     * @param {number} maxY Y座標の最大値
     * @param {number} playerY プレイヤー
     */
    const generateCoordinate = (
        areaCorners: RoomCorners, 
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
    const generateEntranceCoordinate = (entranceCells:RoomEntrance, mapId: string, player:Player): boolean => {
        return (player.x === entranceCells.minX || player.x === entranceCells.maxX) && (player.y === entranceCells.y) && (player.map === mapId)
    }



    /**
     * 入室を検知します
     * @param {boolean} conditions 条件
     * @param {string} playerId プレイヤーのID
     * @param {string} roomName 部屋の名前
     * 
     */
    const isInRoom = (playerId: string, player: Player, roomCoordinates: RoomCoordinates, playersPosInfo: PlayerPosInfo[], spreadService:GoogleSpreadsheetService): void => {
        const playerPosition = playersPosInfo.find(playerPos =>  playerPos.id = playerId)

        if( roomCoordinates.isInRoom ) { 
            if(playerPosition == null) return
            if(playerPosition.roomName !== roomCoordinates.roomName) {
                playerPosition.roomName = roomCoordinates.roomName
                playerPosition.isIn = true
                playerPosition.map = player.map
                writeIntoSpreadSheet(player.name, roomCoordinates.mapName, playerPosition.roomName, true, spreadService)
            }
        } 
    }

    /**
     * 退室を検知します
     * @param {boolean} conditions 条件
     * @param {string} map 条件
     * @param {string} playerId プレイヤーのID
     * @param {Player} player プレイヤーのID
     */
    const isAtEntrance = (playerId: string, player: Player, coordinates: RoomCoordinates, playersPosInfo: PlayerPosInfo[], spreadService:GoogleSpreadsheetService): void => {
        const playerPosition = playersPosInfo.find(playerPos =>  playerPos.id = playerId)
        if (coordinates.isAtEntrance) {
            if(playerPosition == null)  return
            if(playerPosition.isIn !== false) {
                playerPosition.isIn = false

                writeIntoSpreadSheet(player.name, coordinates.mapName, playerPosition.roomName, false, spreadService);
                playerPosition.roomName = 'outside'
            }
        }
    }


    /**
     * スプレッドシートへの書き込み
     * @param {string} name プレイヤー名
     * @param {string} room 部屋名
     */
    const writeIntoSpreadSheet = async (name: string, map: string, room: string, isIn: boolean , spreadService: GoogleSpreadsheetService): Promise<void> => {
        await spreadService.addRow(room, [name, map, room, isIn ? 'in' : 'out', Date()]); 
        await spreadService.addRow("all", [name, map, room, isIn ? 'in' : 'out', Date()]); 
    }

// }

export {detectInOutOfRoom, generateCoordinates, writeIntoSpreadSheet}