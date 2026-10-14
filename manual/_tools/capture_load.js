// 건축물 설계하중 통합 산정 매뉴얼 화면 캡처 — usage: node capture_load.js <repoDir> <outDir>
// 규격: 1440×900 · DSF 1.25 · serviceWorkers block · _marks.json(번호 배지 % 좌표) · _example.json(예제 산정값 — 앱 엔진 R에서 읽음)
// 입력 설정은 앱의 매뉴얼 캡처용 읽기 창구 window.__mmLoad(set · goTab · R · st)를 쓴다.
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const VW=+(process.env.MM_VW||1440),VH=+(process.env.MM_VH||900),DSF=+(process.env.MM_DSF||1.25),PORT=8899;   // 영상(쇼츠)용 좁은 캡처: MM_VW=720 MM_VH=1280 MM_DSF=2
/* 예제 A = 서울 업무시설 RC 3층 H 12 m · B 10 × D 15 · 중요도(2) · V₀ 28 · Sg 0.5 · S4 · RC 보통모멘트골조 (앱 기본값)
   예제 B = 전북 익산 학교 교실 RC 4층 H 16 m · B 20 × D 40 · 중요도(1) · 활하중 저감(기둥, A_T 150 m², 2개 층 이상) · S3 · RC 중간모멘트골조
   예제 C = 강원 춘천(지진구역 Ⅱ) 경량품 저장창고 1층 H 9 m · B 30 × D 60 · Sg 2.0 · Ct 1.1(비난방) · S2 · 철골 보통중심가새골조
   ※ B · C의 V₀ · Sg는 매뉴얼 설명용 가정 입력값 — 실무에서는 그림 5.5-1 · 4.2-1에서 건설지점 값을 판독한다 */
