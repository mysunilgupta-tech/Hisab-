
// Guest Mode: no login/account required. Data stays on this device via localStorage.
const HISAB_GUEST_KEY = 'hisabGuestMode';
function enterGuestMode(){
  localStorage.setItem(HISAB_GUEST_KEY, 'true');
  document.getElementById('guestGate')?.classList.add('hidden');
  document.getElementById('appShell')?.classList.remove('hidden');
}
function showGuestGate(){
  const gate = document.getElementById('guestGate');
  const shell = document.getElementById('appShell');
  if(localStorage.getItem(HISAB_GUEST_KEY)==='true'){
    gate?.classList.add('hidden');
    shell?.classList.remove('hidden');
  }else{
    gate?.classList.remove('hidden');
    shell?.classList.add('hidden');
  }
}
function resetGuestMode(){
  if(confirm('Guest mode reset karne par sirf is device ki local app data delete hogi. Continue?')){
    localStorage.clear();
    location.reload();
  }
}

let data=JSON.parse(localStorage.getItem('hisabData')||'{"business":[],"personal":[]}');
function save(){localStorage.setItem('hisabData',JSON.stringify(data));render()}
function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.add('hidden'));document.getElementById(id).classList.remove('hidden');render()}
function money(n){return '₹'+Math.abs(n).toLocaleString('en-IN')}
function addPerson(type){
 const name=prompt(type==='business'?'Customer ka naam':'Dost/Rishtedar ka naam'); if(!name)return;
 data[type].push({name,transactions:[]}); save();
}
function addTxn(type,i,kind){
 const amount=Number(prompt(kind==='given'?'Kitna paisa diya?':'Kitna paisa mila?'));
 if(!Number.isFinite(amount)||amount<=0)return;
 const note=prompt('Note (optional)')||'';
 data[type][i].transactions.push({kind,amount,note,date:new Date().toLocaleDateString('en-IN')});
 save();
}
function renderList(type,id){
 const el=document.getElementById(id); el.innerHTML='';
 data[type].forEach((p,i)=>{
   let bal=p.transactions.reduce((s,t)=>s+(t.kind==='given'?t.amount:-t.amount),0);
   const hist=p.transactions.slice(-5).reverse().map(t=>`<div class="muted">${t.date} — ${t.kind==='given'?'दिया':'मिला'} ${money(t.amount)} ${t.note?'· '+t.note:''}</div>`).join('');
   el.innerHTML+=`<div class="person"><h3>${p.name}</h3><div class="balance">${bal>0?'लेना है: '+money(bal):bal<0?'देना है: '+money(bal):'हिसाब बराबर'}</div>
   <button onclick="addTxn('${type}',${i},'given')">💸 पैसा दिया</button><button onclick="addTxn('${type}',${i},'received')">💰 पैसा मिला</button>
   ${hist?'<hr>'+hist:''}</div>`;
 });
}
function render(){
 renderList('business','businessList'); renderList('personal','personalList');
 let rec=0,pay=0;
 [...data.business,...data.personal].forEach(p=>p.transactions.forEach(t=>t.kind==='given'?rec+=t.amount:pay+=t.amount));
 document.getElementById('receivable').textContent=money(Math.max(0,rec-pay));
 document.getElementById('payable').textContent=money(Math.max(0,pay-rec));
}
render();

