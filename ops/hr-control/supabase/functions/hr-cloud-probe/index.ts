// Control project only. No application DB connection, ack, bootstrap or scheduler.
import * as sdk from 'npm:@vercel/blob@2.8.1';
import {Agent,setGlobalDispatcher} from 'npm:undici@6.29.0';
import {createIdentityDispatcher} from './identity-dispatcher.mjs';
import {createProbeHandler} from './probe.mjs';
setGlobalDispatcher(createIdentityDispatcher(new Agent()));
Deno.serve(createProbeHandler({sdk,env:name=>Deno.env.get(name)}));