const EX={
 A:{},
 B:{info:{readNote:'',name:'익산시 ○○초등학교 교사동 증축공사',usage:'교육연구시설(학교)',sido:'전북특별자치도',sigungu:'',importance:'1',height:'16',floors:'4',width:'20',depth:'40',area:'800',roofAngle:'5',V0:'30',Sg:'0.8'},
    live:{cat:'학교',sub:'교실',reduce:true,member:'col',AT:'150',multi:true},seis:{soil:'S3',sysIdx:'1'}},
 C:{info:{readNote:'',name:'춘천시 ○○동 물류창고 신축공사',usage:'창고시설',sido:'강원특별자치도',sigungu:'춘천시',importance:'2',height:'9',floors:'1',width:'30',depth:'60',area:'1800',roofAngle:'5',V0:'28',Sg:'2.0'},
    live:{cat:'창고',sub:'경량품 저장창고',partition:false},snow:{Ct:'1.1'},seis:{soil:'S2',sysIdx:'9'}},
};
const FREEZE=`(()=>{const T=new Date(2026,9,14,10,0,0).getTime();const D=Date;class F extends D{constructor(...a){if(a.length)super(...a);else super(T);}static now(){return T;}}window.Date=F;window.alert=()=>{};window.confirm=()=>true;try{localStorage.clear();sessionStorage.setItem('pwa-banner-dismissed','1');}catch(e){}})()`;
const HIDE='.pwa-banner,#pwa-banner,#mm-toast{display:none!important}';
const HELP=`window.__vis=e=>e&&e.getClientRects().length>0;
window.__find=sel=>{if(sel.startsWith('up:')){const [a,b]=sel.slice(3).split('|');const e=[...document.querySelectorAll(a)].find(__vis);return e?e.closest(b):null;}
 if(sel.startsWith('nth:')){const [q,i]=sel.slice(4).split('|');return [...document.querySelectorAll(q)].filter(__vis)[+i]||null;}
 for(const s of sel.split(',')){const e=[...document.querySelectorAll(s)].find(__vis);if(e)return e;}return null;};
window.__D0=window.__D0||JSON.parse(JSON.stringify(__mmLoad.st));
window.__EX=${JSON.stringify(EX)};
window.__run=(k,t)=>{const o=__EX[k];const L=__mmLoad;['info','dead','live','snow','wind','seis'].forEach(s=>L.set[s](Object.assign(JSON.parse(JSON.stringify(__D0[s])),o[s]||{})));L.goTab(t||0);window.scrollTo(0,0);};
window.__tab=t=>{__mmLoad.goTab(t);window.scrollTo(0,0);};
window.__ex=()=>JSON.parse(JSON.stringify({in:__mmLoad.st,R:__mmLoad.R}));`;
const CB=i=>`nth:.main-body > .card > .cb > *|${i}`;
const SHOTS=[
 {id:'s01_overview',pre:"__run('A',0)",clip:'viewport',m:[['.hdr-tabs','작업 탭 · 매뉴얼'],['.sum-bar','요약 스트립 D · L · S · W · Cs · 연직지배'],['.prog-bar','진행 표시'],[CB(0),'프로젝트명 · 용도'],[CB(1),'지역 · 중요도 · 높이 · 층수'],[CB(3),'기본풍속 V₀ · 지상설하중 Sg'],['.fab-wrap','도움말 · 가이드']]},
 {id:'s02_tabs',clip:'.app-header',m:[['nth:.hdr-tab|0','프로젝트'],['nth:.hdr-tab|1','고정하중 D'],['nth:.hdr-tab|2','활하중 L'],['nth:.hdr-tab|3','적설하중 S'],['nth:.hdr-tab|4','풍하중 W'],['nth:.hdr-tab|5','지진하중 E'],['nth:.hdr-tab|6','하중조합'],['nth:.hdr-tab|7','계산서'],['.tb-manual','매뉴얼'],['.hdr-right','근거 기준']]},
 {id:'s03_project',clip:'.main-body > .card',m:[[CB(0),'프로젝트명 · 건축물 용도'],[CB(1),'시·도(시·군) · 중요도 · 높이 · 층수'],[CB(2),'평면 B · D · 바닥면적 · 지붕 경사'],[CB(3),'V₀ (그림 5.5-1) · Sg (그림 4.2-1)'],[CB(4),'V₀ · Sg 판독 근거(A4 표기)'],[CB(5),'지도 판독 안내'],[CB(6),'자동 연동 정보']]},
 {id:'s04_dead',pre:"__tab(1)",clip:'.main-body > .card',m:[[CB(0),'고정하중 항목표'],[CB(1),'항목 추가'],[CB(2),'고정하중 합계 D'],[CB(3),'근거 · 참고값 안내']]},
 {id:'s05_live_a',pre:"__tab(2)",clip:'.main-body > .card',m:[[CB(0),'용도(표 3.2-1)'],[CB(1),'직접 입력 · 칸막이벽 +1.0'],[CB(2),'활하중 저감(3.5)'],[CB(3),'적용 활하중 L'],[CB(4),'저감 제한(3.5.3)']]},
 {id:'s06_snow_a',pre:"__tab(3)",clip:'.main-body > .card',m:[[CB(0),'자동 반영 값 Sg · Is'],[CB(1),'Ce · Ct · 미끄러운 지붕'],[CB(2),'산정식'],[CB(3),'Sf · Ss · 최소설하중 · 설계 S'],[CB(4),'불균형 · 국부설하중 안내']]},
 {id:'s07_wind_a',pre:"__tab(4)",clip:'.main-body > .card',m:[[CB(0),'간편법 적용범위(5.15.1)'],[CB(1),'Ce · 정형 여부 · 조도'],[CB(2),'산정식(식 5.15-1)'],[CB(3),'설계풍압 W · 풍하중 W_SF'],[CB(4),'속도압 q_H (참고)']]},
 {id:'s08_seis_a',pre:"__tab(5)",clip:'.main-body > .card',m:[[CB(0),'지진구역 · Z · S · IE'],[CB(1),'지반종류 · 구조시스템'],[CB(2),'영구설비 하중'],[CB(3),'Fa · Fv · SDS · SD1 · Ta'],[CB(4),'설계범주 · Cs · W · V'],[CB(5),'동적해석 안내']]},
 {id:'s09_combo_a',pre:"__tab(6)",clip:'.main-body > .card',m:[[CB(0),'D · L · S · W · E 요약'],[CB(1),'1.7.1(2) L 계수 0.5'],[CB(2),'식(1.7-1) ~ (1.7-7)'],[CB(3),'연직 지배 조합'],[CB(4),'정리 방식']]},
 {id:'s10_live_b',pre:"__run('B',2)",wait:900,clip:'.main-body > .card',m:[[CB(0),'학교 · 교실 L₀ 3.0'],[CB(2),'저감 — 기둥 · A_T 150 m² · 2개 층 이상'],[CB(3),'L = L₀·C + 칸막이']]},
 {id:'s11_seis_b',pre:"__tab(5)",clip:'.main-body > .card',m:[[CB(0),'중요도(1) · IE 1.2'],[CB(1),'S3 · RC 중간모멘트골조'],[CB(4),'Cs · V']]},
 {id:'s12_snow_c',pre:"__run('C',3)",wait:900,clip:'.main-body > .card',m:[[CB(0),'Sg 2.0 (가정 입력값)'],[CB(1),'Ct 1.1 — 비난방'],[CB(3),'Sf 1.54 kN/m²']]},
 {id:'s13_seis_c',pre:"__tab(5)",clip:'.main-body > .card',m:[[CB(0),'지진구역 Ⅱ · Z 0.07'],[CB(4),'W — 창고 25% · 적설 20% 포함']]},
 {id:'s14_guide_wind',pre:"__run('A',0);document.querySelector('.fab:not(.sub)').click()",wait:900,post2:"[...document.querySelectorAll('.mo-tab')][4].click()",fixed:true,clip:'.mo-box',m:[]},
 {id:'s15_guide_snow',pre:"[...document.querySelectorAll('.mo-tab')][3].click()",wait:700,fixed:true,clip:'.mo-box',post:"document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))",m:[]},
 {id:'s16_help',pre:"document.querySelector('.fab.sub').click()",wait:800,fixed:true,clip:'.help-mo-box',post:"[...document.querySelectorAll('.help-mo-box button')].find(b=>/✕|닫기/.test(b.textContent)).click()",m:[]},
 {id:'s17_a4',pre:"__tab(7)",wait:1500,clip:'viewport',m:[['.mm-btn-jpg','JPG 저장'],['.mm-btn-pdf','인쇄 · PDF'],['#report-zone','A4 계산서']]},
 {id:'s18_a4page',clip:'#report-zone',crop:2600,m:[]},
];
(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch({args:['--lang=ko-KR'],env:{...process.env,LANG:'ko_KR.UTF-8',LANGUAGE:'ko',LC_ALL:'ko_KR.UTF-8'}});
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DSF,serviceWorkers:'block',locale:'ko-KR'});await setup(ctx);
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(FREEZE);
 await pg.goto(`http://127.0.0.1:${PORT}/index.html`);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(3000);
 await pg.addStyleTag({content:HIDE});await pg.evaluate(HELP);
 const ex={};const meta={};
 for(const S of SHOTS){
  if(S.pre){try{await pg.evaluate(S.pre);}catch(e){errs.push(S.id+' pre '+e.message);}}
  await pg.waitForTimeout(S.wait||700);
  if(S.post2){await pg.evaluate(S.post2);await pg.waitForTimeout(600);}
  if(S.clip!=='viewport'&&!S.fixed){await pg.evaluate(c=>{const e=__find(c);if(e){window.scrollTo(0,e.getBoundingClientRect().top+scrollY-40);}},S.clip);await pg.waitForTimeout(500);}
  await pg.evaluate(v=>{const f=document.querySelector('.fab-wrap');if(f)f.style.visibility=v?'':'hidden';},S.clip==='viewport'||!!S.fixed);
  if(S.id==='s01_overview')ex.A=await pg.evaluate('__ex()');
  if(S.id==='s10_live_b')ex.B=await pg.evaluate('__ex()');
  if(S.id==='s12_snow_c')ex.C=await pg.evaluate('__ex()');
  if(S.id==='s18_a4page')ex.A_a4=await pg.evaluate(()=>document.getElementById('report-zone').innerText.replace(/\s+/g,' '));
  const info=await pg.evaluate(({S,VW,VH})=>{
   const abs=e=>{const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};};
   let clip;
   if(S.clip==='viewport'){clip={x:0,y:scrollY,width:VW,height:VH};}
   else{const el=__find(S.clip);if(!el)return {err:'clip '+S.clip};const a=abs(el);clip={x:a.x,y:a.y,width:a.w,height:a.h};
     const P=12;clip={x:Math.max(0,clip.x-P),y:Math.max(0,clip.y-P),width:clip.width+2*P,height:clip.height+2*P};
     if(S.crop&&clip.height>S.crop)clip.height=S.crop;}
   const marks=[];(S.m||[]).forEach(([sel,label],i)=>{const e=__find(sel);if(!e){marks.push({n:i+1,label,miss:sel});return;}const a=abs(e);
     marks.push({n:i+1,label,x:+((a.x-clip.x)/clip.width*100).toFixed(2),y:+((a.y-clip.y)/clip.height*100).toFixed(2),w:+(Math.min(a.w,clip.x+clip.width-a.x)/clip.width*100).toFixed(2),h:+(Math.min(a.h,clip.y+clip.height-a.y)/clip.height*100).toFixed(2)});});
   return {clip,marks};},{S,VW,VH});
  if(info.err){errs.push(S.id+' '+info.err);continue;}
  const c=info.clip;const cl={x:Math.max(0,c.x),y:Math.max(0,c.y),width:Math.min(c.width,VW-Math.max(0,c.x)),height:c.height};
  if(S.clip==='viewport'){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:0,y:0,width:VW,height:VH}});}
  else if(S.fixed){const sx=await pg.evaluate(()=>scrollX),sy=await pg.evaluate(()=>scrollY);await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:Math.max(0,c.x-sx),y:Math.max(0,c.y-sy),width:Math.min(c.width,VW),height:Math.min(c.height,VH-Math.max(0,c.y-sy))}});}
  else{try{await pg.screenshot({path:path.join(out,S.id+'.png'),clip:cl,fullPage:true});}catch(e){errs.push(S.id+' shot '+JSON.stringify(cl));continue;}}
  meta[S.id]={w:Math.round(cl.width),h:Math.round(Math.min(cl.height,S.fixed?VH:1e9)),marks:info.marks};
  if(S.post){try{await pg.evaluate(S.post);}catch(e){errs.push(S.id+' post '+e.message);}await pg.waitForTimeout(400);}
 }
 await pg.evaluate("__run('A',0)");await pg.waitForTimeout(600);ex.after=await pg.evaluate('__ex()');
 const mctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true,locale:'ko-KR'});await setup(mctx);
 const mp=await mctx.newPage();await mp.addInitScript(FREEZE);
 await mp.goto(`http://127.0.0.1:${PORT}/index.html`);await mp.waitForTimeout(3000);
 await mp.addStyleTag({content:HIDE});await mp.evaluate(HELP);await mp.evaluate("__run('A',0)");await mp.waitForTimeout(800);
 await mp.screenshot({path:path.join(out,'s19_mobile_main.png')});meta['s19_mobile_main']={w:390,h:844,marks:[]};
 await mp.evaluate("__tab(6)");await mp.waitForTimeout(900);
 await mp.screenshot({path:path.join(out,'s20_mobile_combo.png')});meta['s20_mobile_combo']={w:390,h:844,marks:[]};
 await mp.evaluate("__tab(7)");await mp.waitForTimeout(1500);
 await mp.screenshot({path:path.join(out,'s21_mobile_a4.png')});meta['s21_mobile_a4']={w:390,h:844,marks:[]};
 ex.mobile=await mp.evaluate(()=>({page:document.documentElement.scrollWidth,vw:innerWidth}));
 fs.writeFileSync(path.join(out,'_marks.json'),JSON.stringify(meta,null,1));fs.writeFileSync(path.join(out,'_example.json'),JSON.stringify(ex,null,1));
 const miss=[];Object.entries(meta).forEach(([k,v])=>v.marks.forEach(m=>{if(m.miss)miss.push(k+':'+m.miss);else if(m.x<0||m.y<0||m.x+m.w>100.5||m.y+m.h>100.5||m.w<=0||m.h<=0)miss.push(k+':OUT '+m.label+' '+m.x+','+m.y+','+m.w+','+m.h);}));
 const sh=o=>o&&{D:o.R.dead.D,L:+o.R.live.L.toFixed(3),S:o.R.snow.S,W:o.R.wind.W,Cs:+o.R.seis.Cs.toFixed(4),V:+o.R.seis.V.toFixed(1),gov:o.R.combo.gov.id+' '+o.R.combo.gov.v.toFixed(3)};
 console.log(JSON.stringify({A:sh(ex.A),B:sh(ex.B),C:sh(ex.C),same:JSON.stringify(ex.A.R)===JSON.stringify(ex.after.R),mobile:ex.mobile,sizes:Object.fromEntries(Object.entries(meta).map(([k,v])=>[k,v.w+'x'+v.h])),miss,errs:errs.slice(0,15)},null,1));
 await b.close();s.close();
})();