function calcBudget(){
 const income=Number(document.getElementById('mIncome').value)||0;
 const budget=Number(document.getElementById('mBudget').value)||0;
 const target=Number(document.getElementById('mSaving').value)||0;
 const after=income-budget;
 const ok=after>=target;
 document.getElementById('budgetResult').innerHTML=`<b>Monthly result</b><br>Income: ₹${income.toLocaleString('en-IN')}<br>Home budget: ₹${budget.toLocaleString('en-IN')}<br>Available after budget: ₹${after.toLocaleString('en-IN')}<br>Saving target: ₹${target.toLocaleString('en-IN')}<br><strong>${ok?'✅ Target possible':'⚠️ Target needs a lower budget or higher income'}</strong>`;
}
function calcGoal(){
 const name=document.getElementById('gName').value||'Goal';
 const target=Number(document.getElementById('gTarget').value)||0;
 const current=Number(document.getElementById('gCurrent').value)||0;
 const monthly=Number(document.getElementById('gMonthly').value)||0;
 const remain=Math.max(0,target-current);
 const months=monthly>0?Math.ceil(remain/monthly):0;
 const pct=target>0?Math.min(100,(current/target)*100):0;
 document.getElementById('goalResult').innerHTML=`<b>${name}</b><br>Target: ₹${target.toLocaleString('en-IN')}<br>Saved: ₹${current.toLocaleString('en-IN')}<br>Remaining: ₹${remain.toLocaleString('en-IN')}<br>Monthly saving: ₹${monthly.toLocaleString('en-IN')}<br>Progress: ${pct.toFixed(0)}%<br><strong>${monthly>0?`लगभग ${months} महीने बाकी`:'Monthly saving amount enter करें'}</strong>`;
}

let bills=JSON.parse(localStorage.getItem('hisabBills')||'[]');
function calcEMI(){
 const P=Number(document.getElementById('loan').value)||0;
 const annual=Number(document.getElementById('rate').value)||0;
 const n=Number(document.getElementById('tenure').value)||0;
 const r=annual/12/100;
 let emi=0;
 if(P>0&&n>0) emi=r?P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):P/n;
 const total=emi*n, interest=Math.max(0,total-P);
 document.getElementById('emiResult').innerHTML=`<b>Estimated EMI: ₹${emi.toFixed(0).toLocaleString('en-IN')}</b><br>Total payment: ₹${total.toFixed(0).toLocaleString('en-IN')}<br>Total interest: ₹${interest.toFixed(0).toLocaleString('en-IN')}`;
}
function addBill(forceName){
 const name=forceName||document.getElementById('billName').value||'Bill';
 const amount=forceName?(Number(document.getElementById('cardBill').value)||0):(Number(document.getElementById('billAmount').value)||0);
 const due=forceName?document.getElementById('cardDue').value:document.getElementById('billDue').value;
 if(!amount||!due){alert('Amount aur due date enter karein');return}
 bills.push({name,amount,due,paid:false});localStorage.setItem('hisabBills',JSON.stringify(bills));renderBills();
}
function toggleBill(i){bills[i].paid=!bills[i].paid;localStorage.setItem('hisabBills',JSON.stringify(bills));renderBills()}
function renderBills(){
 const el=document.getElementById('billList'); if(!el)return; el.innerHTML='';
 bills.forEach((b,i)=>{el.innerHTML+=`<div class="person"><b>${b.name}</b><br>₹${b.amount.toLocaleString('en-IN')} · Due: ${b.due}<br><button onclick="toggleBill(${i})">${b.paid?'✅ Paid':'⏳ Mark Paid'}</button></div>`})
}
renderBills();

