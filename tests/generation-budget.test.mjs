import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {reserveGeneration,DAILY_GENERATION_LIMIT} from '../lib/generation-budget.ts';
function database(){const sql=new DatabaseSync(':memory:');sql.exec('CREATE TABLE generation_usage (day TEXT PRIMARY KEY, attempts INTEGER NOT NULL, minute INTEGER NOT NULL, minute_attempts INTEGER NOT NULL)');return {close:()=>sql.close(),prepare(query){return {bind(...args){return {first:async()=>sql.prepare(query).get(...args)??null};}};}};}
test('atomic reservations allow only three simultaneous attempts in a minute',async()=>{const db=database();try{const results=await Promise.all(Array.from({length:10},()=>reserveGeneration(db,new Date('2026-10-13T10:00:00Z'))));assert.equal(results.filter(Boolean).length,3);assert.equal(await reserveGeneration(db,new Date('2026-10-13T10:01:00Z')),true);}finally{db.close();}});
test('daily attempt budget survives minute changes and resets on next UTC day',async()=>{const db=database();try{for(let i=0;i<DAILY_GENERATION_LIMIT;i++)assert.equal(await reserveGeneration(db,new Date(Date.UTC(2026,9,13,10,i))),true);assert.equal(await reserveGeneration(db,new Date('2026-10-13T23:59:00Z')),false);assert.equal(await reserveGeneration(db,new Date('2026-10-14T00:00:00Z')),true);}finally{db.close();}});
