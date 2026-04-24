import { Response,Request } from "express"
import { ApiResponse, init_portfolio } from "../utils/types"
import { prisma } from "../database/primaClient";

const normalizeRiskProfile = (riskProfile: string) => {
  const normalizedValue = riskProfile.trim().toUpperCase();
  if (normalizedValue === "LOW" || normalizedValue === "MODERATE" || normalizedValue === "AGRESSIVE") {
    return normalizedValue;
  }
  return null;
};

const start_portfolio = async(
    req:Request<{},ApiResponse,init_portfolio,{}>,
    res:Response<ApiResponse> )=>
{
  try{
    const {
        name ,
        riskprofile,
    } = req.body;

      if (!name?.trim() || !riskprofile?.trim()) {
        return res.status(400).json({
          success: false,
          message: "name and riskprofile are required"
        });
      }

      const riskValue = normalizeRiskProfile(riskprofile);

      if (!riskValue) {
        return res.status(400).json({
          success: false,
          message: "riskprofile must be LOW, MODERATE, or AGGRESSIVE"
        });
      }

    const new_portfolio = await prisma.portfolio.create({
        data: {
            portfolio_name: name.trim(),
            portfolio_risk: riskValue,
        },
    });

    return res.status(201).json({
        success:true,
        message:"Portfolio created",
        data:new_portfolio
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