export interface ApiResponse<T = unknown>{
    success: boolean;
    message: string;
    data?: T;
    errorCode?: string;
    details?: string[];
    err?: unknown
}


export interface InitPortfolioBody{
    clientName: string;
    riskProfile: string;
}

export interface PortfolioTransactionBody {
    symbol: string;
    exchange: string;
    assetCategory: string;
    quantity: number;
    price: number;
}