const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Byld Intern Portfolio API",
    version: "1.0.0",
    description: "OpenAPI documentation for the portfolio backend with NSE/BSE examples and Indian market categories.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Portfolio", description: "Portfolio lifecycle endpoints." },
    { name: "Transactions", description: "Buy and sell endpoints." },
    { name: "Alerts", description: "Price alert and webhook endpoints." },
  ],
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Invalid input." },
          errorCode: { type: "string", example: "INVALID_INPUT" },
          details: {
            type: "array",
            items: { type: "string" },
            example: ["clientName: Too small: expected string to have >=1 characters"],
          },
        },
        required: ["success", "message", "errorCode"],
      },
      CreatePortfolioRequest: {
        type: "object",
        properties: {
          clientName: { type: "string", example: "Aarav Sharma" },
          riskProfile: {
            type: "string",
            enum: ["LOW", "MODERATE", "AGGRESSIVE"],
            example: "MODERATE",
          },
        },
        required: ["clientName", "riskProfile"],
      },
      Exchange: {
        type: "string",
        enum: ["NSE", "BSE"],
        example: "NSE",
      },
      AssetCategory: {
        type: "string",
        enum: ["ETF", "MTF", "BONDS", "SHARES", "STOCKS"],
        example: "STOCKS",
      },
      AlertKind: {
        type: "string",
        enum: ["ABOVE", "BELOW"],
        example: "ABOVE",
      },
      AlertStatus: {
        type: "string",
        enum: ["ACTIVE", "INACTIVE"],
        example: "ACTIVE",
      },
      Portfolio: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
          clientName: { type: "string", example: "Aarav Sharma" },
          riskProfile: { type: "string", example: "MODERATE" },
        },
        required: ["id", "clientName", "riskProfile"],
      },
      Holding: {
        type: "object",
        properties: {
          symbol: { type: "string", example: "RELIANCE" },
          exchange: { $ref: "#/components/schemas/Exchange" },
          assetCategory: { $ref: "#/components/schemas/AssetCategory" },
          quantity: { type: "integer", example: 12 },
          weightedAverageCostBasis: { type: "number", example: 182.45 },
        },
        required: ["symbol", "exchange", "assetCategory", "quantity", "weightedAverageCostBasis"],
      },
      PortfolioSummary: {
        allOf: [
          { $ref: "#/components/schemas/Portfolio" },
          {
            type: "object",
            properties: {
              cashBalance: { type: "number", example: 2500.75 },
              holdings: {
                type: "array",
                items: { $ref: "#/components/schemas/Holding" },
              },
            },
            required: ["cashBalance", "holdings"],
          },
        ],
      },
      TransactionRequest: {
        type: "object",
        properties: {
          symbol: { type: "string", example: "RELIANCE" },
          exchange: { $ref: "#/components/schemas/Exchange" },
          assetCategory: { $ref: "#/components/schemas/AssetCategory" },
          quantity: { type: "integer", example: 5 },
          price: { type: "number", example: 2984.25 },
        },
        required: ["symbol", "exchange", "assetCategory", "quantity", "price"],
      },
      TransactionResult: {
        oneOf: [
          { $ref: "#/components/schemas/Holding" },
          { type: "null" },
        ],
      },
      CreateAlertRequest: {
        type: "object",
        properties: {
          symbol: { type: "string", example: "RELIANCE" },
          kind: { $ref: "#/components/schemas/AlertKind" },
          price: { type: "number", example: 3000.0 },
          webhookUrl: {
            type: "string",
            format: "uri",
            example: "https://webhook.site/550e8400-e29b-41d4-a716-446655440000",
          },
        },
        required: ["symbol", "kind", "price", "webhookUrl"],
      },
      PriceAlert: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
          symbol: { type: "string", example: "RELIANCE" },
          kind: { $ref: "#/components/schemas/AlertKind" },
          price: { type: "number", example: 3000.0 },
          webhookUrl: {
            type: "string",
            format: "uri",
            example: "https://webhook.site/550e8400-e29b-41d4-a716-446655440000",
          },
          status: { $ref: "#/components/schemas/AlertStatus" },
          firedAt: { type: "string", format: "date-time", nullable: true, example: null },
          createdAt: { type: "string", format: "date-time", example: "2026-04-25T12:00:00.000Z" },
        },
        required: ["id", "symbol", "kind", "price", "webhookUrl", "status", "createdAt"],
      },
      ApiSuccessPortfolio: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Portfolio created successfully." },
          data: { $ref: "#/components/schemas/Portfolio" },
        },
        required: ["success", "message", "data"],
      },
      ApiSuccessSummary: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Portfolio fetched successfully." },
          data: { $ref: "#/components/schemas/PortfolioSummary" },
        },
        required: ["success", "message", "data"],
      },
      ApiSuccessHoldings: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Holdings fetched successfully." },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Holding" },
          },
        },
        required: ["success", "message", "data"],
      },
      ApiSuccessTransaction: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Buy transaction created successfully." },
          data: { $ref: "#/components/schemas/TransactionResult" },
        },
        required: ["success", "message", "data"],
      },
      ApiSuccessCreateAlert: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Price alert created successfully" },
          data: { $ref: "#/components/schemas/PriceAlert" },
        },
        required: ["success", "message", "data"],
      },
      ApiSuccessListAlerts: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Price alerts retrieved successfully" },
          data: {
            type: "object",
            properties: {
              alerts: {
                type: "array",
                items: { $ref: "#/components/schemas/PriceAlert" },
              },
            },
            required: ["alerts"],
          },
        },
        required: ["success", "message", "data"],
      },
      ApiSuccessDeleteAlert: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Price alert deleted successfully" },
          data: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
            },
            required: ["id"],
          },
        },
        required: ["success", "message", "data"],
      },
    },
  },
  paths: {
    "/v1/portfolios": {
      post: {
        tags: ["Portfolio"],
        summary: "Create a portfolio",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePortfolioRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Portfolio created.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccessPortfolio" },
              },
            },
          },
          400: { description: "Invalid input.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/v1/portfolios/{id}": {
      get: {
        tags: ["Portfolio"],
        summary: "Fetch a portfolio summary",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Portfolio fetched.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccessSummary" },
              },
            },
          },
          400: { description: "Invalid input.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Portfolio not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/v1/portfolios/{id}/transactions/buy": {
      post: {
        tags: ["Transactions"],
        summary: "Buy a holding from NSE or BSE",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TransactionRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Buy transaction created.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccessTransaction" },
              },
            },
          },
          400: { description: "Invalid input.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Portfolio not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/v1/portfolios/{id}/transactions/sell": {
      post: {
        tags: ["Transactions"],
        summary: "Sell a holding from NSE or BSE",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TransactionRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Sell transaction created.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccessTransaction" },
              },
            },
          },
          400: { description: "Invalid input.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Portfolio not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          409: { description: "Not enough holdings to sell.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/v1/portfolios/{id}/holdings": {
      get: {
        tags: ["Portfolio"],
        summary: "List holdings for a portfolio",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Holdings fetched.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccessHoldings" },
              },
            },
          },
          400: { description: "Invalid input.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Portfolio not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/v1/portfolios/{id}/alerts": {
      post: {
        tags: ["Alerts"],
        summary: "Create a price alert webhook",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAlertRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Price alert created.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccessCreateAlert" },
              },
            },
          },
          400: { description: "Invalid input.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Portfolio not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      get: {
        tags: ["Alerts"],
        summary: "List all alerts for a portfolio",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Alerts fetched.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccessListAlerts" },
              },
            },
          },
          404: { description: "Portfolio not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/v1/portfolios/{id}/alerts/{alertId}": {
      delete: {
        tags: ["Alerts"],
        summary: "Delete a price alert",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "alertId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Alert deleted.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccessDeleteAlert" },
              },
            },
          },
          404: { description: "Alert not found.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          500: { description: "Internal server error.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
  },
} as const;

export { swaggerSpec };