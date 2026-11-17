import type {HouseRecord} from './housing.ts';
export const contactsChecked='15.11.2026';
export interface ManagementContact {id:string;name:string;gisId?:string;phone:string;phoneLabel:string;website:string;source:string;address?:string;email?:string}
export const managementContacts:ManagementContact[]=[
 {id:'nash-dom',name:'ООО «Наш Дом» · Автозаводский район',gisId:'bbd025fb-3e46-4387-bbc0-b6afc93ca9bb',phone:'+78312957453',phoneLabel:'Приёмная: +7 (831) 295-74-53',website:'https://nashdomnn.ru/',source:'https://nashdomnn.ru/index.php/kak-nas-najti/itemlist/category/24-kontakty'},
 {id:'kanavino',name:'ДК Канавинского района',gisId:'21322714-4e48-4d28-82f0-7e1dddaf8b7d',phone:'+78312681000',phoneLabel:'Круглосуточный колл-центр: +7 (831) 268-10-00',website:'https://kan-dk.ru/',source:'https://kan-dk.ru/index.php?Itemid=96&id=25&option=com_content&view=article',address:'улица Советская, 15'},
 {id:'sovetsky',name:'ДК Советского района',gisId:'db71e714-44cc-40dd-9d56-1091b1351f38',phone:'+78312681000',phoneLabel:'Круглосуточный колл-центр: +7 (831) 268-10-00',website:'https://sov-dk.ru/',source:'https://sov-dk.ru/index.php/7-duk/documenty/949-otchety-2023-god'},
 {id:'leninsky',name:'ДК Ленинского района',gisId:'5f416118-178d-4200-b958-e72a9ffb203c',phone:'+78312622622',phoneLabel:'Круглосуточный колл-центр: +7 (831) 262-26-22',website:'https://len-dk.ru/',source:'https://len-dk.ru/',address:'улица Таганская, 10, корпус 1'},
 {id:'prioksky',name:'ДК Приокского района',gisId:'41bcef8d-507a-42e3-bf76-d1edf508d60a',phone:'+78312681000',phoneLabel:'Колл-центр: +7 (831) 268-10-00',website:'https://dkpriok.com/',source:'https://dkpriok.com/priem-zh',address:'улица Батумская, 15А',email:'duk_priok@dkpriok.com'},
 {id:'nizhegorodsky',name:'ДК Нижегородского района',gisId:'9a81a88d-3271-4808-8ac7-c5721a112a3d',phone:'+78312681000',phoneLabel:'Круглосуточный контакт-центр: +7 (831) 268-10-00',website:'https://nizh-dk.ru/',source:'https://xn--80aaezhis4d.xn--p1ai/uk/',email:'office@nizh-dk.ru'},
 {id:'moskovsky',name:'ДК Московского района',gisId:'dd4f19b1-9433-4093-a022-21df07fbbc4e',phone:'+78312681000',phoneLabel:'Круглосуточный колл-центр: +7 (831) 268-10-00',website:'https://mos-dk.ru/',source:'https://mos-dk.ru/index.php?Itemid=89&id=25&option=com_content&view=article',address:'улица Люкина, 3'},
 {id:'ndk',name:'Нижегородская домоуправляющая компания (НДК)',phone:'+78314130130',phoneLabel:'Круглосуточный приём заявок: +7 (831) 413-01-30',website:'https://ndknn.ru/',source:'https://ndknn.ru/index.html',address:'Печёрский съезд, 38А, офис 101А',email:'ndknn@mail.ru'},
];
// Only a known GIS organisation ID may attach contacts to a home. Names alone are ambiguous.
export function contactForHouse(house:HouseRecord){
 try{const u=new URL(house.managementUrl||'');if(u.hostname!=='dom.gosuslugi.ru')return undefined;const m=u.hash.match(/^#!\/organizationView\/([a-f0-9-]{36})$/i);return m?managementContacts.find(c=>c.gisId===m[1].toLowerCase()):undefined}catch{return undefined}
}
export const utilityContacts=[
 {id:'water',title:'Вода и тепло · АО «ОКО»',text:'Горячая линия по услугам компании. Проверьте поставщика в квитанции.',phone:'+78312772222',phoneLabel:'+7 (831) 277-22-22',url:'https://oko-nn.ru/',source:'https://oko-nn.ru/'},
 {id:'electricity',title:'Электричество · «Нижновэнерго»',text:'Горячая линия энергетиков «Светлая линия 220».',phone:'+78002200220',phoneLabel:'8 800 220-0-220',url:'https://www.mrsk-cp.ru/for_consumers/inform_about_disconnect',source:'https://admgor.nnov.ru/news/12712'},
 {id:'gas',title:'Аварийная газовая служба',text:'Номер аварийной службы с мобильного телефона.',phone:'104',phoneLabel:'104',url:'https://www.oblgaznnov.ru/avarijnaya-sluzhba/',source:'https://www.oblgaznnov.ru/avarijnaya-sluzhba/'},
];
