export type SectionId = "story" | "welcome" | "recognition" | "host" | "comparison" | "aunt" | "service" | "promise" | "events" | "food" | "suppliers" | "process" | "contact";

export type MediaSetting = { x:number; y:number; fit:"cover"|"contain" };

export type SiteContent = {
  site: {
    browserTitle:string; description:string; brand:string;
    headerVisible:boolean; navigationVisible:boolean;
    navigation:Array<{label:string;href:string;visible:boolean}>; whatsappNumber:string; whatsappMessage:string;
    footerVisible:boolean; footerText:string; footerImage:string; footerAlt:string;
  };
  opening: {
    right: string; left: string; enter: string;
    rightX: number; rightY: number; rightSize: number; rightWidth: number;
    leftX: number; leftY: number; leftSize: number; leftWidth: number;
    logoWidth: number; logoBottom: number;
    desktopImage:string; mobileImage:string; imageAlt:string;
    journeyStart:string; journeyBridge:string; journeyArrival:string;
  };
  sectionOrder: SectionId[];
  hiddenSections: SectionId[];
  mediaSettings: Record<string,MediaSetting>;
  story: { eyebrow: string; eyebrowSize: number; title: string; titleSize: number; titleY: number; accent: string; accentSize: number; accentY: number; titleBottom: number; text: string; textSize: number; image: string; imageAlt:string; visionLabel:string };
  welcome: { eyebrow: string; title: string; accent: string; text: string; image: string; video:string };
  recognition: { kicker: string; title: string; large: string; text1: string; text2: string };
  host: { kicker: string; title: string; text: string; quote: string; image: string; video:string;
    comparison:Array<{image:string;alt:string}>; auntVideo:string; auntPoster:string; auntLabel:string };
  service: { kicker: string; title: string; origin: string; lead: string; image:string; imageAlt:string; items: Array<{title:string;text:string}> };
  promise: { kicker: string; title: string; accent: string; items: string[] };
  events: { kicker: string; title: string; items: string[] };
  food: { kicker: string; title: string; text1: string; text2: string; image:string; imageAlt:string; suppliersTitle:string;
    suppliers:Array<{name:string;owner:string;image:string;imageAlt:string;specialty:string;fit:string;links:Array<{label:string;href:string}>}> };
  process: { kicker: string; title: string; items: string[] };
  contact: { kicker: string; title: string; button: string; phone: string };
};

