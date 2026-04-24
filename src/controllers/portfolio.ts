import { Response,Request } from "express"
import { ApiResponse,init_portfolio } from "../utils/types"

const start_portfolio = async(
    req:Request<{},ApiResponse,init_portfolio,{}>,
    res:Response<ApiResponse> )=>
{
  try{
    const {
        name ,
        riskprofile,
        balance
    } = req.body;

    return res.status(201).json({
        success:true,
        message:"Portfolio created"
    })
  }catch(err){
    return res.status(401).json({
        success:false,
        message:"Portfolio not created"
    })
  }
}

export {
    start_portfolio
}