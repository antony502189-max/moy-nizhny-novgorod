import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Home, LayoutGrid, MapPin, MapPinned, ChevronLeft, Info, Heart, Navigation, Route, Search, ChevronDown, ArrowUp, Clock3, CalendarDays, GalleryVerticalEnd, ExternalLink, Check, FileText } from 'lucide-react';
import { places, walks, closures, categories, serviceInfo } from './domain/data';
import { filterPlaces, plural, toggleFavorite } from './domain/logic';
import type { Category, Place, Walk, Closure, Screen, RootScreen, Preferences } from './domain/types';
import { storage } from './platform/storage';
import { integrations, objectMapUrl } from './platform/integrations';
import { PlacePhoto } from './components/PlacePhoto';
import { Sheet } from './components/Sheet';
import { MapSurface } from './components/MapSurface';
import { Onboarding } from './components/Onboarding';
import { LiveMap } from './components/LiveMap';
import { LocationLookup } from './components/LocationLookup';
import { HousePanel } from './components/HousePanel';
import { PersonalRoutes } from './components/PersonalRoutes';
import { Narration } from '../src/core/Narration';
import { PlaceJournal } from './components/PlaceJournal';
import { emptyPersonal } from './domain/personal';
import { Settings } from './components/Settings';
import { distanceKm, routeUrl, validPoint } from './domain/geo';
import type { GeoPoint } from './domain/types';

const assets = import.meta.env.BASE_URL + 'assets/';

type Modal = {kind:'settings'}|{kind:'nearby';position?:GeoPoint}|{kind:'info';service:keyof typeof serviceInfo}|{kind:'place';place:Place}|{kind:'closure';closure:Closure}|{kind:'notice';title:string;message:string};
type MapTarget={title:string;address:string;walk?:Walk;lat?:number;lon?:number};

