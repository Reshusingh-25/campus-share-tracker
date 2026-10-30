/**
 * CampusShare - QR Engine, Audio Alerts & Label Printer Service
 */

class QREngineService {
  constructor() {
    this.html5QrCode = null;
    this.isScanning = false;
    this.audioCtx = null;
  }

  // Audio synthesizer for scanner beeps and alerts using Web Audio API
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playScanBeep() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio not allowed or supported', e);
    }
  }

  playSuccessChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } catch (e) {}
  }

  playAlertWarning() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [440, 370, 440].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.15);
      });
    } catch (e) {}
  }

  /**
   * Render a QR code into any container element using qrcode.min.js
   */
  renderQR(container, text, size = 180, darkColor = '#000000', lightColor = '#ffffff') {
    if (!container) return;
    container.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
      try {
        new QRCode(container, {
          text: text,
          width: size,
          height: size,
          colorDark: darkColor,
          colorLight: lightColor,
          correctLevel: QRCode.CorrectLevel.H
        });
        return;
      } catch (err) {
        console.warn('QRCode constructor error, falling back', err);
      }
    }

    // Fallback: SVG QR representation if library is still loading
    const encoded = encodeURIComponent(text);
    container.innerHTML = `
      <div style="width:${size}px; height:${size}px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#fff; border-radius:8px; padding:12px; color:#111; font-family:monospace; text-align:center;">
        <svg viewBox="0 0 24 24" width="${size * 0.7}" height="${size * 0.7}" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
          <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"></path>
        </svg>
        <span style="font-size:11px; margin-top:4px; font-weight:bold;">${text}</span>
      </div>
    `;
  }

  /**
   * Start Live Webcam Scanning
   */
  async startScanner(elementId, onSuccess, onError) {
    if (typeof Html5Qrcode === 'undefined') {
      throw new Error('Html5Qrcode library not loaded.');
    }

    if (this.isScanning) {
      await this.stopScanner();
    }

    try {
      this.html5QrCode = new Html5Qrcode(elementId);
      const config = {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0
      };

      await this.html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText, decodedResult) => {
          this.playScanBeep();
          if (onSuccess) onSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
          // Frame errors during scan are normal
          if (onError) onError(errorMessage);
        }
      );
      this.isScanning = true;
    } catch (err) {
      this.isScanning = false;
      throw err;
    }
  }

  /**
   * Stop Webcam Scanning
   */
  async stopScanner() {
    if (this.html5QrCode && this.isScanning) {
      try {
        await this.html5QrCode.stop();
        this.html5QrCode.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
    }
    this.isScanning = false;
  }

  /**
   * Scan from uploaded image file
   */
  async scanFile(file) {
    if (typeof Html5Qrcode === 'undefined') throw new Error('Scanner library unavailable');
    const scanner = new Html5Qrcode('qr-temp-scanner-holder');
    try {
      const result = await scanner.scanFile(file, true);
      this.playScanBeep();
      return result;
    } finally {
      scanner.clear();
    }
  }

  /**
   * Generate P-Touch Brother Label Sheet Preview HTML
   */
  generatePTouchStickerHTML(equipment) {
    const isIssued = equipment.status === 'Issued' || equipment.status === 'Overdue';
    const qrData = JSON.stringify({
      id: equipment.id,
      name: equipment.name,
      cat: equipment.category,
      serial: equipment.serial,
      status: equipment.status
    });

    return `
      <div class="ptouch-label" id="label-${equipment.id}">
        <div class="ptouch-header">
          <span class="ptouch-brand">CAMPUSSHARE • ASSET TAG</span>
          <span class="ptouch-dept">TECH LAB INVENTORY</span>
        </div>
        <div class="ptouch-body">
          <div class="ptouch-qr" id="ptouch-qr-${equipment.id}"></div>
          <div class="ptouch-info">
            <div class="ptouch-id">${equipment.id}</div>
            <div class="ptouch-name">${equipment.name}</div>
            <div class="ptouch-meta">
              <span><strong>Cat:</strong> ${equipment.category}</span>
              <span><strong>SN:</strong> ${equipment.serial}</span>
            </div>
            <div class="ptouch-loc">📍 ${equipment.location}</div>
          </div>
        </div>
        <div class="ptouch-barcode-stripe">
          <div class="barcode-lines"></div>
          <span class="barcode-text">*${equipment.id}*</span>
        </div>
      </div>
    `;
  }
}

window.qrEngine = new QREngineService();
