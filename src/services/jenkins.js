const base = process.env.REACT_APP_JENKINS_URL?.replace(/\/+$/, '');
const user = process.env.REACT_APP_JENKINS_USER;
const token = process.env.REACT_APP_JENKINS_API_TOKEN;
const job = process.env.REACT_APP_JENKINS_JOB;

function authHeader() {
  if (!user || !token) return {};
  const b64 = btoa(`${user}:${token}`);
  return { Authorization: `Basic ${b64}` };
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { 'Accept': 'application/json', ...authHeader() } });
  if (!res.ok) throw new Error(`Jenkins API ${res.status} ${res.statusText}`);
  return res.json();
}

function jobPath(name) {
  return name.split('/').filter(Boolean).map(s => `job/${encodeURIComponent(s)}`).join('/');
}

function folderPath(name) {
  return jobPath(name);
}

export async function getJobBuilds(jobName, limit = 50) {
  const query = `tree=builds[number,result,timestamp,duration,building]{,${limit}}`;
  const path = jobPath(jobName);
  const url = base ? `${base}/${path}/api/json?${query}` : `/${path}/api/json?${query}`;
  const data = await fetchJSON(url);
  return data.builds || [];
}

export async function getComputers() {
  const query = `tree=computer[displayName,offline]`;
  const url = base ? `${base}/computer/api/json?${query}` : `/computer/api/json?${query}`;
  const data = await fetchJSON(url);
  return data.computer || [];
}

export async function getFolderJobCount(folderName, recursive = true) {
  const path = folderPath(folderName);
  const query = recursive
    ? 'tree=jobs[name,_class,url,jobs[name,_class,url,jobs[name,_class]]]'
    : 'tree=jobs[name,_class,url]';
  const url = base ? `${base}/${path}/api/json?${query}` : `/${path}/api/json?${query}`;
  const data = await fetchJSON(url);
  const jobs = data.jobs || [];

  function count(list) {
    return (list || []).reduce((acc, j) => {
      const isFolder = j._class && j._class.includes('Folder');
      if (isFolder) return acc + count(j.jobs || []);
      return acc + 1;
    }, 0);
  }

  return { total: count(jobs), jobs };
}

export async function getMetrics() {
  if (!job) return { deploymentsToday: 0, pipelineSuccess: 0, uptime: 0 };
  
  try {
    const [builds, computers] = await Promise.all([getJobBuilds(job, 50), getComputers()]);

    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const recent = builds.filter(b => b.timestamp >= dayAgo);
    const deploymentsToday = recent.filter(b => b.result === 'SUCCESS').length;

    const window = builds.slice(0, 20).filter(b => !b.building);
    const successes = window.filter(b => b.result === 'SUCCESS').length;
    const pipelineSuccess = window.length ? Math.round((successes / window.length) * 1000) / 10 : 0;

    const total = computers.length || 1;
    const online = computers.filter(c => !c.offline).length;
    const uptime = Math.round((online / total) * 1000) / 10;

    return { deploymentsToday, pipelineSuccess, uptime };
  } catch (e) {
    console.error('Jenkins metrics error:', e);
    return { deploymentsToday: 0, pipelineSuccess: 0, uptime: 0 };
  }
}