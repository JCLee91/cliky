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
      
      // 흰색 배경 그리기
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
      
      // 로고 이미지 로드
      const logoPath = path.join(__dirname, '../public/image/logo_symbol.png');
      const logo = await loadImage(logoPath);
      
      // 로고를 캔버스에 그리기 (중앙 정렬)
      const aspectRatio = logo.width / logo.height;
      let drawWidth = size * 0.8; // 80% 크기로 그리기
      let drawHeight = drawWidth / aspectRatio;
      
      if (drawHeight > size * 0.8) {
        drawHeight = size * 0.8;
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
    
    mainCtx.fillStyle = '#FFFFFF';
    mainCtx.fillRect(0, 0, 32, 32);
    
    const logoPath = path.join(__dirname, '../public/image/logo_symbol.png');
    const logo = await loadImage(logoPath);
    
    const size = 32;
    const drawSize = size * 0.8;
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