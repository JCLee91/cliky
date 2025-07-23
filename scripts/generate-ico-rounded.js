const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateICO() {
  try {
    const sizes = [16, 32, 48];
    const buffers = [];
    
    // Generate PNG images for each size
    for (const size of sizes) {
      // Create rounded rectangle SVG mask
      const mask = Buffer.from(
        `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.2}" fill="white"/>
        </svg>`
      );
      
      // Create white background with rounded corners
      const background = await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .composite([{
        input: mask,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
      
      // Resize logo
      const logoSize = Math.floor(size * 0.65);
      const padding = Math.floor((size - logoSize) / 2);
      
      const logo = await sharp(path.join(__dirname, '../public/image/logo_symbol_full.png'))
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer();
      
      // Composite logo on background
      const buffer = await sharp(background)
        .composite([{
          input: logo,
          top: padding,
          left: padding
        }])
        .png()
        .toBuffer();
      
      buffers.push({ size, buffer });
    }
    
    // Create ICO header
    const iconDirEntries = [];
    let offset = 6 + (16 * buffers.length); // ICONDIR header + ICONDIRENTRY headers
    
    for (const { size, buffer } of buffers) {
      iconDirEntries.push({
        width: size,
        height: size,
        colorCount: 0,
        reserved: 0,
        planes: 1,
        bitCount: 32,
        bytesInRes: buffer.length,
        imageOffset: offset
      });
      offset += buffer.length;
    }
    
    // Build ICO file
    const ico = Buffer.alloc(offset);
    let pos = 0;
    
    // ICONDIR header
    ico.writeUInt16LE(0, pos); pos += 2; // Reserved
    ico.writeUInt16LE(1, pos); pos += 2; // Type (1 for icon)
    ico.writeUInt16LE(buffers.length, pos); pos += 2; // Number of images
    
    // ICONDIRENTRY headers
    for (const entry of iconDirEntries) {
      ico.writeUInt8(entry.width === 256 ? 0 : entry.width, pos); pos += 1;
      ico.writeUInt8(entry.height === 256 ? 0 : entry.height, pos); pos += 1;
      ico.writeUInt8(entry.colorCount, pos); pos += 1;
      ico.writeUInt8(entry.reserved, pos); pos += 1;
      ico.writeUInt16LE(entry.planes, pos); pos += 2;
      ico.writeUInt16LE(entry.bitCount, pos); pos += 2;
      ico.writeUInt32LE(entry.bytesInRes, pos); pos += 4;
      ico.writeUInt32LE(entry.imageOffset, pos); pos += 4;
    }
    
    // Image data
    for (const { buffer } of buffers) {
      buffer.copy(ico, pos);
      pos += buffer.length;
    }
    
    // Write ICO file
    fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), ico);
    console.log('Generated favicon.ico with rounded corners successfully');
    
  } catch (error) {
    console.error('Error generating ICO:', error);
  }
}

generateICO();