let ins=JSON.parse(localStorage.getItem('hisabInsurance')||'[]');
let schools=JSON.parse(localStorage.getItem('hisabSchools')||'[]');
let vehicles=JSON.parse(localStorage.getItem('hisabVehicles')||'[]');
function calcFD(){
 const p=Number(document.getElementById('fdP').value)||0, r=Number(document.getElementById('fdR').value)||0, n=Number(document.getElementById('fdN').value)||0;
 const maturity=p*Math.pow(1+r/400,n/3);
 document.getElementById('fdResult').innerHTML=`<b>Estimated maturity: ₹${maturity.toFixed(0).toLocaleString('en-IN')}</b><br>Principal: ₹${p.toLocaleString('en-IN')}<br>Estimated interest: ₹${Math.max(0,maturity-p).toFixed(0).toLocaleString('en-IN')}`;
}
function addInsurance(){const name=document.getElementById('insName').value||'Insurance';const premium=Number(document.getElementById('insPremium').value)||0;const date=document.getElementById('insDate').value;if(!premium||!date)return alert('Premium aur renewal date enter karein');ins.push({name,premium,date});localStorage.setItem('hisabInsurance',JSON.stringify(ins));renderFamily()}
function addSchool(){const child=document.getElementById('child').value||'Child';const fee=Number(document.getElementById('schoolFee').value)||0;const due=document.getElementById('schoolDue').value;const books=Number(document.getElementById('schoolBooks').value)||0;if(!fee||!due)return alert('Fee aur due date enter karein');schools.push({child,fee,due,books});localStorage.setItem('hisabSchools',JSON.stringify(schools));renderFamily()}
function addVehicle(){const vehicle=document.getElementById('vehicle').value||'Vehicle';const fuel=Number(document.getElementById('fuel').value)||0;const service=document.getElementById('service').value;const vehicleIns=document.getElementById('vehicleIns').value;const puc=document.getElementById('puc').value;vehicles.push({vehicle,fuel,service,vehicleIns,puc});localStorage.setItem('hisabVehicles',JSON.stringify(vehicles));renderFamily()}
function renderFamily(){
 let e=document.getElementById('insList');if(e)e.innerHTML=ins.map(x=>`<div class="person"><b>${x.name}</b><br>Premium: ₹${x.premium.toLocaleString('en-IN')} · Renewal: ${x.date}</div>`).join('');
 e=document.getElementById('schoolList');if(e)e.innerHTML=schools.map(x=>`<div class="person"><b>${x.child}</b><br>Fee: ₹${x.fee.toLocaleString('en-IN')} · Due: ${x.due}<br>Books/Uniform budget: ₹${x.books.toLocaleString('en-IN')}</div>`).join('');
 e=document.getElementById('vehicleList');if(e)e.innerHTML=vehicles.map(x=>`<div class="person"><b>${x.vehicle}</b><br>Fuel budget: ₹${x.fuel.toLocaleString('en-IN')}/month<br>Service: ${x.service||'-'} · Insurance: ${x.vehicleIns||'-'} · PUC: ${x.puc||'-'}</div>`).join('');
}
renderFamily();

let transactions=JSON.parse(localStorage.getItem('hisabTransactions')||'[]');
function addTransaction(){
 const type=document.getElementById('txType').value, amount=Number(document.getElementById('txAmount').value)||0;
 const category=document.getElementById('txCat').value, note=document.getElementById('txNote').value||'';
 if(amount<=0)return alert('Amount enter karein');
 transactions.push({type,amount,category,note,date:new Date().toLocaleDateString('en-IN')});
 localStorage.setItem('hisabTransactions',JSON.stringify(transactions));renderReports();
}
function renderReports(){
 const income=transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
 const expense=transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
 document.getElementById('rIncome').textContent='₹'+income.toLocaleString('en-IN');
 document.getElementById('rExpense').textContent='₹'+expense.toLocaleString('en-IN');
 document.getElementById('rSaving').textContent='₹'+(income-expense).toLocaleString('en-IN');
 document.getElementById('rCount').textContent=transactions.length;
 const cats={}; transactions.filter(t=>t.type==='expense').forEach(t=>cats[t.category]=(cats[t.category]||0)+t.amount);
 const cs=document.getElementById('catSummary');cs.innerHTML='';
 Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>cs.innerHTML+=`<div class="person"><b>${k}</b><br>₹${v.toLocaleString('en-IN')}</div>`);
 const tl=document.getElementById('txList');tl.innerHTML='';
 transactions.slice(-20).reverse().forEach((t,i)=>tl.innerHTML+=`<div class="person"><b>${t.type==='income'?'➕ Income':'➖ Expense'}</b> · ${t.category}<br>₹${t.amount.toLocaleString('en-IN')} · ${t.date}<br>${t.note||''}</div>`);
}
renderReports();

