// roleAccess.js (create a new file if needed)
export const roleAccessMap = {
  Admin: [
    "/app/users/tickets",
    "/app/dashboard/overview",
    "/app/tickets/create",
    "/app/analytics/reports",
    "/app/master/assets",
    "/app/users/settings",
    "/app/dashboard/tableoverview",
    "/app/master/faultyassets" ,
    "/app/master/replacementassets" ,
    "/app/master/scrapassets"
  ],
  "Support Team": [
    "/app/tickets/create",
    "/app/users/tickets"
  ],
  "Service Engineer": [
    "/app/users/tickets"
  ],
  "Dm Admin": [
    "/app/tickets/create",
    "/app/master/assets",
    "/app/dashboard/overview"
    
  ],
  "Depot Admin": [
    "/app/tickets/create",
    "/app/master/assets",
    
  ],
  "RvShop Admin": [
    "/app/tickets/create",
    "/app/master/assets",
    
  ],
  "Region Admin": [
    "/app/users/tickets",
    "/app/tickets/create",
    "/app/analytics/reports",
    "/app/master/assets",
  ],
};
