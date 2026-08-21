// DB layer: use Postgres if DATABASE_URL is set, otherwise fall back to in-memory store for demo purposes.
const DATABASE_URL = process.env.DATABASE_URL;
if (DATABASE_URL) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: DATABASE_URL });

  async function listResources() {
    const res = await pool.query('SELECT id, title, description, tags FROM resources ORDER BY id');
    return res.rows.map(r => ({ ...r, tags: r.tags || [] }));
  }

  async function findResourcesByQuery(q) {
    if (!q) return listResources();
    const like = `%${q}%`;
    const res = await pool.query(
      `SELECT id, title, description, tags FROM resources WHERE title ILIKE $1 OR description ILIKE $1 OR array_to_string(tags, ' ') ILIKE $1 ORDER BY id`,
      [like]
    );
    return res.rows.map(r => ({ ...r, tags: r.tags || [] }));
  }

  async function addResource(obj) {
    const res = await pool.query(
      'INSERT INTO resources(title, description, tags) VALUES($1,$2,$3) RETURNING id, title, description, tags',
      [obj.title, obj.description || null, obj.tags || []]
    );
    return res.rows[0];
  }

  async function updateResource(id, obj) {
    const res = await pool.query(
      'UPDATE resources SET title=$1, description=$2, tags=$3 WHERE id=$4 RETURNING id, title, description, tags',
      [obj.title, obj.description || null, obj.tags || [], id]
    );
    return res.rows[0] || null;
  }

  async function deleteResource(id) {
    const res = await pool.query('DELETE FROM resources WHERE id=$1 RETURNING id', [id]);
    return (res.rowCount || 0) > 0;
  }

  module.exports = { listResources, findResourcesByQuery, addResource, updateResource, deleteResource };
} else {
  // In-memory fallback
  let resources = [
    {
      id: 1,
      title: 'Local Clinic — Free Vaccination Events',
      description: 'Weekly free vaccination clinics at Community Center.',
      tags: ['vaccination', 'clinic', 'community']
    },
    {
      id: 2,
      title: 'Mental Health Hotline',
      description: '24/7 confidential support and referral.',
      tags: ['mental health', 'hotline']
    }
  ];
  let nextId = 3;
  function listResources() { return resources; }
  function findResourcesByQuery(q) {
    if (!q) return resources;
    q = q.toLowerCase();
    return resources.filter(r => {
      return (r.title && r.title.toLowerCase().includes(q)) ||
             (r.description && r.description.toLowerCase().includes(q)) ||
             (r.tags && r.tags.join(' ').toLowerCase().includes(q));
    });
  }
  function addResource(obj) { const r = Object.assign({ id: nextId++ }, obj); resources.push(r); return r; }
  function updateResource(id, obj) { const i = resources.findIndex(r => r.id === id); if (i === -1) return null; resources[i] = Object.assign({}, resources[i], obj); return resources[i]; }
  function deleteResource(id) { const i = resources.findIndex(r => r.id === id); if (i === -1) return false; resources.splice(i, 1); return true; }
  module.exports = { listResources, findResourcesByQuery, addResource, updateResource, deleteResource };
}