let reminders=JSON.parse(localStorage.getItem('hisabReminders')||'[]');
function addReminder(){
 const name=document.getElementById('remName').value||'Reminder',type=document.getElementById('remType').value,date=document.getElementById('remDate').value,amount=Number(document.getElementById('remAmount').value)||0,note=document.getElementById('remNote').value||'';
 if(!date)return alert('Due date enter karein');
 reminders.push({name,type,date,amount,note,done:false});
 localStorage.setItem('hisabReminders',JSON.stringify(reminders));renderReminders();
}
function toggleReminder(i){reminders[i].done=!reminders[i].done;localStorage.setItem('hisabReminders',JSON.stringify(reminders));renderReminders()}
function deleteReminder(i){reminders.splice(i,1);localStorage.setItem('hisabReminders',JSON.stringify(reminders));renderReminders()}
function renderReminders(){
 const s=document.getElementById('remSummary'); if(!s)return;
 const pending=reminders.filter(x=>!x.done).length, today=new Date().toISOString().slice(0,10);
 const due=reminders.filter(x=>!x.done&&x.date<=today).length;
 s.innerHTML=`<b>Pending: ${pending}</b><br>Due today/overdue: ${due}`;
 const el=document.getElementById('remList');el.innerHTML='';
 reminders.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach((r,i)=>{
  el.innerHTML+=`<div class="person"><b>${r.done?'✅':'🔔'} ${r.name}</b><br>${r.type} · Due: ${r.date}${r.amount?'<br>₹'+r.amount.toLocaleString('en-IN'):''}${r.note?'<br>'+r.note:''}<br><button onclick="toggleReminder(${i})">${r.done?'Mark Pending':'Mark Done'}</button> <button onclick="deleteReminder(${i})">Delete</button></div>`
 })
}
renderReminders();

function allHisabData(){return {data,bills,transactions,ins,schools,vehicles,reminders,exportedAt:new Date().toISOString()}}
function downloadFile(name,text,type){const blob=new Blob([text],{type}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function exportBackup(){downloadFile('hisab-backup.json',JSON.stringify(allHisabData(),null,2),'application/json')}
function importBackup(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(x.data)data=x.data;if(x.bills)bills=x.bills;if(x.transactions)transactions=x.transactions;if(x.ins)ins=x.ins;if(x.schools)schools=x.schools;if(x.vehicles)vehicles=x.vehicles;if(x.reminders)reminders=x.reminders;localStorage.setItem('hisabData',JSON.stringify(data));localStorage.setItem('hisabBills',JSON.stringify(bills));localStorage.setItem('hisabTransactions',JSON.stringify(transactions));localStorage.setItem('hisabInsurance',JSON.stringify(ins));localStorage.setItem('hisabSchools',JSON.stringify(schools));localStorage.setItem('hisabVehicles',JSON.stringify(vehicles));localStorage.setItem('hisabReminders',JSON.stringify(reminders));render();renderReports();renderFamily();renderReminders();alert('Backup restored')}catch(e){alert('Invalid backup file')}};r.readAsText(f)}
function exportSummary(){const x=allHisabData();downloadFile('hisab-summary.txt',`HISAB SUMMARY\nExported: ${x.exportedAt}\n\nTransactions: ${transactions.length}\nBills: ${bills.length}\nBusiness Khata: ${data.business.length}\nPersonal Udhaar: ${data.personal.length}\nInsurance: ${ins.length}\nSchool Plans: ${schools.length}\nVehicles: ${vehicles.length}\nReminders: ${reminders.length}\n`,'text/plain')}
function setPin(){const p=prompt('4-6 digit PIN set karein');if(!/^\d{4,6}$/.test(p||''))return alert('PIN 4-6 digits ka hona chahiye');localStorage.setItem('hisabPin',p);alert('PIN saved')}
function lockApp(){const pin=localStorage.getItem('hisabPin');if(!pin)return alert('Pehle PIN set karein');document.body.innerHTML='<div style="max-width:360px;margin:80px auto;padding:20px;text-align:center;font-family:system-ui"><h2>🔒 Hisab Locked</h2><input id="unlock" type="password" inputmode="numeric" placeholder="PIN" style="padding:12px;width:100%;box-sizing:border-box"><button onclick="unlockApp()" style="margin-top:10px;padding:12px;width:100%">Unlock</button></div>'}
window.unlockApp=function(){const pin=localStorage.getItem('hisabPin');if(document.getElementById('unlock').value===pin)location.reload();else alert('Wrong PIN')}

