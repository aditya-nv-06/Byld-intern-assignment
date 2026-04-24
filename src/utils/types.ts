export interface ApiResponse{
    success: boolean;
    message: string;
    data?:unknown;
    err?:unknown
}