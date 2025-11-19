// 활성 탭 표시
(function activateNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  const map = {
    'index.html': 'nav-home',
    'auth.html': 'nav-auth',
    'upload.html': 'nav-upload',
  };
  const id = map[path];
  if(id){
    const el = document.getElementById(id);
    if(el){ document.querySelectorAll('.nav a').forEach(a=>a.classList.remove('active')); el.classList.add('active'); }
  }
})();

// 페이지 간 유틸
function go(href){ window.location.href = href; }

// 단순 토큰/해시(데모)
function hash32(str){
  let h=2166136261>>>0; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=(h*16777619)>>>0; }
  return ('00000000'+h.toString(16)).slice(-8);
}
function tokenFrom(s){ return btoa(hash32(s)).replace(/=+$/,'').slice(0,22); }

// 업로드 페이지에서 사용될 수 있도록 export 느낌으로 노출
window.ADV_UTILS = { hash32, tokenFrom, go };