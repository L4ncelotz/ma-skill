
    'use strict';
    const SEED = JSON.parse(document.getElementById('seedData').textContent);
    const SOURCES = SEED.sources;
    const CATEGORIES = SEED.categories;
    const TIERS = [
      {id:'S', name:'Essential',desc:'ใช้บ่อย / ขาดไม่ได้'},
      {id:'A', name:'Frequent',desc:'มีประโยชน์สูง'},
      {id:'B', name:'Useful',desc:'ใช้ตามลักษณะงาน'},
      {id:'C', name:'Occasional',desc:'นาน ๆ ครั้ง / ทับซ้อน'},
      {id:'D', name:'Low priority',desc:'เฉพาะทาง / เลิกใช้ได้'},
      {id:'U', name:'UNRANKED',desc:'ยังไม่ได้จัดอันดับ'}
    ];
    const STORAGE_KEY = 'skill-vault:inventory:v1';
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const safeURL = (v) => { try { const url=new URL(String(v || '')); return ['https:','http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
    const getSource = (skill) => skill.originId === 'custom' ? {name:skill.customOriginLabel || 'Custom source',repo:skill.customOriginLabel || 'Custom repository',url:safeURL(skill.customOriginUrl)} : (SOURCES[skill.originId] || SOURCES.conflict);
    const skillLink = (skill) => safeURL(skill.skillUrl) || safeURL(getSource(skill).url);
    const tierLabel = (tier) => tier === 'U' ? '—' : tier;
    const formatNum = (number) => String(number).padStart(2, '0');
    const ui = {
      page: 'library', drawerId: null, previousFocus: null, visible: 24,
      filters: {search:'',category:'all',source:'all',tier:'all',found:'all'},
      state: null
    };
    function baseState() { return {version:1,catalogVersion:2, skills:clone(SEED.skills), checklist:{1:false,2:false,3:false,4:false}, lastScan:null}; }
    function normalSkill(input, fallbackId) {
      const name=String(input.name || '').trim().slice(0,160);
      if(!name) return null;
      const cat=CATEGORIES.some(c=>c.id===input.category) ? input.category : CATEGORIES[0].id;
      return {id:String(input.id || fallbackId || name),number:Number(input.number)||0,name,category:cat,
        originId: (SOURCES[input.originId] || input.originId==='custom') ? input.originId : 'conflict',
        tier:TIERS.some(t=>t.id===input.tier) ? input.tier : 'U',
        description:String(input.description||'').slice(0,600), notes:String(input.notes||'').slice(0,12000),
        locations:Array.isArray(input.locations) ? input.locations.filter(x=>x && typeof x.path==='string').slice(0,60).map(x=>({provider:String(x.provider||'manual'),path:String(x.path).slice(0,1000)})) : [],
        customOriginLabel:String(input.customOriginLabel||''),customOriginUrl:safeURL(input.customOriginUrl),
        skillUrl:safeURL(input.skillUrl),referenceUrl:safeURL(input.referenceUrl),
        custom:!!input.custom
      };
    }
    function normalizeState(raw) {
      if(!raw || !Array.isArray(raw.skills)) throw new Error('ไฟล์ไม่มีรายการ skills');
      const ids=new Set(); const skills=[];
      raw.skills.forEach((skill,i)=>{
        const item=normalSkill(skill, 'import-'+(i+1));
        if(item && !ids.has(item.id)) {ids.add(item.id);skills.push(item);}
      });
      return {version:1,catalogVersion:Number(raw.catalogVersion)||1,skills,checklist:{1:!!raw.checklist?.[1],2:!!raw.checklist?.[2],3:!!raw.checklist?.[3],4:!!raw.checklist?.[4]},lastScan:raw.lastScan && typeof raw.lastScan==='object' ? raw.lastScan : null};
    }
    // Upgrade 72-skill inventories without losing the user's ranking, paths, or notes.
    // The catalogVersion marker prevents deleted new skills from returning on reload.
    function upgradeCatalog(state) {
      if(state.catalogVersion>=2) return false;
      const names=new Set(state.skills.map(x=>x.name.toLowerCase()));
      const ids=new Set(state.skills.map(x=>x.id));
      for(const seedSkill of SEED.skills) {
        const existing=state.skills.find(x=>x.name.toLowerCase()===seedSkill.name.toLowerCase());
        if(existing) {
          if(!existing.skillUrl && seedSkill.skillUrl)existing.skillUrl=seedSkill.skillUrl;
          if(!existing.referenceUrl && seedSkill.referenceUrl)existing.referenceUrl=seedSkill.referenceUrl;
          continue;
        }
        if(seedSkill.number<=72 || names.has(seedSkill.name.toLowerCase()))continue;
        const added=normalSkill(seedSkill);
        if(ids.has(added.id))added.id='catalog-'+added.id;
        added.number=Math.max(Number(added.number)||0,...state.skills.map(x=>Number(x.number)||0))+1;
        state.skills.push(added);names.add(added.name.toLowerCase());ids.add(added.id);
      }
      state.catalogVersion=2;
      return true;
    }
    try {
      const saved=localStorage.getItem(STORAGE_KEY);
      ui.state=saved?normalizeState(JSON.parse(saved)):baseState();
      if(saved&&upgradeCatalog(ui.state))localStorage.setItem(STORAGE_KEY,JSON.stringify(ui.state));
    } catch(e) {ui.state=baseState(); console.warn('Cannot load saved inventory',e);}
    function save() { try {localStorage.setItem(STORAGE_KEY,JSON.stringify(ui.state));} catch(e) {toast('บันทึกใน Browser ไม่ได้ กรุณา Export JSON เพื่อเก็บข้อมูล');console.warn(e);} }
    function toast(message) {
      const el=document.getElementById('toast');el.textContent=message;el.hidden=false;
      clearTimeout(toast.timeoutId);toast.timeoutId=setTimeout(()=>{el.hidden=true;},3500);
    }
    function icons(name) {
      const base='width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
      const shapes={
        check:'<path d="m4 12 5 5L20 6"/>',
        dot:'<circle cx="12" cy="12" r="8"/><path d="m8 12 3 3 5-6"/>',
        folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9H3z"/>',
        flag:'<path d="M5 3v18M5 4h12l-3 5 3 5H5"/>',
        search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>'};
      return `<svg ${base} aria-hidden="true">${shapes[name]||shapes.folder}</svg>`;
    }
    function stats() {
      const s=ui.state.skills;const found=s.filter(x=>x.locations.length).length;
      return {total:s.length,categories:new Set(s.map(x=>x.category)).size,sources:new Set(s.map(x=>x.originId==='custom'?('custom:'+(x.customOriginLabel||'unknown')):x.originId)).size,top:s.filter(x=>['S','A'].includes(x.tier)).length,found};
    }
    function renderGlobal() {
      const s=stats();document.getElementById('navSkillCount').textContent=s.total;
      document.getElementById('topCount').textContent=s.total+' SKILLS TRACKED';
      document.getElementById('breadcrumb').textContent={library:'SKILL LIBRARY',tier:'TIER BOARD',sources:'ORIGINS & SOURCES',migration:'MIGRATION'}[ui.page];
    }
    function pageTo(name) {
      if(!['library','tier','sources','migration'].includes(name)) return;
      ui.page=name;document.querySelectorAll('[data-nav]').forEach(el=>{const active=el.dataset.nav===name;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
      ['library','tier','sources','migration'].forEach(n=>document.getElementById('page-'+n).hidden=n!==name);
      render();window.scrollTo(0,0);
    }
    function render() {renderGlobal();if(ui.page==='library')renderLibrary();if(ui.page==='tier')renderBoard();if(ui.page==='sources')renderSources();if(ui.page==='migration')renderMigration();}
    function setupFilters(){
      const cat=document.getElementById('categoryFilter');cat.insertAdjacentHTML('beforeend',CATEGORIES.map(c=>`<option value="${esc(c.id)}">${esc(c.label)}</option>`).join(''));
      const src=document.getElementById('sourceFilter');src.insertAdjacentHTML('beforeend',Object.entries(SOURCES).map(([id,v])=>`<option value="${esc(id)}">${esc(v.name)}</option>`).join('')+'<option value="custom">Custom source</option>');
    }
    function renderLibrary() {
      const count=stats();document.getElementById('libraryStats').innerHTML=[
        {name:'Total skills',value:count.total,foot:'จากคลัง Skill Vault'},
        {name:'Categories',value:count.categories,foot:'แยกประเภทตามการใช้งาน'},
        {name:'Priority · S + A',value:count.top,foot:'Tier ที่จัดไว้เป็นลำดับต้น'},
        {name:'Paths recorded',value:count.found,foot:'Path จาก Scan report ล่าสุด'}
      ].map(s=>`<div class="stat"><div class="stat-caption">${esc(s.name)}</div><div class="stat-value mono">${s.value}</div><div class="stat-footer">${esc(s.foot)}</div></div>`).join('');
      const f=ui.filters, query=f.search.toLowerCase();
      document.getElementById('searchInput').value=f.search;
      document.getElementById('categoryFilter').value=f.category;document.getElementById('sourceFilter').value=f.source;
      document.getElementById('tierFilter').value=f.tier;document.getElementById('foundFilter').value=f.found;
      const matching=ui.state.skills.filter(x=>{
        const source=getSource(x);
        const search=[x.name,x.description,x.notes,source.name,source.repo,x.category,x.skillUrl,x.referenceUrl,...x.locations.map(loc=>loc.path)].join(' ').toLowerCase();
        return (!query||search.includes(query)) && (f.category==='all'||x.category===f.category) &&
          (f.source==='all'||x.originId===f.source) && (f.tier==='all'||x.tier===f.tier) &&
          (f.found==='all'||(f.found==='found'?x.locations.length>0:x.locations.length===0));
      });
      document.getElementById('listCount').textContent=`แสดง ${Math.min(ui.visible,matching.length)} จาก ${matching.length} รายการ`;
      document.getElementById('sourceLegend').textContent='SOURCE / CANDIDATE';
      const grid=document.getElementById('skillGrid');
      if(!matching.length){grid.innerHTML='<div class="empty" style="grid-column:1/-1"><strong>ไม่พบ Skill ที่ตรงกับตัวกรอง</strong>ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น</div>';}else{
        grid.innerHTML=matching.slice(0,ui.visible).map(x=>{
          const src=getSource(x);const location=x.locations.length>0;
          return `<article class="skill-card"><div class="card-top"><span class="card-index">${formatNum(x.number)||'—'} / ${location?'PATH RECORDED':'IN CATALOG'}</span>
          <select class="tier-picker" data-tier="${x.tier}" data-tier-select="${esc(x.id)}" aria-label="Tier สำหรับ ${esc(x.name)}">${TIERS.map(t=>`<option value="${t.id}" ${x.tier===t.id?'selected':''}>${tierLabel(t.id)}</option>`).join('')}</select></div>
          <button type="button" class="card-name" data-open="${esc(x.id)}">${esc(x.name)}</button><p class="card-desc">${esc(x.description || 'ยังไม่มีคำอธิบาย เพิ่มได้จากหน้ารายละเอียด')}</p>
          <div class="card-footer"><span class="category-tag" title="${esc(x.category)}">${icons('folder')}${esc(x.category)}</span><div class="card-foot-side"><span title="${location?'พบ Path ในรายงาน Scan':'ยังไม่พบ Path จริง'}" class="${location?'found-icon':'missing-icon'}">${icons(location?'check':'dot')}</span>${x.notes?'<span class="note-indicator" title="มีบันทึก">●</span>':''}${x.skillUrl?`<a class="skill-link" href="${esc(skillLink(x))}" target="_blank" rel="noopener noreferrer" aria-label="เปิด Skill ${esc(x.name)} บน GitHub">↗</a>`:''}<span class="source-small" title="${esc(src.repo)}">${esc(src.name)}</span></div></div></article>`;
        }).join('');
      }
      document.getElementById('loadMoreBtn').hidden=matching.length<=ui.visible;
    }
    function renderBoard() {
      const board=document.getElementById('tierBoard');
      board.innerHTML=TIERS.map(t=>{
        const items=ui.state.skills.filter(x=>x.tier===t.id).sort((a,b)=>a.name.localeCompare(b.name));
        return `<div class="tier-lane" data-tier="${t.id}"><div class="tier-label-col"><div class="tier-big">${esc(t.name==='UNRANKED'?'—':t.id)}</div><div class="tier-label-text">${esc(t.name)}<br>${items.length} skill${items.length===1?'':'s'}</div></div><div class="tier-content">
          ${items.length?items.map(x=>`<button type="button" class="tier-token" draggable="true" data-drag="${esc(x.id)}" data-open="${esc(x.id)}" title="ลากไป Tier อื่น หรือคลิกเพื่อแก้ไข"><span class="dragdots" aria-hidden="true">⠿</span>${esc(x.name)}</button>`).join(''):`<span class="tier-empty">ลาก Skill มาวางที่นี่ · ${esc(t.desc)}</span>`}
        </div></div>`;
      }).join('');
    }
    function renderSources() {
      const groups=new Map();
      for(const skill of ui.state.skills){const key=skill.originId==='custom'?'custom:'+(skill.customOriginLabel||'unknown'):skill.originId;
        if(!groups.has(key)) groups.set(key,{origin:getSource(skill),originId:skill.originId,customLabel:skill.customOriginLabel,items:[]});groups.get(key).items.push(skill);}
      const sorted=[...groups.values()].sort((a,b)=>b.items.length-a.items.length || a.origin.name.localeCompare(b.origin.name));
      document.getElementById('sourceGroupCount').textContent=sorted.length+' GROUPS';
      document.getElementById('sourcesList').innerHTML=sorted.map(({origin,originId,customLabel,items})=>{
        const repo=safeURL(origin.url);
        const link=repo?`<a class="source-repo" href="${esc(repo)}" target="_blank" rel="noopener noreferrer" title="เปิด Repository">${esc(origin.repo)} ↗</a>`:`<span class="source-repo">${esc(origin.repo||'ยังไม่มีลิงก์ Repository')}</span>`;
        return `<div class="source-card"><div class="source-monogram">${esc(origin.name.slice(0,1).toUpperCase())}</div><div><div class="source-name">${esc(origin.name)}</div>${link}</div><button type="button" class="source-count" data-source-view="${esc(originId)}" data-custom-label="${esc(customLabel||'')}" title="ดู Skills ในกลุ่มนี้" style="border:0;background:transparent;cursor:pointer">${items.length}<small>VIEW SKILLS</small></button></div>`;
      }).join('');
      const providers={};ui.state.skills.flatMap(x=>x.locations).forEach(loc=>{providers[loc.provider]=(providers[loc.provider]||0)+1;});
      document.getElementById('detectedProviders').innerHTML=Object.keys(providers).length?Object.entries(providers).sort((a,b)=>b[1]-a[1]).map(([provider,count])=>`<span class="provider-chip">${esc(provider)} · ${count}</span>`).join(''):'<span class="path-label">ยังไม่มี Scan report</span>';
    }
    function renderMigration() {
      const s=stats();document.getElementById('readyTotal').textContent=s.total;
      document.getElementById('readyFound').textContent=s.found+' / '+s.total;
      document.getElementById('readyUnfound').textContent=s.total-s.found;
      const last=ui.state.lastScan; const date=last?.scannedAt?new Date(last.scannedAt):null;
      document.getElementById('readyScanDate').textContent=date && !isNaN(date.getTime())?date.toLocaleDateString('th-TH'):'—';
      document.getElementById('scanInfo').textContent=last?`Import ล่าสุด: ${last.count||0} รายการ · ${last.machine||'ไม่ทราบเครื่อง'} · จับคู่ได้ ${last.matched||0}`:'ยังไม่ได้ Import รายงานจากเครื่อง';
      document.querySelectorAll('[data-check]').forEach(input=>input.checked=!!ui.state.checklist[input.dataset.check]);
    }
    function openDrawer(id=null) {
      const skill=id===null?{id:'',number:0,name:'',category:CATEGORIES[0].id,originId:'custom',tier:'U',description:'',notes:'',locations:[],customOriginLabel:'',customOriginUrl:'',skillUrl:'',referenceUrl:'',custom:true}:ui.state.skills.find(x=>x.id===String(id));
      if(!skill)return;
      ui.drawerId=id===null?null:String(id);ui.previousFocus=document.activeElement;
      const editing=id!==null;
      document.getElementById('drawerKicker').textContent=editing?'SKILL / EDIT DETAILS':'NEW / SKILL';
      document.getElementById('drawerTitle').textContent=editing?skill.name:'เพิ่ม Skill ใหม่';
      const field=(label,name,value,help='',type='text')=>`<label class="field"><span class="field-label">${esc(label)}</span><input type="${type}" name="${name}" value="${esc(value)}" ${name==='name'?'required maxlength="160"':''}>${help?`<span class="field-help">${esc(help)}</span>`:''}</label>`;
      const src=getSource(skill);
      document.getElementById('skillForm').innerHTML=`
        ${field('ชื่อ Skill','name',skill.name)}
        ${field('ใช้ทำอะไร','description',skill.description,'คำอธิบายสำหรับค้นหาจากหน้า Library')}
        <div class="two-col"><label class="field"><span class="field-label">Category</span><select name="category">${CATEGORIES.map(c=>`<option value="${esc(c.id)}" ${skill.category===c.id?'selected':''}>${esc(c.label)}</option>`).join('')}</select></label>
        <label class="field"><span class="field-label">Tier</span><select name="tier">${TIERS.map(t=>`<option value="${t.id}" ${skill.tier===t.id?'selected':''}>${esc(t.id)} · ${esc(t.name)}</option>`).join('')}</select></label></div>
        <label class="field"><span class="field-label">Repository ต้นทาง (ยังไม่ยืนยันจากไฟล์จริง)</span><select name="originId" id="originInput">${Object.entries(SOURCES).map(([key,v])=>`<option value="${esc(key)}" ${skill.originId===key?'selected':''}>${esc(v.name)} — ${esc(v.repo)}</option>`).join('')}<option value="custom" ${skill.originId==='custom'?'selected':''}>Custom / Other</option></select><span class="field-help">Repository ที่พัฒนา Skill ≠ Provider หรือโฟลเดอร์ที่ OMP โหลด</span></label>
        <div id="customOriginFields" ${skill.originId==='custom'?'':'hidden'}>${field('ชื่อ Repository / ผู้พัฒนา','customOriginLabel',skill.customOriginLabel)}${field('Repository URL (https://...)','customOriginUrl',skill.customOriginUrl)}</div>
        ${field('ลิงก์ตรงไปที่ Skill (GitHub)','skillUrl',skill.skillUrl,'ใช้ลิงก์โฟลเดอร์ Skill หรือไฟล์ SKILL.md โดยตรง')}
        ${field('ลิงก์อ้างอิงเพิ่มเติม (ไม่บังคับ)','referenceUrl',skill.referenceUrl,'เช่น ลิงก์เวอร์ชันแปลหรือหน้าที่เคยใช้ติดตั้ง')}
        <div class="field"><label class="field-label" for="notesInput">Notes ส่วนตัว</label><textarea name="notes" id="notesInput" rows="4" placeholder="เหตุผลที่เก็บไว้, ตัวที่ทับซ้อน, วิธีติดตั้ง, คำสั่ง...">${esc(skill.notes)}</textarea></div>
        <div class="field"><label class="field-label" for="pathsInput">Local paths (${skill.locations.length})</label><textarea name="paths" id="pathsInput" rows="3" placeholder="C:\\Users\\...\\skills\\skill-name">${esc(skill.locations.map(x=>x.path).join('\n'))}</textarea><span class="field-help">ใส่ Path บรรทัดละ 1 รายการ หรือ Import จาก PowerShell Scan</span>${skill.locations.length?`<span class="field-help">Provider: ${esc([...new Set(skill.locations.map(x=>x.provider))].join(', '))}</span>`:''}</div>
        <div class="drawer-links">${editing&&safeURL(skill.skillUrl)?`<a class="btn btn-ghost" href="${esc(skill.skillUrl)}" target="_blank" rel="noopener noreferrer">เปิด Skill ↗</a>`:''}${editing&&safeURL(src.url)?`<a class="btn btn-ghost" href="${esc(safeURL(src.url))}" target="_blank" rel="noopener noreferrer">เปิด Repository ↗</a>`:''}${editing&&safeURL(skill.referenceUrl)?`<a class="btn btn-ghost" href="${esc(skill.referenceUrl)}" target="_blank" rel="noopener noreferrer">ลิงก์ที่ส่งมา ↗</a>`:''}</div>
        <div class="drawer-footer">${editing?'<button type="button" class="btn btn-danger" id="deleteSkill">ลบจากคลัง</button>':'<span></span>'}<div style="display:flex;gap:8px"><button type="button" class="btn btn-ghost" id="cancelDrawer">ยกเลิก</button><button type="submit" class="btn btn-primary">บันทึก Skill</button></div></div>`;
      document.getElementById('drawerBackdrop').hidden=false;document.body.style.overflow='hidden';
      document.getElementById('originInput').addEventListener('change',e=>{document.getElementById('customOriginFields').hidden=e.target.value!=='custom';});
      document.getElementById('skillForm').onsubmit=onSkillSave;
      document.getElementById('cancelDrawer').onclick=closeDrawer;
      if(editing)document.getElementById('deleteSkill').onclick=()=>{if(confirm(`ลบ "${skill.name}" ออกจากคลัง? ไม่ได้ลบไฟล์ Skill จริง`)){ui.state.skills=ui.state.skills.filter(x=>x.id!==skill.id);closeDrawer();save();render();toast('ลบจากคลังแล้ว (ไฟล์จริงไม่ได้ถูกลบ)');}};
      document.querySelector('[name="name"]').focus();
    }
    function onSkillSave(e) {
      e.preventDefault();const form=new FormData(e.currentTarget);
      const name=String(form.get('name')||'').trim();if(!name)return;
      const locations=String(form.get('paths')||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,60);
      const existing=ui.drawerId!==null?ui.state.skills.find(x=>x.id===ui.drawerId):null;
      const duplicate=ui.state.skills.find(x=>x.name.toLowerCase()===name.toLowerCase()&&x.id!==ui.drawerId);
      if(duplicate){toast('มีชื่อ Skill นี้อยู่แล้ว');return;}
      const next=normalSkill({
        ...(existing||{}),id:existing?.id||('custom-'+Date.now()),number:existing?.number||ui.state.skills.length+1,
        name,description:String(form.get('description')||''),category:form.get('category'),originId:form.get('originId'),tier:form.get('tier'),
        customOriginLabel:String(form.get('customOriginLabel')||''),customOriginUrl:String(form.get('customOriginUrl')||''),skillUrl:String(form.get('skillUrl')||''),referenceUrl:String(form.get('referenceUrl')||''),notes:String(form.get('notes')||''),
        locations:locations.map(path=>({path,provider:existing?.locations.find(x=>x.path===path)?.provider||'manual'})),custom:existing?.custom??true
      });
      if(existing){ui.state.skills=ui.state.skills.map(x=>x.id===existing.id?next:x);}else{ui.state.skills.push(next);}
      closeDrawer();save();render();toast(existing?'บันทึกการแก้ไขแล้ว':'เพิ่ม Skill แล้ว');
    }
    function closeDrawer() {document.getElementById('drawerBackdrop').hidden=true;document.body.style.overflow='';ui.drawerId=null;if(ui.previousFocus?.isConnected)ui.previousFocus.focus();}
    function download(filename,content,type='application/json;charset=utf-8'){
      const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);
      const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
    function exportJSON(){download('skill-vault.json',JSON.stringify({schema:'skill-vault/1',exportedAt:new Date().toISOString(),...ui.state},null,2));toast('Export JSON แล้ว — เก็บไฟล์นี้ไว้สำหรับเครื่องใหม่');}
    function exportMarkdown(){
      const rows=ui.state.skills.slice().sort((a,b)=>a.number-b.number);
      const clean=(s)=>String(s??'').replace(/\|/g,'\\|').replace(/\r?\n/g,' ').trim();
      const content=['# Skill Vault — Agent Skill Inventory','',`Exported: ${new Date().toISOString()}`,'','> ตารางนี้เป็นรายการและ Tier เท่านั้น **ไม่ใช่การสำรองไฟล์ SKILL.md**','', '| # | Skill | Tier | Category | Repository | Skill URL | Local paths |','|---:|---|:---:|---|---|---|---|',...rows.map(x=>`| ${x.number||'—'} | ${clean(x.name)} | ${clean(x.tier)} | ${clean(x.category)} | ${clean(getSource(x).repo)} | ${clean(x.skillUrl||getSource(x).url)} | ${clean(x.locations.map(loc=>loc.path).join('; '))} |`),'','## Notes','',...rows.filter(x=>x.notes).map(x=>`### ${x.name}\n\n${x.notes}\n`)].join('\n');
      download('skill-vault.md',content,'text/markdown;charset=utf-8');toast('Export Markdown แล้ว');
    }
    async function readJSON(file){const text=await file.text();return JSON.parse(text.replace(/^\uFEFF/,''));}
    async function importInventory(file){
      try{const input=await readJSON(file);
        if(input.schema==='skill-vault-scan/1'){await importScan(file,input);return;}
        const data=normalizeState(input);
        upgradeCatalog(data);
        if(!confirm(`นำเข้าคลัง ${data.skills.length} Skills และแทนที่ข้อมูลปัจจุบัน ${ui.state.skills.length} ตัว? หากยังไม่เคย Export JSON โปรดกดยกเลิกก่อน`))return;
        ui.state=data;ui.visible=24;ui.filters={search:'',category:'all',source:'all',tier:'all',found:'all'};save();render();toast('Import Skill Vault สำเร็จ '+data.skills.length+' ตัว');
      }catch(e){toast('Import ไม่สำเร็จ: '+e.message);console.error(e);}
    }
    async function importScan(file,preParsed){
      try{
        const report=preParsed||await readJSON(file);
        if(report.schema!=='skill-vault-scan/1'||!Array.isArray(report.skills))throw new Error('ต้องใช้ไฟล์ skill-vault-scan.json จาก PowerShell');
        if(!confirm(`อ่าน Scan report ${report.skills.length} รายการ? จะอัปเดต Path ที่เคย Scan แต่เก็บ Tier/Notes เดิมไว้`))return;
        for(const skill of ui.state.skills){skill.locations=skill.locations.filter(x=>x.provider==='manual');}
        let matched=0,added=0;
        for(const item of report.skills){
          if(!item||typeof item.name!=='string'||typeof item.path!=='string')continue;
          const name=item.name.trim();const provider=String(item.provider||'unknown').trim();const path=item.path.trim();if(!name||!path)continue;
          const lower=name.toLowerCase();
          const preferred=provider.toLowerCase().includes('agents')?ui.state.skills.find(x=>x.name.toLowerCase()==='agents/'+lower):null;
          let found=preferred||ui.state.skills.find(x=>x.name.toLowerCase()===lower);
          if(!found){found=normalSkill({id:'scanned-'+Date.now()+'-'+added,number:ui.state.skills.length+1,name,category:'Agent & Tools',originId:'custom',customOriginLabel:'จากเครื่อง (ไม่ระบุ Repo)',tier:'U',description:'พบจาก PowerShell Scan',custom:true},'scanned-'+added);ui.state.skills.push(found);added++;}else matched++;
          if(!found.locations.some(x=>x.path.toLowerCase()===path.toLowerCase()))found.locations.push({provider,path});
        }
        ui.state.lastScan={scannedAt:String(report.scannedAt||new Date().toISOString()),machine:String(report.machine||''),count:report.skills.length,matched,added};
        save();render();toast(`Import Scan แล้ว · จับคู่ ${matched} · เพิ่ม ${added} รายการ`);
      }catch(e){toast('Import Scan ไม่สำเร็จ: '+e.message);console.error(e);}
    }
    function resetSuggested(){if(!confirm('เปลี่ยน Tier ทุก Skill กลับเป็นค่าแนะนำเริ่มต้น?'))return;const ranking=Object.fromEntries(SEED.skills.map(x=>[x.name,x.tier]));ui.state.skills.forEach(x=>x.tier=ranking[x.name]||'U');save();render();toast('คืน Tier เริ่มต้นแล้ว');}
    function clearTiers(){if(!confirm('ล้าง Tier ทุก Skill ให้เป็น Unranked?'))return;ui.state.skills.forEach(x=>x.tier='U');save();render();toast('ล้าง Tier แล้ว');}
    function handleAction(action){
      if(action==='add-skill')openDrawer();
      if(action==='export-json')exportJSON();
      if(action==='export-markdown')exportMarkdown();
      if(action==='import-inventory')document.getElementById('inventoryFile').click();
      if(action==='import-scan')document.getElementById('scanFile').click();
      if(action==='reset-suggested')resetSuggested();
      if(action==='clear-tiers')clearTiers();
      if(action==='download-script'){download('skill-vault-backup.ps1',document.getElementById('backupPowerShell').textContent,'text/plain;charset=utf-8');toast('ดาวน์โหลด PowerShell แล้ว');}
      if(action==='copy-command'){
        const command=document.getElementById('scanCommand').textContent;
        if(navigator.clipboard && window.isSecureContext){navigator.clipboard.writeText(command).then(()=>toast('คัดลอกคำสั่งแล้ว')).catch(()=>toast('กรุณาคัดลอกคำสั่งด้วยตนเอง'));}
        else{const textarea=document.createElement('textarea');textarea.value=command;document.body.appendChild(textarea);textarea.select();const ok=document.execCommand('copy');textarea.remove();toast(ok?'คัดลอกคำสั่งแล้ว':'กรุณาคัดลอกคำสั่งด้วยตนเอง');}
      }
      if(action==='reset-catalog'){
        if(!confirm(`คืนรายการเริ่มต้น ${SEED.skills.length} ตัวและ Tier เริ่มต้นทั้งหมด? รายการที่เพิ่มเอง, Notes และ Scan report จะหาย หากต้องการเก็บไว้ให้ Export JSON ก่อน`))return;
        ui.state=baseState();save();ui.filters={search:'',category:'all',source:'all',tier:'all',found:'all'};render();toast('คืนรายการเริ่มต้นแล้ว');
      }
    }
    document.addEventListener('click',e=>{
      const nav=e.target.closest('[data-nav]');if(nav){pageTo(nav.dataset.nav);return;}
      const action=e.target.closest('[data-action]');if(action){handleAction(action.dataset.action);return;}
      const opener=e.target.closest('[data-open]');if(opener){openDrawer(opener.dataset.open);return;}
      const view=e.target.closest('[data-source-view]');if(view){ui.filters={search:'',category:'all',source:view.dataset.sourceView,tier:'all',found:'all'};ui.visible=ui.state.skills.length;pageTo('library');return;}
    });
    document.addEventListener('change',e=>{
      const tier=e.target.closest('[data-tier-select]');if(tier){const skill=ui.state.skills.find(x=>x.id===tier.dataset.tierSelect);if(skill){skill.tier=tier.value;save();render();}return;}
      const check=e.target.closest('[data-check]');if(check){ui.state.checklist[check.dataset.check]=check.checked;save();return;}
      const fields={categoryFilter:'category',sourceFilter:'source',tierFilter:'tier',foundFilter:'found'};
      if(fields[e.target.id]){ui.filters[fields[e.target.id]]=e.target.value;ui.visible=24;renderLibrary();}
    });
    document.getElementById('searchInput').addEventListener('input',e=>{ui.filters.search=e.target.value;ui.visible=24;renderLibrary();document.getElementById('searchInput').focus();document.getElementById('searchInput').setSelectionRange(ui.filters.search.length,ui.filters.search.length);});
    document.getElementById('loadMoreBtn').addEventListener('click',()=>{ui.visible+=24;renderLibrary();});
    document.getElementById('closeDrawer').addEventListener('click',closeDrawer);
    document.getElementById('drawerBackdrop').addEventListener('mousedown',e=>{if(e.target.id==='drawerBackdrop')closeDrawer();});
    document.getElementById('inventoryFile').addEventListener('change',async e=>{const file=e.target.files[0];if(file)await importInventory(file);e.target.value='';});
    document.getElementById('scanFile').addEventListener('change',async e=>{const file=e.target.files[0];if(file)await importScan(file);e.target.value='';});
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape' && !document.getElementById('drawerBackdrop').hidden){closeDrawer();return;}
      const tag=document.activeElement?.tagName||'';
      if(e.key==='/' && ui.page==='library' && !['INPUT','TEXTAREA','SELECT'].includes(tag) && document.getElementById('drawerBackdrop').hidden){e.preventDefault();document.getElementById('searchInput').focus();}
    });
    const board=document.getElementById('tierBoard');
    board.addEventListener('dragstart',e=>{const token=e.target.closest('[data-drag]');if(!token)return;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',token.dataset.drag);token.classList.add('dragging');});
    board.addEventListener('dragend',e=>{e.target.closest('[data-drag]')?.classList.remove('dragging');board.querySelectorAll('.tier-lane').forEach(x=>x.classList.remove('drag-over'));});
    board.addEventListener('dragover',e=>{const lane=e.target.closest('.tier-lane');if(lane){e.preventDefault();e.dataTransfer.dropEffect='move';board.querySelectorAll('.tier-lane').forEach(x=>x.classList.toggle('drag-over',x===lane));}});
    board.addEventListener('drop',e=>{const lane=e.target.closest('.tier-lane');if(!lane)return;e.preventDefault();board.querySelectorAll('.tier-lane').forEach(x=>x.classList.remove('drag-over'));
      const id=e.dataTransfer.getData('text/plain');const item=ui.state.skills.find(x=>x.id===id);if(!item)return;
      item.tier=lane.dataset.tier;save();renderBoard();toast(`ย้าย ${item.name} ไป Tier ${tierLabel(item.tier)} แล้ว`);
    });
    const themeToggle = document.getElementById('themeToggle');
    function reflectTheme() {
      const dark = document.documentElement.dataset.theme === 'dark';
      themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.setAttribute('aria-pressed', String(dark));
    }
    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('skill-vault:theme', next); } catch (_) { /* private/file mode */ }
      reflectTheme();
    });
    reflectTheme();
    setupFilters();render();
  