export const defaultSiteContent: SiteContent = {
  site:{browserTitle:"בשביל ההוויה | נוֹצֶרֶת מרחבי אירוח",description:"ניהול ותפעול מרחבי אירוח בזמן ההגשה, כדי שהנראות, השפע, הסדר והתחושה יישמרו לאורך האירוע כולו.",brand:"בשביל ההוויה",headerVisible:true,navigationVisible:true,navigation:[{label:"החוויה",href:"#story",visible:true},{label:"נוצרת",href:"#service",visible:true},{label:"למי מתאים",href:"#events",visible:true},{label:"נדבר על האירוע",href:"#contact",visible:true}],whatsappNumber:"972546550816",whatsappMessage:"שלום אדריאנה, אשמח לשמוע עוד על שירות נצירת מרחב האירוח",footerVisible:true,footerText:"אדריאנה הראל · נוצרת מרחבי אירוח",footerImage:"/footer-logo.jpg",footerAlt:"בשביל ההוויה"},
  opening:{right:"נוצרת",left:"מרחבי אירוח",enter:"כל מה שיצרתם. כל מה שביקשתם להעניק.",rightX:4.5,rightY:13.5,rightSize:13.45,rightWidth:70,leftX:4.5,leftY:13.5,leftSize:13.45,leftWidth:47,logoWidth:75,logoBottom:0,desktopImage:"/opening-desktop-approved.png",mobileImage:"/opening-android-approved.png",imageAlt:"נוצרת מרחבי אירוח — בשביל ההוויה",journeyStart:"השביל",journeyBridge:"אל",journeyArrival:"האירוח החדש"},
  sectionOrder:["story","welcome","service","host","comparison","aunt","events","food","suppliers","promise","contact","process","recognition"],
  hiddenSections:["recognition"],
  mediaSettings:{
    story:{x:50,y:50,fit:"cover"},welcome:{x:50,y:50,fit:"cover"},service:{x:50,y:50,fit:"cover"},food:{x:50,y:50,fit:"cover"},footer:{x:50,y:50,fit:"contain"},
    comparison0:{x:50,y:50,fit:"cover"},comparison1:{x:50,y:50,fit:"cover"},comparison2:{x:50,y:50,fit:"cover"},comparison3:{x:50,y:50,fit:"cover"}
  },
  story:{eyebrow:"כל מה שיצרתם. כל מה שביקשתם להעניק.",eyebrowSize:1.6,title:"אירוע שלא רק מתחיל יפה.",titleSize:4,titleY:39,accent:"אירוע שנשאר.",accentSize:9,accentY:70,titleBottom:8,text:"כדי שגם כשהמרחב מתמלא חיים, הוא ימשיך לספר את אותו הסיפור.",textSize:3.5,image:"/event-table.jpg",imageAlt:"הדמיה של מרחב אירוח עשיר, חי ומזמין",visionLabel:"הדמיית חזון"},
  welcome:{eyebrow:"",video:"/welcome-event.mp4",title:"הגעתי לאירוע באיחור של שעה וחצי.",accent:"ונראה כאילו האירוע התחיל רק עכשיו!",text:"",image:"/event-table.jpg"},
  recognition:{kicker:"את מכירה את הרגע הזה",title:"בהתחלה הכול נראה בדיוק כפי שתכננת.",large:"ואז מגיעים בני אדם.",text1:"כלים זזים. קערות מתרוקנות. צלחות נגמרות. פינת הקפה משנה את צורתה.",text2:"זו אינה תקלה. זה מה שקורה כשאירוע חי. אבל ההשקעה, הנראות והתחושה שביקשת ליצור אינן חייבות להישחק יחד איתו."},
  host:{kicker:"",title:"כמה פעמים הייתם באירוע שבו האוכל מצוין, האנשים נהדרים — אבל המרחב מבולגן, השולחנות עמוסים, ואף אחד לא יודע איפה לשבת או מאיפה לקחת צלחת?",text:"גם כשיש מארגנים מצוינים, אוכל טוב ואנשים שמחים להגיע — בזמן אמת השולחנות מתבלגנים, אזורי ההגשה נסתמים, ואנשים לא תמיד יודעים איך להתמצא במרחב.\n\nהמארחים נמצאים עם האנשים שלמענם יצרו את האירוע — אבל מי רואה את המרחב כולו?\n\nכי לפעמים כל מה שחסר באירוע טוב הוא מי שיבחין במה שקורה, ישמור על הסדר ועל הזרימה — ויחזיק את המרחב החי.",quote:"וזה המקום שבו אני נכנסת.",image:"/adriana-event.jpg",video:"/host-event-loop.mp4",comparison:[{image:"/comparison-host.png",alt:"מארחת מטפלת בעמדת הקפה לעומת מארחת הפנויה לאורחות"},{image:"/comparison-evening.png",alt:"מארח מסדר את שולחן הכיבוד לעומת מארח הפנוי לאורחים"},{image:"/comparison-garden.jpg",alt:"אורחת מטפלת בשולחן לעומת אורחת הפנויה לשיחה"},{image:"/comparison-business.jpg",alt:"מארח מטפל בעמדת הקפה לעומת מארח הפנוי לשיחה"}],auntVideo:"/aunt-story.mp4?v=2",auntPoster:"/aunt-story-poster.jpg",auntLabel:"סרטון הדודה"},
  service:{kicker:"יש לזה שם",title:"נוצרת מרחבי אירוח.",origin:"מלשון לנצור — לשמור על דבר יקר.",lead:"אני אדריאנה הראל. התפקיד שלי מתחיל ברגע שבו מרחב האירוח מוכן להיפתח לכניסתם של האורחים.",image:"/adriana-yellow.jpg",imageAlt:"אדריאנה הראל בשמלה צהובה בתוך אירוע",items:[{title:"שפע",text:"אני שומרת שהעמדות יישארו יפות מסודרות ומזמינות לאורך ההגשה."},{title:"נראות",text:"אני רואה את התמונה השלמה וגם את הפרטים הקטנים שנשחקים בתוכה."},{title:"זרימה",text:"אני פועלת בתוך השינוי הטבעי ומטפלת במה שנדרש לפני שהוא הופך להפרעה."},{title:"תחושה",text:"אני נוצרת את מה שהמארחים ביקשו להעניק - לאורך כל האירוע, עד אחרון האורחים."}]},
  promise:{kicker:"מה נשאר בסוף",title:"לא רק שולחן שנשמר.",accent:"חוויה שנשארת בזיכרון.",items:["שליטה בלי שתצטרכי לשלוט.","פניות להיות עם האורחים.","אירוע שממשיך להיות כפי שתכננת.","הרושם שאנשים לוקחים איתם הביתה."]},
  events:{kicker:"למי זה מתאים",title:"לאירועים שחשובים מכדי להשאיר את החוויה ליד המקרה.",items:["אירועים משפחתיים משמעותיים","חתונות קטנות ואירוח אינטימי","אירוח חברתי בבית או במרחב נבחר","אירועים עסקיים ואירועי חברה","סדנאות, ריטריטים ומפגשי קבוצות"]},
  food:{kicker:"השפע שעל השולחן",title:"קולינריה עשירה, חגיגית ומפתיעה.",text1:"בעבודה שלי אני משרתת ארוחות צמחיות משובחות, ולשמחתי זה מאפשר לי, בין השאר, גם לעבוד עם הטבחים הנפלאים של העולם החדש.",text2:"אז אם עדיין לא בחרת מה יעלה על השולחן שלך באירוע – אני מזמינה אותך להכיר את המטבחים שמביאים את העולם הזה אלינו, לפגוש את המנות הנהדרות שנולדות בכל אחד מהם, ולבחור מתוכם את המטבח שהכי מתאים לאירוע הקרוב.",image:"/culinary-table.jpg",imageAlt:"שולחן אירוח עשיר עם מאפים, סלטים, פירות, עוגות ומשקאות",suppliersTitle:"ספקי אוכל שאני שמחה לחבר אל האירוע שלכם",suppliers:[{name:"ניבה בנטו",owner:"ניבה קרן־אור",image:"/niva-mango-cake.jpg",imageAlt:"עוגת מנגו טבעונית של ניבה בנטו",specialty:"קולינריה טבעונית צבעונית, נדיבה ומלאת דמיון.",fit:"קינוחים · אירוח קטן",links:[{label:"אתר",href:"https://nivabento.com/"},{label:"אינסטגרם",href:"https://www.instagram.com/niva.bento/"},{label:"פייסבוק",href:"https://www.facebook.com/niva.bento/"},{label:"טיקטוק",href:"https://www.tiktok.com/@nivabento"}]}]},
  process:{kicker:"מכאן זה פשוט",title:"מתחילים בשיחה.",items:["כותבים לי בוואטסאפ כמה מילים על האירוע.","קובעים זמן נוח לשיחה ומבינים יחד מה דרוש.","ממלאים את פרטי האירוע ומקבלים הצעה מותאמת."]},
  contact:{kicker:"האירוע שלך",title:"את תהיי עם האורחים. אני אנצור את המרחב.",button:"לדבר עם אדריאנה בוואטסאפ",phone:"054-655-0816"}
};
