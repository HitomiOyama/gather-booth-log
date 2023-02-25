export type RoomCorners = {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
}

export type RoomEntrance = {
    minX: number,
    maxX: number,
    y: number
}

export type Rooms = {
    roomCorners: RoomCorners,
    entrance: RoomEntrance,
    roomName: string, // 部屋の名称。任意につけて良い
    mapId: string  //マップ（画面遷移により切り替わるエリア）のId。システム側で決定される
    mapName: string  //マップの名前。任意につけて良い。
}

export type RoomCoordinates = {
    isInRoom: boolean, 
    isAtEntrance: boolean, 
    roomName: string,
    mapName: string
}

export type PlayerPosInfo  = {
    id: string, 
    roomName: string, 
    mapId: string,
    mapName: string,
    isIn: boolean
}
