export enum Actions {
    OPEN_FILE = 1,
    OPENED_FILE = 2,
    WRITE_FILE = 3,
    SYNC_FILE = 4,
    ERROR = 5,
    SUCCESS = 6
}


export type MessageObject = {
    id: string,
    action: Actions,
    details: any
}
