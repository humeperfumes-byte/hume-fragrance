import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {readBoundedJson} from '@/lib/bounded-request-body';
import {lookupPublicTrackingResult} from '@/lib/tracking/public-lookup';
export const dynamic='force-dynamic';
const trackingInput=z.object({trackingNumber:z.string().trim().min(6).max(60).regex(/^[a-zA-Z0-9\s-]+$/)});
export async function POST(request:NextRequest){
 let trackingNumber:string;
 try{trackingNumber=trackingInput.parse(await readBoundedJson(request,2048)).trackingNumber;}
 catch{return NextResponse.json({error:'Enter a valid tracking number.'},{status:400});}
 try{
  const result=await lookupPublicTrackingResult(trackingNumber);
  return NextResponse.json({ok:true,result:{...result,rawSummary:undefined,...(result.status==='needs_setup'?{message:'Live carrier tracking is temporarily unavailable. Please use the official tracker or contact HUME support.',nextAction:undefined}:{})}},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'Tracking is temporarily unavailable. Please try again shortly.'},{status:502});}
}
