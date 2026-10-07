/* Shared item presentation, using the Data Editor's field order and colors. */
const SET_FAMILIES=[{"id": "medusa", "level": 160, "name": "Medusa"}, {"id": "golden-lotus", "level": 160, "name": "Golden Lotus"}, {"id": "spirit-king", "level": 166, "name": "Spirit King"}, {"id": "vivianne", "level": 166, "name": "Vivianne"}, {"id": "crimson-dragon", "level": 170, "name": "Crimson Dragon"}, {"id": "kings-wish", "level": 174, "name": "King's Wish"}, {"id": "prudent-dragon", "level": 180, "name": "Prudent Dragon"}, {"id": "imperial-dragon", "level": 190, "name": "Imperial Dragon"}, {"id": "phantom-sphynx", "level": 195, "name": "Phantom Sphynx"}, {"id": "pherrya", "level": 200, "name": "Pherrya"}, {"id": "magic-dragon", "level": 210, "name": "Magic Dragon"}, {"id": "scarlet-wolf", "level": 220, "name": "Scarlet Wolf"}, {"id": "scarlet-hyena", "level": 220, "name": "Scarlet Hyena"}, {"id": "nile-jewel", "level": 230, "name": "Nile Jewel"}, {"id": "butterfly", "level": 240, "name": "Butterfly"}, {"id": "moirai", "level": 240, "name": "Moirai"}, {"id": "sanguine", "level": 245, "name": "Sanguine"}, {"id": "mosaic", "level": 245, "name": "Mosaic"}];
const SET_SLOTS=['Jacket','Pants','Armor','Cape','Cap','Shoes','Necklace','Bracelet','Rings','Weapon'];
function setInfo(description,category){
 if(!((category>=1&&category<=18)||[20,21,22].includes(category)))return null;
 const normalized=(description||'').toLowerCase().replace(/['’]/g,'').replace(/phantom sphinx/g,'phantom sphynx').replace(/\bsanguin\b/g,'sanguine').replace(/\s+/g,' ');
 const match=SET_FAMILIES.find(s=>normalized.includes(s.name.toLowerCase().replace(/'/g,'')));if(!match)return null;
 const slot=category<=12?'Weapon':({13:'Jacket',14:'Pants',15:'Armor',16:'Cape',17:'Shoes',18:'Cap',20:'Necklace',21:'Rings',22:'Bracelet'})[category];
 return {...match,slot};
}
function setOptions(){return '<option value="">All sets</option>'+SET_FAMILIES.map(s=>'<option value="'+s.id+'">'+s.level+' — '+s.name+'</option>').join('')}
function beadExcluded(name){return /\b(?:ticks?|tickets?)\b/i.test(name)||/^(?:blue bead|red bead)(?:\s|$)/i.test(name)}
function detailCard(d,icon){
 const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const num=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:3});
 const line=(label,value,cls='')=>'<div class="editor-line '+cls+'">'+e(label)+': <span>'+e(value)+'</span></div>';
 let h='<section class="editor-tooltip"><div class="editor-title">'+icon+'<h2>'+e(d.name)+'</h2></div>';
 const desc=(d.description||'').replace(/\\/g,'\n').trim();if(desc&&!/^[0O]$/.test(desc))h+='<p class="editor-description">'+e(desc)+'</p>';
 h+='<p class="editor-type">'+e(d.classes)+' · '+e(d.type)+'</p>';
 h+=line('Required level',d.maximum?'from '+d.level+' to '+d.maximum:d.level,'requirement');
 (d.requirements||[]).forEach((n,i)=>{if(n)h+=line('Required '+['Strength','Dexterity','Vitality','Intelligence','Agility'][i],num(n),'requirement')});
 h+=line('Exorcism Type',({0:'General',1:'Heroism',2:'Continental',3:'White Demon',5:'All Type'})[d.exorcism]||'Type '+d.exorcism,'requirement');
 if(d.exorcismDamage)h+=line('Exorcism Damage',num(d.exorcismDamage)+'%','requirement');
 if(d.duration)h+=line('Use time',d.duration%1440===0?num(d.duration/1440)+' days':num(d.duration)+' minutes','requirement');
 if(d.attack?.some(Boolean))h+=line('Offensive Power',num(d.attack[0])+' ~ '+num(d.attack[1]));
 for(const [label,value,unit,bonus]of d.stats||[])if(value)h+=line((bonus?'+[H] ':'')+label,num(value)+unit,bonus?'bonus':'');
 if(d.set)h+='<p class="editor-set">['+e(d.set.name)+' · Level '+d.set.level+']</p>';
 if(d.setStored)h+='<p class="editor-note">Set and equipped bonuses are not simulated.</p>';
 return h+'</section>';
}
function rowDetail(r,stats,restores,categories,classes){
 const labels=['Strength Increase','Dexterity Increase','Vitality Increase','Intelligence Increase','Agility Increase','Max Life Increase','Max Mana Increase','Max Stamina Increase','Offense Success Rate','Defense Success Rate','Critical Hit Rate','Critical Damage Up','Minimum Offensive Power','Maximum Offensive Power','Offensive Power','Defensive Power'];
 const values=[],raw=r[18]||{};
 stats.forEach((s,i)=>{if(i!==12&&i!==13)values.push([labels[i],r[10][2*i]*(s[5]==='%'?100:1),s[5]==='%'?'%':'',false])});
 restores.forEach((s,i)=>values.push([s[1],r[11][i],'',false]));
 stats.forEach((s,i)=>values.push([labels[i],r[10][2*i+1]*(s[5]==='%'?100:1),s[5]==='%'?'%':'',true]));
 for(const [off,label]of [[444,'Damage dealt to monsters increased'],[448,'Damage taken from monsters reduced'],[452,'PVP Attack Damage Increase']])values.push([label,raw[off]||0,'%',false]);
 const set=setInfo(r[2],r[3]);
 return {name:r[1],description:r[2],classes:r[6]===15?'All Classes':r[6]?classes.filter((_,i)=>r[6]&(1<<i)).join(', '):'Class not specified',type:set?.slot||categories[r[3]]||'Item',level:r[4],maximum:r[5],requirements:r[7],exorcism:raw[140]||0,exorcismDamage:raw[152]||0,duration:raw[492]||0,attack:[r[10][24],r[10][26]],stats:values,set,setStored:raw[512]||0};
}
