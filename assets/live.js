(function () {
    const qs = s => document.querySelector(s);
    const qsa = s => Array.from(document.querySelectorAll(s));

    const btnStart = qs('#btn-start');
    const btnStop = qs('#btn-stop');
    const levelDbEl = qs('#level-db');
    const levelBar = qs('#level-bar');
    const latencyEl = qs('#latency');
    const confEl = qs('#confidence');
    const statusEl = qs('#status');
    const embedOpts = qs('#embed-opts');
    const verifyOpts = qs('#verify-opts');

    let stream, ctx, analyser, data, raf;
    let startedAt = 0;
    let mode = 'embed';

    qsa('input[name="mode"]').forEach(r => r.addEventListener('change', (e) => {
        mode = e.target.value;
        embedOpts.classList.toggle('hidden', mode !== 'embed');
        verifyOpts.classList.toggle('hidden', mode !== 'verify');
        confEl.textContent = '—';
    }));

    btnStart.addEventListener('click', start);
    btnStop.addEventListener('click', stop);

    async function start() {
        try {
            btnStart.disabled = true; statusEl.textContent = '권한 요청 중…';
            stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = ctx.createAnalyser();
            analyser.fftSize = 2048; analyser.smoothingTimeConstant = 0.85;
            const src = ctx.createMediaStreamSource(stream);
            src.connect(analyser);
            data = new Uint8Array(analyser.fftSize);
            startedAt = performance.now();
            statusEl.textContent = '수신 중';
            btnStop.disabled = false;
            updateLatency();
            tick();
        } catch (err) {
            console.error(err);
            statusEl.textContent = '마이크 권한 거부 또는 오류';
            btnStart.disabled = false;
        }
    }

    function stop() {
        if (raf) cancelAnimationFrame(raf);
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
        if (ctx) { ctx.close(); ctx = null; }
        btnStart.disabled = false; btnStop.disabled = true;
        statusEl.textContent = '대기'; levelDbEl.textContent = '-∞ dB'; levelBar.style.width = '0%'; confEl.textContent = '—';
    }

    function tick() {
        if (!analyser) return;
        analyser.getByteTimeDomainData(data);
        // RMS 계산
        let sum = 0; for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / data.length);
        const db = 20 * Math.log10(rms || 1e-8);
        const pct = Math.min(100, Math.max(0, (rms * 100))).toFixed(1);

        levelDbEl.textContent = db.toFixed(1) + ' dB';
        levelBar.style.width = pct + '%';

        // 데모용 신뢰도 시뮬레이션: 입력 에너지 + 키(seed) 영향
        if (mode === 'verify') {
            const vkey = (qs('#live-vkey').value || '');
            const base = Math.min(0.95, 0.55 + rms * 0.8);
            const jitter = (hash32(vkey) % 10) / 1000; // 0~0.009
            const conf = Math.max(0.0, Math.min(0.99, base + jitter));
            confEl.textContent = (conf * 100).toFixed(1) + '%';
        } else {
            const strength = Number(qs('#live-strength').value || 6);
            const boost = Math.min(0.99, 0.5 + 0.05 * strength + rms * 0.6);
            confEl.textContent = (boost * 100).toFixed(1) + '%';
        }

        raf = requestAnimationFrame(tick);
    }

    function updateLatency() {
        if (!ctx) { latencyEl.textContent = '—'; return; }
        const base = (ctx.baseLatency || 0) + (ctx.outputLatency || 0);
        const wall = (performance.now() - startedAt) / 1000;
        latencyEl.textContent = `${(base * 1000).toFixed(0)} ms (base), ${(wall).toFixed(2)} s (경과)`;
    }

    function hash32(str) { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; } return ('00000000' + h.toString(16)).slice(-8); }
})();