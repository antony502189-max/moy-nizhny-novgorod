export type Category = 'Памятники' | 'Парки и места отдыха' | 'Тактильный объект' | 'Набережные' | 'Достопримечательности' | 'Культурно-развлекательные организации' | 'Музеи и выставочные центры' | 'Театры' | 'Города-побратимы' | 'Мозаика';
export interface GeoPoint { lat:number; lon:number }
export interface SavedHome extends GeoPoint { label:string; district?:string }
export interface Photo { src:string; author:string; license:string; licenseUrl:string; sourceUrl:string; caption:string; historic?:boolean }
export interface Place { id: string; title: string; address: string; category: Category; description?: string; preview?: string; lat?:number; lon?:number; source?:string; descriptionSource?:string; website?:string; visitTip?:string; coordinateNote?:string; photo?:Photo }
export interface Walk { id: string; title: string; minutes: number; count: number; distance?: string; description: string; placeIds?: string[]; editorial?:boolean; durationLabel?:string; tips?:string; sources?:{title:string;url:string}[]; coverId?:string }
export interface Closure { id: string; title: string; address: string; from: string; to: string; map?: string }
export interface Favorites { places: string[]; walks: string[] }
export interface PersonalRoute { id:string; title:string; description:string; placeIds:string[] }
export interface PersonalData { routes:PersonalRoute[]; visits:Record<string,string>; notes:Record<string,string> }
export interface Preferences { houseRecordId?:string; personal?:PersonalData; onboarded: boolean; notificationPermission?: string; homeQuery: string; home?:SavedHome; favorites: Favorites }
export type RootScreen = 'home' | 'services' | 'house';
export type Screen = {name:'routes'} | { name: RootScreen } | { name: 'culture'; tab: 'places' | 'walks' } | { name: 'roads'; tab: 'list' | 'map' } | { name: 'favorites'; tab: 'places' | 'walks' } | { name: 'walk'; id: string };
