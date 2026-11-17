import {useState} from 'react';
import type {Place} from '../domain/types';
export function PlacePhoto({place,compact=false}:{place:Place;compact?:boolean}){
 const [failed,setFailed]=useState(false);const photo=place.photo;
 if(!photo||failed)return null;
 const img=<img src={import.meta.env.BASE_URL+photo.src} alt={compact?'':`${place.title}${photo.historic?' — историческая фотография':''}`} loading="lazy" onError={()=>setFailed(true)}/>;
 return compact?<span className="place-photo-thumb">{img}</span>:<figure className="place-photo">{img}<figcaption>{photo.historic?'Историческая фотография. ':''}<a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">Фото: {photo.author||'Wikimedia Commons'}</a> · <a href={photo.licenseUrl||photo.sourceUrl} target="_blank" rel="noopener noreferrer">{photo.license}</a></figcaption></figure>;
}
