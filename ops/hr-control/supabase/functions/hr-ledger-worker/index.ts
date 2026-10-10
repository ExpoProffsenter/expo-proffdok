import * as sdk from 'npm:@vercel/blob@2.8.1';
import {Agent,setGlobalDispatcher} from 'npm:undici@6.29.0';
import {createIdentityDispatcher} from '../hr-cloud-probe/identity-dispatcher.mjs';
import {createWorkerHandler} from './worker.mjs';
setGlobalDispatcher(createIdentityDispatcher(new Agent()));
Deno.serve(createWorkerHandler({sdk,env:name=>Deno.env.get(name)}));
