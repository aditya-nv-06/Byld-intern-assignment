export interface ApiResponse{
    success: boolean;
    message: string;
    data?:unknown;
    err?:unknown
}


export interface init_portfolio{
    name: string;
    riskprofile: string;
    balance:number;
}