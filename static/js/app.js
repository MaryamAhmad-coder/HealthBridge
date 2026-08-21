class ApiClient {
  constructor(base = '') { this.base = base; }
  async search(q){
    const res = await fetch(`${this.base}/api/resources?q=${encodeURIComponent(q)}`);
    return res.json();
  }
  async aiAssist(prompt){
    const res = await fetch(`${this.base}/api/ai/assist`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
    return res.json();
  }
  async adminList(token){
    const res = await fetch(`${this.base}/api/admin/resources`, {headers:{'x-admin-token':token}});
    return res.json();
  }
  async adminCreate(token, item){
    const res = await fetch(`${this.base}/api/admin/resources`, {method:'POST',headers:{'Content-Type':'application/json','x-admin-token':token},body:JSON.stringify(item)});
    return res.json();
  }
  async adminUpdate(token,id,item){
    const res = await fetch(`${this.base}/api/admin/resources/${id}`, {method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':token},body:JSON.stringify(item)});
    return res.json();
  }
  async adminDelete(token,id){
    const res = await fetch(`${this.base}/api/admin/resources/${id}`, {method:'DELETE',headers:{'x-admin-token':token}});
    return res.json();
  }
}

class UIManager{
  constructor(){
    this.api = new ApiClient('');
    this.searchInput = document.getElementById('search-input');
    this.searchBtn = document.getElementById('search-btn');
    this.results = document.getElementById('results');
    this.aiSuggestion = document.getElementById('ai-suggestion');
    this.adminLoginBtn = document.getElementById('admin-login-btn');
    this.adminPanel = document.getElementById('admin-panel');
    this.adminToken = null;
    this.attach();
  }
  attach(){
    this.searchBtn.addEventListener('click', ()=>this.doSearch());
    this.searchInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') this.doSearch(); });
    this.adminLoginBtn.addEventListener('click', ()=>this.promptAdmin());
  }
  async doSearch(){
    const q = this.searchInput.value.trim();
    this.results.innerHTML = 'Loading...';
    const data = await this.api.search(q);
    this.renderResults(data.results || []);
    // ask AI for a brief safe summary/suggestions
    const ai = await this.api.aiAssist(q || 'general health resources');
    this.aiSuggestion.textContent = ai.text || '';
  }
  renderResults(items){
    if(!items || items.length===0) { this.results.innerHTML = '<em>No results</em>'; return; }
    this.results.innerHTML = '';
    items.forEach(it=>{
      const el = document.createElement('div'); el.className='resource';
      el.innerHTML = `<strong>${it.title}</strong><div>${it.description||''}</div><small>${(it.tags||[]).join(', ')}</small>`;
      this.results.appendChild(el);
    });
  }
  promptAdmin(){
    const token = prompt('Enter admin token');
    if(!token) return;
    this.adminToken = token;
    this.loadAdminPanel();
  }
  async loadAdminPanel(){
    const data = await this.api.adminList(this.adminToken);
    this.adminPanel.style.display = 'block';
    this.adminPanel.innerHTML = '';
    const addBtn = document.createElement('button'); addBtn.textContent='Add resource'; addBtn.className='btn';
    addBtn.addEventListener('click', ()=>this.showAddForm());
    this.adminPanel.appendChild(addBtn);
    const list = document.createElement('div');
    (data.results||[]).forEach(r=>{
      const item = document.createElement('div'); item.className='resource';
      item.innerHTML = `<strong>${r.title}</strong> <button data-id="${r.id}">Edit</button> <button data-del="${r.id}">Delete</button><div>${r.description||''}</div>`;
      item.querySelector('button[data-id]').addEventListener('click', ()=>this.showEditForm(r));
      item.querySelector('button[data-del]').addEventListener('click', async ()=>{ await this.api.adminDelete(this.adminToken,r.id); this.loadAdminPanel(); });
      list.appendChild(item);
    });
    this.adminPanel.appendChild(list);
  }
  showAddForm(){
    const f = document.createElement('div');
    f.innerHTML = `<input class="admin-input" id="a_title" placeholder="Title" /><textarea class="admin-input" id="a_desc" placeholder="Description"></textarea><input class="admin-input" id="a_tags" placeholder="tags comma separated" /><button id="a_save" class="btn">Save</button>`;
    this.adminPanel.insertBefore(f, this.adminPanel.children[1]);
    document.getElementById('a_save').addEventListener('click', async ()=>{
      const item = { title: document.getElementById('a_title').value, description: document.getElementById('a_desc').value, tags: (document.getElementById('a_tags').value||'').split(',').map(s=>s.trim()).filter(Boolean) };
      await this.api.adminCreate(this.adminToken,item);
      this.loadAdminPanel();
    });
  }
  showEditForm(r){
    const f = document.createElement('div');
    f.innerHTML = `<input class="admin-input" id="e_title" value="${r.title}" /><textarea class="admin-input" id="e_desc">${r.description||''}</textarea><input class="admin-input" id="e_tags" value="${(r.tags||[]).join(', ')}" /><button id="e_save" class="btn">Update</button>`;
    this.adminPanel.insertBefore(f, this.adminPanel.children[1]);
    document.getElementById('e_save').addEventListener('click', async ()=>{
      const item = { title: document.getElementById('e_title').value, description: document.getElementById('e_desc').value, tags: (document.getElementById('e_tags').value||'').split(',').map(s=>s.trim()).filter(Boolean) };
      await this.api.adminUpdate(this.adminToken,r.id,item);
      this.loadAdminPanel();
    });
  }
}

document.addEventListener('DOMContentLoaded', ()=>new UIManager());
