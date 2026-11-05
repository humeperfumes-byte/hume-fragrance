import { z } from 'zod';
import type { CheckoutDraft } from '@/db/schema';
export const recoveryWorkflowSchema=z.object({id:z.string().min(1).max(255),leadStatus:z.enum(['new','contacted','replied','converted','lost']).optional(),leadNotes:z.string().max(10000).optional().nullable(),markContacted:z.boolean().optional(),nextFollowUpAt:z.string().datetime().optional().nullable(),overrideTotal:z.number().positive().max(1000000).optional().nullable(),overrideReason:z.string().trim().max(500).optional(),expectedWorkflowUpdatedAt:z.string().datetime().optional().nullable()}).strict();
export class RecoveryWorkflowError extends Error { constructor(message:string,public status=409){super(message);} }
export function recoveryWorkflowUpdate(draft:CheckoutDraft,data:z.infer<typeof recoveryWorkflowSchema>,hasOrder:boolean,confirmedOrder:boolean,now=new Date()){
  const breakdown=draft.pricingBreakdown||{};
  const currentWorkflow=typeof breakdown.workflowUpdatedAt==='string'?breakdown.workflowUpdatedAt:null;
  if(data.expectedWorkflowUpdatedAt!==undefined&&data.expectedWorkflowUpdatedAt!==currentWorkflow)throw new RecoveryWorkflowError('This lead was updated in another tab. Refresh before saving.');
  if(data.leadStatus==='converted'&&!confirmedOrder)throw new RecoveryWorkflowError('A confirmed order is required before marking a checkout recovered.');
  const overrideChanged=data.overrideTotal!==undefined&&data.overrideTotal!==(breakdown.overrideTotal??null);
  if(overrideChanged&&hasOrder)throw new RecoveryWorkflowError('This checkout already has an order. Review its price in Orders.');
  if(overrideChanged&&!data.overrideReason?.trim())throw new RecoveryWorkflowError('Add a reason for changing the checkout total.',400);
  const nextStatus=data.markContacted?(draft.leadStatus==='replied'?'replied':'contacted'):data.leadStatus;
  const action=data.markContacted?'contacted':overrideChanged?'price_adjusted':'workflow_saved';
  const previous=Array.isArray(breakdown.recoveryHistory)?breakdown.recoveryHistory.filter(item=>item&&typeof item==='object'&&typeof item.at==='string'&&['contacted','price_adjusted','workflow_saved','order_created'].includes(item.action)).slice(-49):[];
  return {leadStatus:nextStatus,leadNotes:data.leadNotes===undefined?undefined:data.leadNotes||null,lastContactedAt:data.markContacted?now:undefined,nextFollowUpAt:data.nextFollowUpAt===undefined?undefined:data.nextFollowUpAt?new Date(data.nextFollowUpAt):null,pricingBreakdown:{...breakdown,...(data.overrideTotal!==undefined?{overrideTotal:data.overrideTotal}:{}),...(overrideChanged?{overrideReason:data.overrideReason}:{}),workflowUpdatedAt:now.toISOString(),recoveryHistory:[...previous,{at:now.toISOString(),action,...(nextStatus?{status:nextStatus}:{})}]}};
}
