// utils.js — seeded RNG and geometry helpers

// xmur3 hash -> seed
function xmur3(str){
  for(var i=0,h=1779033703^str.length;i<str.length;i++)h=Math.imul(h^str.charCodeAt(i),3432918353),h=h<<13|h>>>19;return function(){h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return (h^h>>>16)>>>0}
}

// mulberry32 RNG
function mulberry32(a){return function(){a|=0;var t=a+=0x6D2B79F5; t= Math.imul(t ^ t>>>15, t | 1); t ^= t + Math.imul(t ^ t>>>7, t | 61); return ((t ^ t>>>14) >>> 0) / 4294967296; }}

function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function lerp(a,b,t){return a+(b-a)*t}

// compute polyline tangents and normals (returns array of normals per point)
function computeNormals(points){
  const n=[];
  if(points.length<2) return points.map(()=>[0,0]);
  // detect closed polyline (first and last identical)
  const first = points[0];
  const last = points[points.length-1];
  const closed = Math.hypot(first[0]-last[0], first[1]-last[1]) < 1e-6;
  const L = points.length;
  if(closed){
    // ignore the duplicated last point for wrapping normals
    const M = L-1;
    for(let i=0;i<M;i++){
      const p0 = points[(i-1+M)%M];
      const p1 = points[(i+1)%M];
      const tx = p1[0]-p0[0], ty = p1[1]-p0[1];
      const len = Math.hypot(tx,ty)||1; n.push([-ty/len, tx/len]);
    }
    // duplicate first normal to keep array length consistent with input
    n.push(n[0]);
    return n;
  }
  for(let i=0;i<points.length;i++){
    const p0=points[Math.max(0,i-1)];
    const p1=points[Math.min(points.length-1,i+1)];
    const tx=p1[0]-p0[0], ty=p1[1]-p0[1];
    const len=Math.hypot(tx,ty)||1; const nx=-ty/len, ny=tx/len; n.push([nx,ny]);
  }
  return n;
}

// offset polyline by distance d (positive outward along normal)
function offsetPolyline(points,d){
  const normals=computeNormals(points);
  const out=[];
  for(let i=0;i<points.length;i++){ out.push([points[i][0]+normals[i][0]*d, points[i][1]+normals[i][1]*d]); }
  return out;
}

// polyline length
function polylineLength(points){let L=0;for(let i=1;i<points.length;i++){L+=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1])}return L}

// resample polyline into N points evenly
function resamplePolyline(points, N){
  const L=polylineLength(points); if(L===0)return points.slice();
  const out=[]; let t=0, target=0; const segs=[];
  for(let i=1;i<points.length;i++){ segs.push({p0:points[i-1],p1:points[i],l:Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1])}); }
  for(let i=0;i<N;i++){ target = (i/(N-1))*L; let acc=0; for(let s=0;s<segs.length;s++){ if(acc+segs[s].l>=target || s===segs.length-1){ const local= (target-acc)/segs[s].l || 0; const x=lerp(segs[s].p0[0],segs[s].p1[0],local); const y=lerp(segs[s].p0[1],segs[s].p1[1],local); out.push([x,y]); break } acc+=segs[s].l } }
  return out;
}

// compute bounding box
function bboxOfPolylines(polys){let minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9; polys.forEach(p=>p.forEach(pt=>{minx=Math.min(minx,pt[0]);miny=Math.min(miny,pt[1]);maxx=Math.max(maxx,pt[0]);maxy=Math.max(maxy,pt[1])})); return {minx,miny,maxx,maxy,width:maxx-minx,height:maxy-miny}
}

// ensure only letters and uppercase
function sanitizeWord(s){ return (s||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,18); }

export { xmur3, mulberry32, clamp, lerp, computeNormals, offsetPolyline, polylineLength, resamplePolyline, bboxOfPolylines, sanitizeWord };
