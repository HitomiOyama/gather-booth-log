import { Rooms} from './type'
import { 
    room1Corners, 
    room1EntranceCells, 
    room2Corners, 
    room2EntranceCells, 
    room3Corners,
    room3EntranceCells,
    room4Corners, 
    room4EntranceCells,
    room5Corners, 
    room5EntranceCells,
    roomHCorners, 
    roomHEntranceCells
} from './eachRooms'
       
export const rooms: Rooms[] = [
    {
        roomCorners: room1Corners,
        entrance: room1EntranceCells,
        roomName: 'room1',
        mapId: 'A_wRyD-Z1lKt3YEqnb_I1',
        mapName: '部活部屋1',
    },
    {
        roomCorners: room2Corners,
        entrance: room2EntranceCells,
        roomName: 'room2',
        mapId: 'A_wRyD-Z1lKt3YEqnb_I1',
        mapName: '部活部屋1',
    },
    {
        roomCorners: room3Corners,
        entrance: room3EntranceCells,
        roomName: 'room3',
        mapId: 'A_wRyD-Z1lKt3YEqnb_I1',
        mapName: '部活部屋1',
    },
    {
        roomCorners: room4Corners,
        entrance: room4EntranceCells,
        roomName: 'room4',
        mapId: 'A_wRyD-Z1lKt3YEqnb_I1',
        mapName: '部活部屋1',
    },
    {
        roomCorners: room5Corners,
        entrance: room5EntranceCells,
        roomName: 'room5',
        mapId: 'A_wRyD-Z1lKt3YEqnb_I1',
        mapName: '部活部屋1',
    },
    {
        roomCorners: roomHCorners,
        entrance: roomHEntranceCells,
        roomName: 'roomH',
        mapId: "ccVlopHkey2Oo6cE9WM1v",
        mapName: '部活部屋2',
    },
]