let familyMembers=JSON.parse(localStorage.getItem('hisabFamilyMembers')||'[]');
let shopping=JSON.parse(localStorage.getItem('hisabShopping')||'[]');
let utilities=JSON.parse(localStorage.getItem('hisabUtilities')||'[]');
function addFamilyMember(){const name=document.getElementById('fmName').value.trim();if(!name)return;familyMembers.push({name});localStorage.setItem('hisabFamilyMembers',JSON.stringify(familyMembers));renderFamilyTools()}
function addShopping(){const item=document.getElementById('shopItem').value.trim(),budget=Number(document.getElementById('shopBudget').value)||0;if(!item||!budget)return;shopping.push({item,budget,bought:false});localStorage.setItem('hisabShopping',JSON.stringify(shopping));renderFamilyTools()}
function toggleShopping(i){shopping[i].bought=!shopping[i].bought;localStorage.setItem('hisabShopping',JSON.stringify(shopping));renderFamilyTools()}
function addUtility(){const name=document.getElementById('utilityName').value,amount=Number(document.getElementById('utilityAmount').value)||0,month=document.getElementById('utilityMonth').value;if(!amount||!month)return;utilities.push({name,amount,month});localStorage.setItem('hisabUtilities',JSON.stringify(utilities));renderFamilyTools()}
function renderFamilyTools(){
 let e=document.getElementById('fmList');if(e)e.innerHTML=familyMembers.map(x=>`<span class="person" style="display:inline-block">${x.name}</span>`).join('');
 e=document.getElementById('shopList');if(e)e.innerHTML=shopping.map((x,i)=>`<div class="person">${x.bought?'✅':'🛒'} <b>${x.item}</b> · ₹${x.budget.toLocaleString('en-IN')}<br><button onclick="toggleShopping(${i})">${x.bought?'Mark Pending':'Mark Bought'}</button></div>`).join('');
 e=document.getElementById('utilityList');if(e)e.innerHTML=utilities.slice().reverse().map(x=>`<div class="person"><b>${x.name}</b> · ${x.month}<br>₹${x.amount.toLocaleString('en-IN')}</div>`).join('');
}
function renderComparison(){
 const now=new Date(), cur=now.getMonth(), year=now.getFullYear();
 const totals={curI:0,curE:0,prevI:0,prevE:0};
 transactions.forEach(t=>{const d=new Date();const parts=t.date.split('/');if(parts.length===3){const m=Number(parts[1])-1,y=Number(parts[2]);if(y===year&&m===cur){t.type==='income'?totals.curI+=t.amount:totals.curE+=t.amount}else if(y===year&&(m===cur-1||(cur===0&&m===11&&y===year-1))){t.type==='income'?totals.prevI+=t.amount:totals.prevE+=t.amount}}});
 document.getElementById('compareResult').innerHTML=`Current month: Income ₹${totals.curI.toLocaleString('en-IN')}, Expense ₹${totals.curE.toLocaleString('en-IN')}<br>Previous month: Income ₹${totals.prevI.toLocaleString('en-IN')}, Expense ₹${totals.prevE.toLocaleString('en-IN')}<br><b>Expense change: ₹${(totals.curE-totals.prevE).toLocaleString('en-IN')}</b>`;
}
function calcEmergency(){
 const expense=Number(document.getElementById('emExpense').value)||0, months=Number(document.getElementById('emMonths').value)||0,current=Number(document.getElementById('emCurrent').value)||0;
 const target=expense*months, remain=Math.max(0,target-current),pct=target?Math.min(100,current/target*100):0;
 document.getElementById('emResult').innerHTML=`<div class="person"><b>Emergency Fund Target: ₹${target.toLocaleString('en-IN')}</b><br>Current: ₹${current.toLocaleString('en-IN')}<br>Remaining: ₹${remain.toLocaleString('en-IN')}<br>Progress: ${pct.toFixed(0)}%</div>`;
}
renderFamilyTools();

