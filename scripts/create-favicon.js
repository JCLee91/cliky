const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createFaviconWithWhiteBackground() {
  try {
    // Canvas 크기 설정 (일반적인 파비콘 크기들)
    const sizes = [16, 32, 48, 64, 128, 256];
    
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // 둥근 모서리 사각형 그리기 함수
      function roundRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      }
      
      // 둥근 모서리 반경 계산 (크기에 비례)
      const borderRadius = size * 0.2; // 20% 반경
      
      // 둥근 사각형 클리핑 마스크 생성
      roundRect(0, 0, size, size, borderRadius);
      ctx.clip();
      
      // 흰색 배경 채우기
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
      
      // 로고 이미지 로드
      const logoPath = path.join(__dirname, '../public/image/logo_symbol_full.png');
      const logo = await loadImage(logoPath);
      
      // 로고를 캔버스에 그리기 (중앙 정렬)
      const aspectRatio = logo.width / logo.height;
      let drawWidth = size * 0.65; // 65% 크기로 그리기 (둥근 모서리 고려)
      let drawHeight = drawWidth / aspectRatio;
      
      if (drawHeight > size * 0.65) {
        drawHeight = size * 0.65;
        drawWidth = drawHeight * aspectRatio;
      }
      
      const x = (size - drawWidth) / 2;
      const y = (size - drawHeight) / 2;
      
      ctx.drawImage(logo, x, y, drawWidth, drawHeight);
      
      // PNG로 저장
      const buffer = canvas.toBuffer('image/png');
      const outputPath = path.join(__dirname, `../public/favicon-${size}.png`);
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`Created favicon-${size}.png`);
    }
    
    // 메인 favicon.png 생성 (32x32)
    const mainCanvas = createCanvas(32, 32);
    const mainCtx = mainCanvas.getContext('2d');
    
    // 둥근 모서리 사각형 그리기 함수
    function roundRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
    
    const size = 32;
    const borderRadius = size * 0.2;
    
    // 둥근 사각형 클리핑 마스크 생성
    roundRect(mainCtx, 0, 0, size, size, borderRadius);
    mainCtx.clip();
    
    // 흰색 배경 채우기
    mainCtx.fillStyle = '#FFFFFF';
    mainCtx.fillRect(0, 0, size, size);
    
    const logoPath = path.join(__dirname, '../public/image/logo_symbol_full.png');
    const logo = await loadImage(logoPath);
    
    const drawSize = size * 0.65;
    const offset = (size - drawSize) / 2;
    
    mainCtx.drawImage(logo, offset, offset, drawSize, drawSize);
    
    const mainBuffer = mainCanvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, '../public/favicon.png'), mainBuffer);
    
    console.log('Created main favicon.png');
    
  } catch (error) {
    console.error('Error creating favicon:', error);
  }
}

createFaviconWithWhiteBackground();