function screenPath(screen:Screen):string {return screen.name==='walk'?`/walk/${screen.id}`:'tab'in screen?`/${screen.name}/${screen.tab}`:`/${screen.name}`}
function parseScreen():Screen {
 const parts=window.location.hash.split('?')[0].replace(/^#\/?/,'').split('/');
 if(parts[0]==='routes')return {name:'routes'};
 if(parts[0]==='walk'&&walks.some(w=>w.id===parts[1]))return {name:'walk',id:parts[1]};
 if(parts[0]==='culture'||parts[0]==='favorites')return {name:parts[0],tab:parts[1]==='walks'?'walks':'places'};
 if(parts[0]==='roads')return {name:'roads',tab:parts[1]==='map'?'map':'list'};
 return {name:parts[0]==='house'?'house':parts[0]==='services'?'services':'home'};
}
function IconButton({label,children,onClick,active=false}:{label:string;children:ReactNode;onClick:()=>void;active?:boolean}){return <button type="button" className={`icon-button ${active?'active':''}`} aria-label={label} onClick={onClick}>{children}</button>}
function PageHeader({title,service=false,onBack,onInfo}:{title:string;service?:boolean;onBack?:()=>void;onInfo?:()=>void}){
 return <header className={`page-header ${service?'service-header':'simple-header'}`}>
  {onBack&&<button className="back-button" onClick={onBack} aria-label="Назад"><ChevronLeft size={29}/></button>}
  <div><h1>{title}</h1>{onInfo&&<button className="info-link" onClick={onInfo}><Info size={14}/>О сервисе</button>}</div>
 </header>;
}
function Tabs({items,value,onChange,compact=false}:{items:{value:string;label:string}[];value:string;onChange:(value:string)=>void;compact?:boolean}){
 return <div className={`tabs ${compact?'compact-tabs':''}`} role="tablist">{items.map(item=><button type="button" key={item.value} role="tab" aria-selected={value===item.value} className={value===item.value?'selected':''} onClick={()=>onChange(item.value)}>{item.label}</button>)}</div>;
}
function Expandable({text,lines=6}:{text:string;lines?:number}){
 const [expanded,setExpanded]=useState(false);
 return <div className="expandable"><p className={expanded?'expanded':'clamped'} style={!expanded?{WebkitLineClamp:lines}:undefined}>{text}</p>{text.length>210&&<button className="text-link" onClick={()=>setExpanded(!expanded)}>{expanded?'Свернуть':'Читать далее'}</button>}</div>;
}
function ServiceTile({service,onClick,list=false}:{service:'roads'|'culture';onClick:()=>void;list?:boolean}){
 const roads=service==='roads';
 return <button className={`service-tile ${list?'service-list-tile':''}`} onClick={onClick}>
  {roads?<Route size={22}/>:<MapPinned size={22}/>}
  <span className="service-label"><strong>{roads?'Перекрытия дорог':'Культурные объекты'}</strong><small>{roads?'Улицы, сроки и карта':'Места, прогулки и аудиогид'}</small></span><span aria-hidden="true">→</span>
 </button>;
}
function PlaceCard({place,onOpen,onMap,onRemove}:{place:Place;onOpen:()=>void;onMap:()=>void;onRemove?:()=>void}){
 return <article className="list-card place-card"><button className="card-main" onClick={onOpen}><PlacePhoto key={place.id} place={place} compact/><h3>{place.title}</h3><span className="meta address"><MapPin size={18}/><span>{place.address}</span></span></button><div className="card-actions">{onRemove&&<IconButton label={`Убрать ${place.title} из избранного`} onClick={onRemove} active><Heart size={21} fill="currentColor"/></IconButton>}<IconButton label={`Как добраться: ${place.title}`} onClick={onMap}><Route size={23}/></IconButton></div></article>;
}
function WalkCard({walk,onOpen,onRemove}:{walk:Walk;onOpen:()=>void;onRemove?:()=>void}){
 return <article className="list-card walk-card"><button className="card-main" onClick={onOpen}>{walk.coverId&&places.find(p=>p.id===walk.coverId)&&<PlacePhoto place={places.find(p=>p.id===walk.coverId)!} compact/>}<h3>{walk.title}</h3><p className="two-lines">{walk.description}</p><div className="inline-meta"><span><GalleryVerticalEnd size={16}/>{walk.count} {plural(walk.count,'объект','объекта','объектов')}</span><span><Clock3 size={16}/>{walk.durationLabel|| (walk.editorial?'Авторская прогулка':`${walk.minutes} ${plural(walk.minutes,'минута','минуты','минут')}`)}</span></div></button>{onRemove&&<button className="favorite-remove" onClick={onRemove} aria-label={`Убрать ${walk.title} из избранного`}><Heart size={19} fill="currentColor"/></button>}</article>;
}
function Filter({value,onChange,items,placeholder}:{value:string;onChange:(v:string)=>void;items:string[];placeholder:string}){
 const[open,setOpen]=useState(false);const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!open)return;const close=(e:PointerEvent)=>{if(!ref.current?.contains(e.target as Node))setOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[open]);
 return <div className="filter" ref={ref} onKeyDown={e=>{if(e.key==='Escape')setOpen(false)}}><button className="filter-button" aria-label={placeholder} aria-expanded={open} aria-haspopup="listbox" onClick={()=>setOpen(!open)}><span>{value||placeholder}</span><ChevronDown size={18} className={open?'rotated':''}/></button>{open&&<div role="listbox" aria-label={placeholder} className="filter-options">{['',...items].map(item=><button key={item} role="option" aria-selected={value===item} onClick={()=>{onChange(item);setOpen(false)}}>{item||'Все'}{value===item&&<Check size={14}/>}</button>)}</div>}</div>;
}

