import { useState } from 'react';
import { photos } from '../domain/photos';

const pages = [
  { title:'Места и прогулки', text:'Откройте объект на карте, послушайте историю и выберите маршрут. Сохранённые прогулки доступны без сети.', photo:'kremlin' },
  { title:'Сведения о доме', text:'Найдите дом по улице и номеру. В карточке есть сведения из реестра ЖКХ и контакты обслуживающей организации.', photo:'rozhdestvenskaya' },
  { title:'Городские сообщения', text:'Новости и объявления доступны в официальном канале. Автоматические уведомления в этой версии отключены.', photo:'fedorovsky' },
  { title:'Сообщество города', text:'Откройте городской канал или перейдите в приложение.', photo:'garden' },
];
export function Onboarding({onDone,onNotification,onCommunity}:{onDone:()=>void;onNotification:(p:string)=>void;onCommunity:()=>void}){
  const [step,setStep]=useState(0);
  const slide=pages[step],photo=photos[slide.photo];
  return <section className="onboarding" aria-label={`Знакомство с приложением, шаг ${step+1} из ${pages.length}`}>
    <figure><img className="onboarding-art" src={import.meta.env.BASE_URL+photo.src} alt=""/>
      <figcaption><a href={photo.sourceUrl} target="_blank" rel="noreferrer">{photo.author} · {photo.license}</a></figcaption></figure>
    <div className="onboarding-copy"><h1>{slide.title}</h1><p>{slide.text}</p></div>
    <div className="onboarding-actions">{step<3?
      <button className="onboard-primary" onClick={()=>{if(step===2)onNotification('off');setStep(step+1)}}>{step===2?'Продолжить без уведомлений':'Далее'}</button>:
      <button className="onboard-primary" onClick={()=>{onDone();onCommunity()}}>Открыть городской канал</button>}
      <footer><span>{step+1} / {pages.length}</span><button onClick={onDone}>{step===3?'В приложение':'Пропустить'}</button></footer>
    </div>
  </section>;
}
