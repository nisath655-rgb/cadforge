// CADForge payment bridge (Node 18+). Dev/integration starter; use a real DB/auth layer for production.
import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(__dirname));
const mode = process.env.PAYHERE_MODE === 'live' ? 'live' : 'sandbox';
const gateway = mode === 'live' ? 'https://www.payhere.lk/pay/checkout' : 'https://sandbox.payhere.lk/pay/checkout';
function hashFor({merchant_id, order_id, amount, currency}) {
  const amountFixed = Number(amount).toFixed(2);
  return crypto.createHash('md5').update(merchant_id + order_id + amountFixed + currency + crypto.createHash('md5').update(process.env.PAYHERE_MERCHANT_SECRET || '').digest('hex').toUpperCase()).digest('hex').toUpperCase();
}
app.get('/api/config', (_req,res)=>res.json({configured:Boolean(process.env.PAYHERE_MERCHANT_ID && process.env.PAYHERE_MERCHANT_SECRET), mode, plans:{PRO:Number(process.env.PRO_AMOUNT||1990),PREMIUM:Number(process.env.PREMIUM_AMOUNT||3990)}}));
app.post('/api/payhere/checkout', (req,res)=>{
  const {plan, first_name, last_name, email, phone} = req.body;
  const amount = plan === 'PREMIUM' ? Number(process.env.PREMIUM_AMOUNT||3990) : Number(process.env.PRO_AMOUNT||1990);
  if (!process.env.PAYHERE_MERCHANT_ID || !process.env.PAYHERE_MERCHANT_SECRET) return res.status(503).json({error:'Payment gateway is not configured on the server.'});
  const order_id = `CF-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const payload={merchant_id:process.env.PAYHERE_MERCHANT_ID,return_url:`${process.env.FRONTEND_URL||'http://localhost:3000'}?payment=return`,cancel_url:`${process.env.FRONTEND_URL||'http://localhost:3000'}?payment=cancel`,notify_url:`${process.env.APP_BASE_URL||'http://localhost:3000'}/api/payhere/notify`,first_name,last_name,email,phone,address:'',city:'',country:'Sri Lanka',order_id,items:`CADForge ${plan}`,currency:'LKR',amount:amount.toFixed(2),hash:''};
  payload.hash=hashFor(payload);
  res.json({action:gateway,payload});
});
app.post('/api/payhere/notify',(req,res)=>{
  // Production: verify md5sig exactly as documented by PayHere, then update your DB/subscription.
  const {merchant_id,order_id,payhere_amount,payhere_currency,status_code,md5sig,message_type,subscription_id}=req.body;
  if (!process.env.PAYHERE_MERCHANT_SECRET) return res.sendStatus(503);
  const local=crypto.createHash('md5').update(merchant_id+order_id+payhere_amount+payhere_currency+status_code+crypto.createHash('md5').update(process.env.PAYHERE_MERCHANT_SECRET).digest('hex').toUpperCase()).digest('hex').toUpperCase();
  if(local!==String(md5sig||'').toUpperCase()) return res.sendStatus(400);
  console.log('Verified PayHere notification', {order_id,status_code,message_type,subscription_id});
  // TODO: persist subscription status in your production DB.
  res.sendStatus(200);
});
const port=Number(process.env.PORT||3000); app.listen(port,()=>console.log(`CADForge server running on http://localhost:${port}`));
