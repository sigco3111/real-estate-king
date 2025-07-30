// SVG 파비콘을 PNG 형식으로 변환하는 스크립트
// 실제 프로젝트에서는 sharp 또는 svgexport 같은 라이브러리를 사용하는 것이 좋습니다.
// 이 스크립트는 실제로 변환 작업을 수행하지는 않지만, 필요한 파일 경로를 안내합니다.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');
const svgPath = path.join(publicDir, 'favicon.svg');

console.log('파비콘 생성 스크립트 시작...');

if (!fs.existsSync(svgPath)) {
  console.error(`파비콘 SVG 파일을 찾을 수 없습니다: ${svgPath}`);
  process.exit(1);
}

console.log('SVG 파일 확인 완료:', svgPath);

// 실제 변환 작업 대신 안내 메시지 출력
console.log(`
파비콘 파일이 필요한 위치:
- ${path.join(publicDir, 'favicon.svg')} (이미 생성됨)
- ${path.join(publicDir, 'favicon.ico')} 
- ${path.join(publicDir, 'apple-touch-icon.png')} (180x180)
- ${path.join(publicDir, 'android-chrome-192x192.png')} (192x192)
- ${path.join(publicDir, 'android-chrome-512x512.png')} (512x512)
`);

console.log('실제 프로젝트에서는 아래 명령어로 SVG를 변환하세요:');
console.log('npm install -g svgexport');
console.log(`svgexport ${svgPath} ${path.join(publicDir, 'android-chrome-192x192.png')} 192:192`);
console.log(`svgexport ${svgPath} ${path.join(publicDir, 'android-chrome-512x512.png')} 512:512`);
console.log(`svgexport ${svgPath} ${path.join(publicDir, 'apple-touch-icon.png')} 180:180`);

console.log('\n파비콘 스크립트 완료!'); 