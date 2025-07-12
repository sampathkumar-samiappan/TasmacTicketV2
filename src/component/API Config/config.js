const host = process.env.REACT_APP_HOST;

export const BASE_URL = `${host}`;
export const API_KEY = '146e020f5d1bae0';
export const API_SECRET = '9231b603af7fe58';
export const HEADERS= {
    "Authorization": `Basic ${btoa(API_KEY + ":" + API_SECRET)}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
}
export const API_URL = `${BASE_URL}/api/resource`;
export const URL_Login = `${BASE_URL}/api/method/ticket_login`;
export const URL_ticket = `${BASE_URL}/api/resource/TasmacTicket`;
export const URL_getTicket = `${BASE_URL}/api/method/get_ticket_data`;
export const URL_Location = `${BASE_URL}/api/resource/Service Location`;
export const URL_getSummary = `${BASE_URL}/api/method/get_ticket_summary`;
export const URL_getTicketSummary = `${BASE_URL}/api/method/get_ticket_priority_count`;
export const URL_ticketuser = `${BASE_URL}/api/resource/TicketUser`;
export const URL_getTicketLogs = `${BASE_URL}/api/method/get_ticket_logs`;
export const URL_ticketlog = `${BASE_URL}/api/resource/TicketLog`;
export const URL_getAssetSummary=`${BASE_URL}/api/method/get_assets_summary_by_usertype`;