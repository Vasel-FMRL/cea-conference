
const W=1280,H=720,T=12; // loop period seconds
let x;
function rnd(s){return function(){s=(s*16807)%2147483647;return (s-1)/2147483646;}}
const r=rnd(7);
// hills profiles
function hill(base,amp,f1,f2,ph){const pts=[];for(let i=0;i<=W;i+=8){pts.push(base-amp*(0.6*Math.sin(i*f1+ph)+0.4*Math.sin(i*f2+ph*2)));}return pts;}
const hills=[
 {p:hill(470,30,0.004,0.011,1),c1:'#4f8f8a',c2:'#3d7a77'},
 {p:hill(530,40,0.003,0.009,2.2),c1:'#3f8a5c',c2:'#2f6f4a'},
 {p:hill(600,35,0.0045,0.012,4),c1:'#2f7a46',c2:'#215c36'},
 {p:hill(680,25,0.006,0.015,5.5),c1:'#1f5e35',c2:'#163f27'}];
function yAt(h,xx){return h.p[Math.max(0,Math.min(h.p.length-1,Math.round(xx/8)))];}
const turbines=[[760,1,0.55,0.0],[880,1,0.62,1.2],[1010,1,0.5,2.1],[1140,1,0.6,0.7],[640,0,0.42,1.7],[560,0,0.38,0.4],[1220,0,0.4,2.6]];
const clouds=[];for(let i=0;i<9;i++)clouds.push({y:60+r()*200,s:0.6+r()*0.9,ph:r(),sp:[1,1,2][i%3],blobs:Array.from({length:7},()=>[r()*160-80,r()*16-8,18+r()*26])});
const birds=Array.from({length:5},(_,i)=>({y:150+r()*80,ph:r(),dy:r()*20}));
function sky(){
 const g=x.createLinearGradient(0,0,0,H*0.75);
 g.addColorStop(0,'#2a6fb0');g.addColorStop(0.45,'#6fb3d8');g.addColorStop(0.8,'#cfe9e6');g.addColorStop(1,'#f3e6c4');
 x.fillStyle=g;x.fillRect(0,0,W,H);
 const sx=980,sy=260;
 let rg=x.createRadialGradient(sx,sy,10,sx,sy,420);rg.addColorStop(0,'rgba(255,236,180,0.95)');rg.addColorStop(0.15,'rgba(255,220,150,0.45)');rg.addColorStop(1,'rgba(255,220,150,0)');
 x.fillStyle=rg;x.fillRect(0,0,W,H);
 x.fillStyle='#fff6dc';x.beginPath();x.arc(sx,sy,34,0,7);x.fill();
}
function cloud(cl,t){
 const span=W+400; const px=((cl.ph+cl.sp*t/T)%1)*span-200;
 x.save();x.globalAlpha=0.6;
 for(const b of cl.blobs){const g=x.createRadialGradient(px+b[0]*cl.s,cl.y+b[1]*cl.s,0,px+b[0]*cl.s,cl.y+b[1]*cl.s,b[2]*cl.s);g.addColorStop(0,'rgba(255,255,255,0.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.arc(px+b[0]*cl.s,cl.y+b[1]*cl.s,b[2]*cl.s,0,7);x.fill();}
 x.restore();
}
function drawHill(h,i){x.beginPath();x.moveTo(0,H);h.p.forEach((y,k)=>x.lineTo(k*8,y));x.lineTo(W,H);x.closePath();const g=x.createLinearGradient(0,Math.min(...h.p),0,H);g.addColorStop(0,h.c1);g.addColorStop(1,h.c2);x.fillStyle=g;x.fill();}
function turbine(tx,layer,sc,ph,t){
 const h=hills[layer];const by=yAt(h,tx)+4;const ht=260*sc;const hy=by-ht;
 x.strokeStyle='#f4f7f6';x.fillStyle='#f4f7f6';x.lineCap='round';
 x.lineWidth=6*sc;x.beginPath();x.moveTo(tx,by);x.lineTo(tx,hy);x.stroke();
 const a=ph+2*Math.PI*2*t/T; // 2 turns per loop
 for(let k=0;k<3;k++){const an=a+k*2*Math.PI/3;x.lineWidth=4.5*sc;x.beginPath();x.moveTo(tx,hy);x.lineTo(tx+Math.cos(an)*110*sc,hy+Math.sin(an)*110*sc);x.stroke();}
 x.beginPath();x.arc(tx,hy,6*sc,0,7);x.fill();
}
function lake(){const y0=640;const g=x.createLinearGradient(0,y0,0,H);g.addColorStop(0,'rgba(170,215,225,0.0)');g.addColorStop(1,'rgba(120,180,200,0)');}
function bird(b,t){const px=((b.ph+t/T)%1)*(W+200)-100;const py=b.y+Math.sin(2*Math.PI*(t/T)*2+b.ph*6)*b.dy*0.3;const f=Math.sin(2*Math.PI*t*1.5+b.ph*9)*5;x.strokeStyle='rgba(20,40,50,0.6)';x.lineWidth=1.6;x.beginPath();x.moveTo(px-8,py-f);x.quadraticCurveTo(px-3,py-3,px,py);x.quadraticCurveTo(px+3,py-3,px+8,py-f);x.stroke();}
function scene1(t){
 sky();
 clouds.forEach(cl=>cloud(cl,t));
 birds.forEach(b=>bird(b,t));
 drawHill(hills[0]);
 turbines.filter(q=>q[1]===0).forEach(q=>turbine(q[0],0,q[2],q[3],t));
 drawHill(hills[1]);
 turbines.filter(q=>q[1]===1).forEach(q=>turbine(q[0],1,q[2],q[3],t));
 drawHill(hills[2]);
 // solar panels on front-left hill
 for(let i=0;i<7;i++){const px=120+i*46,py=yAt(hills[2],px)+18;x.fillStyle='#1d3f63';x.save();x.translate(px,py);x.transform(1,0,-0.35,1,0,0);x.fillRect(0,-16,38,16);x.strokeStyle='rgba(180,220,255,0.6)';x.lineWidth=1;x.strokeRect(0,-16,38,16);x.beginPath();x.moveTo(19,-16);x.lineTo(19,0);x.moveTo(0,-8);x.lineTo(38,-8);x.stroke();x.restore();}
 drawHill(hills[3]);
 // grass/trees on front hill swaying
 for(let i=0;i<60;i++){const px=(i*97)%W;if(px<470)continue;const py=yAt(hills[3],px)+6;const sw=Math.sin(2*Math.PI*t/T*3+i)*3;x.fillStyle='#14402a';x.beginPath();x.moveTo(px-9,py+4);x.quadraticCurveTo(px+sw,py-34,px+sw*1.5,py-44-(i%3)*8);x.quadraticCurveTo(px+sw,py-34,px+9,py+4);x.fill();}
 // light haze
 const hz=x.createLinearGradient(0,380,0,600);hz.addColorStop(0,'rgba(255,245,220,0)');hz.addColorStop(0.3,'rgba(255,245,220,0.14)');hz.addColorStop(1,'rgba(255,245,220,0)');x.fillStyle=hz;x.fillRect(0,380,W,220);
}
