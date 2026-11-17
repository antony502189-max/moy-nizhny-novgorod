import { parsePreferences } from '../domain/logic';
import type { Preferences } from '../domain/types';
const key = 'moynn-web:preferences:v1';
export const storage = {
 read:()=>{try{return parsePreferences(localStorage.getItem(key))}catch{return parsePreferences(null)}},
 write:(preferences: Preferences)=>{try{localStorage.setItem(key,JSON.stringify(preferences));return true}catch{return false}},
};