export default function App(){
 const initialSharedRoute=useRef(location.hash.includes('?route=')?location.hash:'');
 const [prefs,setPrefs]=useState<Preferences>(()=>storage.read());
 const [screen,setScreen]=useState<Screen>(parseScreen);
 const [onboarding,setOnboarding]=useState(()=>new URLSearchParams(location.search).has('intro')||(!storage.read().onboarded&&!location.hash));
 const [modal,setModal]=useState<Modal|null>(null);
 const [mapTarget,setMapTarget]=useState<MapTarget|null>(null);
 const [search,setSearch]=useState('');
 const [category,setCategory]=useState<Category|''>('');
 const [walkFilter,setWalkFilter]=useState('');
 const [walkTab,setWalkTab]=useState('description');
 const [scrolled,setScrolled]=useState(false);
 const [toast,setToast]=useState('');
 const viewport=useRef<HTMLDivElement>(null);
 const positions=useRef(new Map<string,number>());
 const depth=useRef(0);
 const initialRoute=useRef(screen);
 const path=screenPath(screen);
 const hasBottomNav=['home','services','house'].includes(screen.name);
 const modalOpen=!!modal||!!mapTarget;
 useEffect(()=>{if(!storage.write(prefs))setToast('Не удалось сохранить данные. Проверьте настройки хранилища браузера.')},[prefs]);
 useEffect(()=>{
  history.replaceState({screen:initialRoute.current,depth:0},'',initialSharedRoute.current||`#${screenPath(initialRoute.current)}`);
  const pop=(event:PopStateEvent)=>{setModal(null);setMapTarget(null);depth.current=event.state?.depth||0;setScreen(event.state?.screen||parseScreen())};
  window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);
 },[]);
 useLayoutEffect(()=>{const top=positions.current.get(path)||0;if(viewport.current)viewport.current.scrollTop=top;setScrolled(top>320)},[path]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),3500);return()=>clearTimeout(timer)},[toast]);
 function navigate(next:Screen,replace=false){
  positions.current.set(path,viewport.current?.scrollTop||0);
  if(!replace)depth.current++;
  history[replace?'replaceState':'pushState']({screen:next,depth:depth.current},'',`#${screenPath(next)}`);
  setScreen(next);setModal(null);setMapTarget(null);
 }
 function back(){positions.current.set(path,viewport.current?.scrollTop||0);if(depth.current>0)history.back();else navigate({name:'home'},true)}
 function notice(title:string,message:string){setModal({kind:'notice',title,message})}
 function external(kind:keyof typeof integrations){window.open(integrations[kind],'_blank','noopener,noreferrer')}
 function favorite(kind:'places'|'walks',id:string){setPrefs(p=>({...p,favorites:toggleFavorite(p.favorites,kind,id)}))}
 function openPlace(place:Place){setModal({kind:'place',place})}
 function openMap(place:Place){setMapTarget({...place})}
 function openWalk(walk:Walk){setWalkTab('description');navigate({name:'walk',id:walk.id})}
 function root(name:RootScreen){navigate({name});}
 function openService(service:'roads'|'culture'){navigate(service==='roads'?{name:'roads',tab:'list'}:{name:'culture',tab:'places'})}
 function done(){setPrefs(p=>({...p,onboarded:true}));setOnboarding(false)}
 function mapChoice(provider:'yandex'|'2gis'){
  if(!mapTarget)return;
  const points=mapTarget.walk?.placeIds?.map(id=>places.find(p=>p.id===id)!).filter(Boolean);
  const url=points?.length?routeUrl(points):objectMapUrl(provider,mapTarget.title,mapTarget.address);
  window.open(url,'_blank','noopener,noreferrer');
 }
 function locateMe(){
  if(!navigator.geolocation){notice('Геолокация недоступна','Откройте приложение в браузере с поддержкой геолокации.');return}
  setToast('Определяем ваше местоположение…');
  navigator.geolocation.getCurrentPosition(p=>{setToast('');setModal({kind:'nearby',position:{lat:p.coords.latitude,lon:p.coords.longitude}})},e=>{setToast('');notice('Не удалось определить местоположение',e.code===1?'Разрешите доступ к геолокации в настройках браузера. Карта города доступна без разрешения.':'Не удалось получить координаты. Проверьте геолокацию и попробуйте ещё раз.')},{enableHighAccuracy:false,timeout:12000,maximumAge:60000});
 }
 const personal=prefs.personal||emptyPersonal();
 const updatePersonal=(value:typeof personal)=>setPrefs(p=>({...p,personal:value}));
 const knownPlaces=places.filter((p):p is Place & GeoPoint=>validPoint(p));
 const nearbyPlaces=modal?.kind==='nearby'&&modal.position?[...knownPlaces].sort((a,b)=>distanceKm(modal.position!,a)-distanceKm(modal.position!,b)):knownPlaces;

 const tabs=[{value:'places',label:'Объекты'},{value:'walks',label:'Маршруты'}];
 const currentWalk=screen.name==='walk'?walks.find(w=>w.id===screen.id)!:null;
 const favoritePlaceCards=prefs.favorites.places.map(id=>places.find(p=>p.id===id)).filter((p):p is Place=>!!p);
 const favoriteWalkCards=prefs.favorites.walks.map(id=>walks.find(w=>w.id===id)).filter((w):w is Walk=>!!w);

 return <div className="desktop-stage"><div className="app-shell">
  {onboarding?<Onboarding onDone={done} onCommunity={()=>external('community')} onNotification={permission=>{setPrefs(p=>({...p,notificationPermission:permission}));setToast(permission==='granted'?'Разрешение получено. Доставка уведомлений требует подключения сервиса.':permission==='denied'?'Уведомления отключены в браузере.':'Можно продолжить без уведомлений.')}}/>:<>
  <div className={`screen-scroll screen-${screen.name} ${hasBottomNav?'with-bottom-nav':''}`} ref={viewport} {...(modalOpen ? { inert: '' } : {})} onScroll={e=>setScrolled(e.currentTarget.scrollTop>320)}>
   {screen.name==='home'&&<main className="home-screen">
    <header className="resident-cover">
     <h1 className="resident-title">Мой Нижний Новгород</h1>
     <img src={assets+'city-banner-teal.webp'} width={1440} height={552} alt="Приложение для жителей города"/>
    </header>
    <div className="home-surface"><a className="guest-switch" href="./index.html#/now">Нижний для гостей ↗</a><section className="city-services"><h2>Городские сервисы</h2><div className="service-carousel"><ServiceTile service="roads" onClick={()=>openService('roads')}/><ServiceTile service="culture" onClick={()=>openService('culture')}/></div></section>
    <button className="home-personal" onClick={()=>navigate({name:'routes'})}><Route size={24}/><span><strong>Мои маршруты и дневник</strong><small>Прогулки, посещения и заметки</small></span><span>›</span></button>
    <section className="city-contact">
     <h2>Общение с городом</h2>
     <button className="city-link city-request" onClick={()=>external('requests')}>
      <span className="city-request-icon"><FileText size={22} aria-hidden="true"/></span>
      <span className="city-link-label"><strong>Подать обращение</strong><small>Платформа «Лобачевский»</small></span>
      <ExternalLink size={16} aria-hidden="true"/>
     </button>
     <button className="city-link" onClick={()=>external('mayor')}>
      <img className="mayor-portrait" src={assets+'mayor.webp'} width={44} height={44} alt=""/>
      <span className="city-link-label"><strong>Юрий Шалабаев</strong><small>Канал главы города в MAX</small></span>
      <ExternalLink size={16} aria-hidden="true"/>
     </button>
    </section></div>
   </main>}
   {screen.name==='services'&&<main><PageHeader title="Все сервисы"/><div className="all-services"><ServiceTile service="roads" list onClick={()=>openService('roads')}/><ServiceTile service="culture" list onClick={()=>openService('culture')}/></div><div className="service-extras"><button className="primary-button" onClick={()=>navigate({name:'routes'})}>Мои маршруты и дневник</button><button className="text-link" onClick={()=>setModal({kind:'settings'})}>Данные и настройки</button></div></main>}
   {screen.name==='routes'&&<main><PageHeader title="Мои прогулки" onBack={back}/><PersonalRoutes data={personal} onChange={updatePersonal} onPlace={openPlace}/></main>}
   {screen.name==='house'&&<main><PageHeader title="Мой дом" service onInfo={()=>setModal({kind:'info',service:'house'})}/><HousePanel prefs={prefs} onChange={setPrefs}/></main>}
   {screen.name==='culture'&&<main><PageHeader title="Культурные объекты" service onBack={back} onInfo={()=>setModal({kind:'info',service:'culture'})}/><div className="white-surface"><Tabs items={tabs} value={screen.tab} onChange={v=>navigate({name:'culture',tab:v as 'places'|'walks'},true)}/><div className="catalog-controls"><Filter value={screen.tab==='places'?category:walkFilter} onChange={v=>screen.tab==='places'?setCategory(v as Category|''):setWalkFilter(v)} items={screen.tab==='places'?categories:walks.map(w=>w.title)} placeholder={screen.tab==='places'?'Выберите вид объекта':'Тема маршрута'}/>{screen.tab==='places'&&<IconButton label="Объекты рядом" onClick={()=>setModal({kind:'nearby'})}><Navigation size={25}/></IconButton>}<IconButton label="Избранное" onClick={()=>navigate({name:'favorites',tab:screen.tab})}><Heart size={27}/></IconButton></div>{screen.tab==='places'&&<div className="catalog-search"><Search size={18}/><input aria-label="Поиск культурных объектов" placeholder="Поиск по названию или адресу" value={search} onChange={e=>setSearch(e.target.value)}/></div>}<div className="card-list">{screen.tab==='walks'&&<button className="primary-button" onClick={()=>navigate({name:'routes'})}>Мои маршруты · Создать прогулку</button>}{screen.tab==='places'?filterPlaces(places,category).filter(p=>`${p.title} ${p.address}`.toLowerCase().includes(search.toLowerCase().trim())).map(place=><PlaceCard key={place.id} place={place} onOpen={()=>openPlace(place)} onMap={()=>openMap(place)}/>):walks.filter(w=>!walkFilter||w.title===walkFilter).map(walk=><WalkCard key={walk.id} walk={walk} onOpen={()=>openWalk(walk)}/>)}{screen.tab==='places'&&!filterPlaces(places,category).filter(p=>`${p.title} ${p.address}`.toLowerCase().includes(search.toLowerCase().trim())).length&&<div className="empty-state"><p>Объекты не найдены</p><button className="text-link" onClick={()=>{setCategory('');setSearch('')}}>Показать все объекты</button></div>}</div></div></main>}
   {screen.name==='favorites'&&<main><PageHeader title="Избранное" onBack={back}/><Tabs items={tabs} value={screen.tab} onChange={v=>navigate({name:'favorites',tab:v as 'places'|'walks'},true)}/>{(screen.tab==='places'?favoritePlaceCards:favoriteWalkCards).length===0?<div className="empty-state favorites-empty"><p>Пока нет ничего в избранных</p><button className="text-link tiny-pill" onClick={()=>navigate({name:'culture',tab:screen.tab})}>Добавить</button></div>:<div className="card-list">{screen.tab==='places'?favoritePlaceCards.map(p=><PlaceCard key={p.id} place={p} onOpen={()=>openPlace(p)} onMap={()=>openMap(p)} onRemove={()=>favorite('places',p.id)}/>):favoriteWalkCards.map(w=><WalkCard key={w.id} walk={w} onOpen={()=>openWalk(w)} onRemove={()=>favorite('walks',w.id)}/>)}</div>}</main>}
   {screen.name==='roads'&&<main><PageHeader title="Перекрытия дорог" service onBack={back} onInfo={()=>setModal({kind:'info',service:'roads'})}/><div className="white-surface"><section className="traffic-entry"><h2>Что на дорогах сейчас</h2><p>Посмотрите пробки, дорожные работы и перекрытия Нижнего Новгорода в Яндекс.Картах.</p><a className="primary-button traffic-button" href={integrations.traffic} target="_blank" rel="noopener noreferrer">Дорожная ситуация в Яндекс.Картах <ExternalLink size={18}/></a><p className="source-note">Откроется отдельная вкладка. Если значки не видны, включите в Картах «Пробки» → «Дорожные события».</p></section><Tabs items={[{value:'list',label:'Архив списком'},{value:'map',label:'Карта города'}]} value={screen.tab} onChange={v=>navigate({name:'roads',tab:v as 'list'|'map'},true)}/><p className="data-status">Ниже — архив из записи экрана. Он не показывает действующие перекрытия. <a href={integrations.roads} target="_blank" rel="noopener noreferrer">Проверить на сайте города ↗</a></p>{screen.tab==='list'?<div className="card-list closure-list">{closures.map(closure=><article className="list-card closure-card" key={closure.id}><button className="card-main" onClick={()=>setModal({kind:'closure',closure})}><h3>Ремонт</h3><span className="meta"><CalendarDays size={17}/><span>{closure.from} – {closure.to}</span></span><span className="meta address"><MapPin size={18}/><span>{closure.address}</span></span></button><div className="card-actions"><IconButton label={`Карта перекрытия: ${closure.address}`} onClick={()=>setModal({kind:'closure',closure})}><Route size={23}/></IconButton></div></article>)}</div>:<div className="road-map-wrapper"><LiveMap/><p className="source-note">Выберите адрес в списке, чтобы найти его на карте. Границы действующих ограничений пока не подключены.</p><details><summary>Схема из записи</summary><MapSurface overview/></details></div>}</div></main>}
   {currentWalk&&<main className="walk-detail"><PageHeader title="О маршруте" onBack={back}/><div className="walk-content"><LiveMap walkIds={currentWalk.placeIds} points={knownPlaces.filter(p=>currentWalk.placeIds?.includes(p.id)).sort((a,b)=>currentWalk.placeIds!.indexOf(a.id)-currentWalk.placeIds!.indexOf(b.id)).map(p=>({...p,title:p.title}))} onSelect={id=>openPlace(places.find(p=>p.id===id)!)}/><div className="walk-heading"><h2>{currentWalk.title}</h2><IconButton label={prefs.favorites.walks.includes(currentWalk.id)?'Убрать маршрут из избранного':'Добавить маршрут в избранное'} onClick={()=>favorite('walks',currentWalk.id)} active={prefs.favorites.walks.includes(currentWalk.id)}><Heart size={23} fill={prefs.favorites.walks.includes(currentWalk.id)?'currentColor':'none'}/></IconButton></div><div className="walk-metadata"><span className="meta"><Clock3 size={18}/>Продолжительность — {currentWalk.durationLabel||(currentWalk.editorial?'уточняется в навигаторе':`${currentWalk.minutes} минут`)}</span><span className="meta"><MapPin size={18}/>Протяжённость — {currentWalk.distance?`${currentWalk.distance} км`:'рассчитывается в навигаторе'}</span></div><p className="source-note">{currentWalk.editorial?'Маршрут составлен для этой версии.':'Последовательность точек из исходного приложения.'} На карте показаны остановки и доступные пешеходные участки по данным OpenStreetMap.</p><a className="primary-button" href={'./index.html#/guide/walk/'+currentWalk.id}>Пройти с аудиогидом</a><Tabs compact items={[{value:'description',label:'Описание'},{value:'places',label:'Объекты'}]} value={walkTab} onChange={setWalkTab}/>{walkTab==='description'?<><Expandable text={currentWalk.description}/>{currentWalk.tips&&<p className="walk-tips">{currentWalk.tips}</p>}{currentWalk.sources&&<details className="content-sources"><summary>Об этой прогулке</summary><p>Авторская последовательность остановок. Источники сведений о местах:</p>{currentWalk.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a>)}</details>}{!currentWalk.placeIds&&<p className="unavailable-note">Полное описание этого маршрута в записи не открывали.</p>}</>:<div className="walk-places">{currentWalk.placeIds?currentWalk.placeIds.map(id=>{const p=places.find(p=>p.id===id)!;return <button key={id} className="walk-place-row" onClick={()=>openPlace(p)}><PlacePhoto key={p.id} place={p} compact/><span><strong>{p.title}</strong><span className="two-lines">{p.description||p.preview}</span></span></button>}):<p className="unavailable-note">Состав этого маршрута не показан в записи.</p>}</div>}<button className="secondary-button" disabled={personal.routes.length>=100} onClick={()=>{updatePersonal({...personal,routes:[...personal.routes,{id:crypto.randomUUID(),title:currentWalk.title,description:currentWalk.description,placeIds:currentWalk.placeIds||[]}]});navigate({name:'routes'})}}>Сохранить копию в мои маршруты</button><button className="primary-button route-build" onClick={()=>setMapTarget({title:currentWalk.title,address:'Нижний Новгород',walk:currentWalk})}>Построить маршрут на карте</button></div></main>}
  </div>
  {hasBottomNav&&<nav className="bottom-nav" aria-label="Основная навигация" {...(modalOpen ? { inert: '' } : {})}>{([{name:'home',label:'Главная',Icon:Home},{name:'services',label:'Сервисы',Icon:LayoutGrid},{name:'house',label:'Мой дом',Icon:MapPinned}] as const).map(({name,label,Icon})=><button key={name} className={screen.name===name?'selected':''} aria-current={screen.name===name?'page':undefined} onClick={()=>root(name)}><Icon size={26} strokeWidth={1.9}/><span>{label}</span></button>)}</nav>}
  {scrolled&&!modalOpen&&!hasBottomNav&&<button className="scroll-top" onClick={()=>viewport.current?.scrollTo({top:0,behavior:'smooth'})} aria-label="Наверх"><ArrowUp size={22}/></button>}
  </>}

  {modal&&<Sheet key={modal.kind==='place'?modal.place.id:modal.kind==='closure'?modal.closure.id:modal.kind} title={modal.kind==='settings'?'Данные и настройки':modal.kind==='nearby'?'Объекты рядом':modal.kind==='info'?'О сервисе':modal.kind==='place'?'О культурном объекте':modal.kind==='closure'?'О перекрытии':modal.title} onClose={()=>setModal(null)} className={modal.kind==='closure'?'closure-sheet':modal.kind==='place'?'place-sheet':''}>
   {modal.kind==='settings'&&<Settings prefs={prefs} onRestore={setPrefs}/>}
   {modal.kind==='nearby'&&<><button className="primary-button" onClick={locateMe}>Показать рядом со мной</button><LiveMap points={knownPlaces} position={modal.position} onSelect={id=>openPlace(places.find(p=>p.id===id)!)}/><p className="source-note">{knownPlaces.length} объектов с проверенными координатами. Расстояние по прямой.</p>{nearbyPlaces.map(p=><button className="nearby-row" key={p.id} onClick={()=>openPlace(p)}><span>{p.title}</span><small>{modal.position?`${distanceKm(modal.position,p).toFixed(1)} км`:'Подробнее'}</small></button>)}</>}
   {modal.kind==='info'&&<p className="info-text">{serviceInfo[modal.service]}</p>}
   {modal.kind==='notice'&&<><p className="info-text">{modal.message}</p><button className="primary-button notice-ok" onClick={()=>setModal(null)}>Понятно</button></>}
   {modal.kind==='place'&&<><h3>{modal.place.title}</h3><PlacePhoto key={modal.place.id} place={modal.place}/><p className="meta address"><MapPin size={17}/><span>{modal.place.address}</span></p><button className="text-link directions-link" onClick={()=>openMap(modal.place)}><Info size={15}/>Как добраться ›</button>{modal.place.description?<Expandable text={modal.place.description}/>:<><p className="info-text">{modal.place.preview}</p><p className="unavailable-note">Полное описание этого объекта не показано в записи.</p></>}{modal.place.visitTip&&<p className="visit-tip">{modal.place.visitTip}</p>}{modal.place.coordinateNote&&<p className="source-note">{modal.place.coordinateNote}</p>}{modal.place.website&&<a className="text-link source-link" href={modal.place.website} target="_blank" rel="noopener noreferrer">Официальный сайт ↗</a>}{modal.place.descriptionSource&&<a className="source-note source-link" href={modal.place.descriptionSource} target="_blank" rel="noopener noreferrer">Источник справки ↗</a>}{modal.place.source&&<a className="source-note source-link" href={modal.place.source} target="_blank" rel="noopener noreferrer">Источник координат ↗</a>}<button className={`favorite-action ${prefs.favorites.places.includes(modal.place.id)?'saved':''}`} onClick={()=>favorite('places',modal.place.id)}><Heart size={18} fill={prefs.favorites.places.includes(modal.place.id)?'currentColor':'none'}/>{prefs.favorites.places.includes(modal.place.id)?'В избранном':'Добавить в избранное'}</button><Narration id={modal.place.id} lang="ru"/><a className="text-link" href={'./index.html#/guide/'+modal.place.id}>Истории гостей и карта →</a><PlaceJournal id={modal.place.id} data={personal} onChange={updatePersonal}/></>}
   {modal.kind==='closure'&&<><LocationLookup query={modal.closure.address}/>{modal.closure.map&&<details><summary>Схема из записи экрана</summary><MapSurface image={modal.closure.map}/></details>}<h3 className="closure-title">Ремонт</h3><p className="source-note">Архив из записи. Сроки и ограничения требуют проверки.</p><a className="primary-button traffic-button" href={integrations.traffic} target="_blank" rel="noopener noreferrer">Проверить дорожную ситуацию <ExternalLink size={18}/></a><a className="text-link" target="_blank" rel="noopener noreferrer" href={objectMapUrl('yandex','',`Нижний Новгород, ${modal.closure.address}`)}>Открыть адрес в картах ↗</a><p className="meta"><CalendarDays size={20}/>{modal.closure.from} – {modal.closure.to}</p><p className="meta address"><MapPin size={21}/><span>{modal.closure.address}</span></p></>}
  </Sheet>}
  {mapTarget&&<Sheet title="Выберите, где продолжить" className="map-chooser" layer={2} onClose={()=>setMapTarget(null)}><p>{mapTarget.title}</p>{mapTarget.walk?<LiveMap points={mapTarget.walk.placeIds?.map(id=>places.find(p=>p.id===id)!).filter((p):p is Place & GeoPoint=>!!p&&validPoint(p))||[]}/>:validPoint(mapTarget)?<LiveMap points={[mapTarget]}/>:<LocationLookup query={mapTarget.title}/>}<div className="map-options"><button onClick={()=>mapChoice('yandex')}>Яндекс.Карты</button>{!mapTarget.walk&&<button onClick={()=>mapChoice('2gis')}>2ГИС</button>}</div><button className="map-cancel" onClick={()=>setMapTarget(null)}>Отмена</button></Sheet>}
  {toast&&<div className="toast" role="status">{toast}</div>}
 </div></div>;
}
