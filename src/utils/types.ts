export interface ApiResponse<T = unknown>{
    success: boolean;
    message: string;
    data?: T;
    err?: unknown
}


export interface InitPortfolioBody{
    clientName: string;
    riskProfile: string;
}

export interface PortfolioTransactionBody {
    symbol: string;
    quantity: number;
    price: number;
}