let docs=JSON.parse(localStorage.getItem('hisabDocs')||'[]');
let annualPlans=JSON.parse(localStorage.getItem('hisabAnnualPlans')||'[]');
let limits=JSON.parse(localStorage.getItem('hisabLimits')||'{}');
function addDoc(){const name=document.getElementById('docName').value.trim();const date=document.getElementById('docDate').value;if(!name)return;docs.push({name,date});localStorage.setItem('hisabDocs',JSON.stringify(docs));renderTools13()}
function addAnnual(){const name=document.getElementById('annualName').value.trim(),amount=Number(document.getElementById('annualAmount').value)||0,month=document.getElementById('annualMonth').value;if(!name||!amount||!month)return;annualPlans.push({name,amount,month});localStorage.setItem('hisabAnnualPlans',JSON.stringify(annualPlans));renderTools13()}
function saveLimit(){const cat=document.getElementById('limitCat').value,amount=Number(document.getElementById('limitAmount').value)||0;if(!amount)return;limits[cat]=amount;localStorage.setItem('hisabLimits',JSON.stringify(limits));renderTools13()}
function renderTools13(){
 let e=document.getElementById('docList');if(e)e.innerHTML=docs.map(x=>`<div class="person"><b>📄 ${x.name}</b><br>${x.date?'Expiry: '+x.date:'No expiry date'}</div>`).join('');
 e=document.getElementById('annualList');if(e)e.innerHTML=annualPlans.slice().sort((a,b)=>a.month.localeCompare(b.month)).map(x=>`<div class="person"><b>${x.name}</b><br>₹${x.amount.toLocaleString('en-IN')} · ${x.month}</div>`).join('');
 e=document.getElementById('limitList');if(e)e.innerHTML=Object.entries(limits).map(([k,v])=>`<div class="person"><b>${k}</b><br>Monthly limit: ₹${v.toLocaleString('en-IN')}</div>`).join('');
}
function searchAllData(){
 const q=(document.getElementById('searchAll').value||'').toLowerCase().trim(),el=document.getElementById('searchResults');if(!q){el.innerHTML='';return}
 const out=[];
 data.business.forEach(p=>{if(p.name.toLowerCase().includes(q))out.push('📒 Business Khata: '+p.name)});
 data.personal.forEach(p=>{if(p.name.toLowerCase().includes(q))out.push('🤝 Personal Udhaar: '+p.name)});
transactions.forEach(t=>{if((t.category+' '+t.note).toLowerCase().includes(q))out.push('💰 '+t.category+' ₹'+t.amount)});
bills.forEach(b=>{if(b.name.toLowerCase().includes(q))out.push('🧾 Bill: '+b.name)});
reminders.forEach(r=>{if((r.name+' '+r.type).toLowerCase().includes(q))out.push('🔔 Reminder: '+r.name)});
el.innerHTML=out.length?out.map(x=>`<div class="person">${x}</div>`).join(''):'<div class="person">No result</div>';
}
function shareHisab(){
 const income=transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),expense=transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
 const text=`Hisab Summary\nIncome: ₹${income.toLocaleString('en-IN')}\nExpense: ₹${expense.toLocaleString('en-IN')}\nSaving: ₹${(income-expense).toLocaleString('en-IN')}\nBusiness Khata: ${data.business.length}\nPersonal Udhaar: ${data.personal.length}`;
 if(navigator.share) navigator.share({title:'Hisab Summary',text}); else navigator.clipboard?.writeText(text).then(()=>alert('Summary copied')).catch(()=>alert(text));
}
renderTools13();
