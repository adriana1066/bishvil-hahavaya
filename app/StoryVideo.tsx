"use client";

import { useEffect, useRef, useState } from "react";

const AUDIO_KEY="bishvil-audio-enabled";
const AUDIO_EVENT="bishvil-audio-consent";

export function ExperienceEntryLink({label}:{label:string}) {
  const enableAudio=()=>{
    try{sessionStorage.setItem(AUDIO_KEY,"true")}catch{}
    window.dispatchEvent(new Event(AUDIO_EVENT));
  };
  return <a className="opening-enter" href="#story" onClick={enableAudio}><span>{label}</span><b>↓</b></a>;
}

export function StoryVideo({poster}:{poster:string}) {
  const videoRef=useRef<HTMLVideoElement>(null);
  const visibleRef=useRef(false);
  const [muted,setMuted]=useState(true);

  const playWithSound=()=>{
    const video=videoRef.current;
    if(!video)return;
    video.muted=false;
    setMuted(false);
    const attempt=video.play();
    attempt?.then(()=>{if(!visibleRef.current)video.pause()}).catch(()=>{
      video.muted=true;
      setMuted(true);
      if(visibleRef.current)void video.play();
    });
  };

  useEffect(()=>{
    const video=videoRef.current;
    if(!video)return;

    const onConsent=()=>playWithSound();
    window.addEventListener(AUDIO_EVENT,onConsent);

    const observer=new IntersectionObserver(([entry])=>{
      visibleRef.current=entry.isIntersecting&&entry.intersectionRatio>=.42;
      if(!visibleRef.current){video.pause();return}

      let audioWasEnabled=false;
      try{audioWasEnabled=sessionStorage.getItem(AUDIO_KEY)==="true"}catch{}
      video.muted=!audioWasEnabled;
      setMuted(!audioWasEnabled);
      const attempt=video.play();
      attempt?.catch(()=>{
        video.muted=true;
        setMuted(true);
        void video.play();
      });
    },{threshold:[0,.42,.7]});

    observer.observe(video);
    return ()=>{observer.disconnect();window.removeEventListener(AUDIO_EVENT,onConsent)};
  },[]);

  const toggleSound=()=>{
    const video=videoRef.current;
    if(!video)return;
    if(video.muted){
      try{sessionStorage.setItem(AUDIO_KEY,"true")}catch{}
      playWithSound();
    }else{
      video.muted=true;
      setMuted(true);
      try{sessionStorage.removeItem(AUDIO_KEY)}catch{}
    }
  };

  return <>
    <video ref={videoRef} className="story-video-player" src="/welcome-event.mp4" autoPlay muted loop playsInline preload="auto" poster={poster}>הדפדפן שלך אינו תומך בהצגת הסרטון.</video>
    <button className="story-video-sound" type="button" onClick={toggleSound} aria-label={muted?"הפעלת קול בסרטון":"השתקת הסרטון"}>{muted?"להפעיל קול":"להשתיק"}<span aria-hidden="true">{muted?"♪":"◖"}</span></button>
  </>;
}

export function SilentLoopVideo({src}:{src:string}) {
  const videoRef=useRef<HTMLVideoElement>(null);

  useEffect(()=>{
    const video=videoRef.current;
    if(!video)return;
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting&&entry.intersectionRatio>=.35){
        void video.play().catch(()=>{});
      }else{
        video.pause();
      }
    },{threshold:[0,.35,.7]});
    observer.observe(video);
    return ()=>observer.disconnect();
  },[]);

  return <video ref={videoRef} className="host-video-player" src={src} autoPlay muted loop playsInline preload="auto" aria-label="אירוע חי ומסודר">הדפדפן שלך אינו תומך בהצגת הסרטון.</video>;
}
