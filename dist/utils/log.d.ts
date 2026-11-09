export declare enum colorCodes {
    BLACK = "\u001B[30m",
    RED = "\u001B[31m",
    GREEN = "\u001B[32m",
    YELLOW = "\u001B[33m",
    BLUE = "\u001B[34m",
    MAGENTA = "\u001B[35m",
    CYAN = "\u001B[36m",
    RESET = "\u001B[0m"
}
export declare enum logTypes {
    ERROR = 0,
    WARN = 1,
    INFO = 2
}
declare const log: (data: any, type: logTypes, color?: colorCodes | undefined) => void;
export default log;
