/** Only wrap read operations: a dropped connection must never cause a write to replay. */
export async function retryGrowthRead<T>(read:()=>Promise<T>):Promise<T>{
 for(let attempt=0;;attempt++){
  try{return await read();}catch(error){let cause:unknown=error,retryable=false;for(let depth=0;cause&&typeof cause==='object'&&depth<5;depth++){const e=cause as {code?:string;cause?:unknown};if(e.code&&(['ECONNRESET','ECONNREFUSED','ETIMEDOUT','CONNECT_TIMEOUT','CONNECTION_CLOSED','ENOTFOUND','EAI_AGAIN','57014'].includes(e.code)||e.code.startsWith('08')))retryable=true;cause=e.cause;}if(attempt||!retryable)throw error;await new Promise(resolve=>setTimeout(resolve,250));}
 }
}
