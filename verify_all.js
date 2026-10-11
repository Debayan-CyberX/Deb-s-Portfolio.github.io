const fs = require('fs');
const crypto = require('crypto');

const expectedFiles = {
  'src/shaders/landing-pages/LandingPages.tsx': '4d379461ad00eb4de7900df312878035383de7e1ed4e13283b8143a2eea9d30a',
  'src/shaders/landing-pages/pageTypography.ts': '809cc65797d531cd3b3ca5a56815d55d24b3ee8d293e4e4bad6fdfe6c83244cc',
  'src/shaders/landing-pages/pageRecipes.ts': 'c9d9849cc255bac2d1d938d088c50917f84916f1c516d2bbb27fcfd803523233',
  'src/shaders/landing-pages/LandingPageFrame.tsx': '61de2cc50888aac4ac5557420b07fa47ed3543bb57c1e0055fafdefa53dbaa78',
  'public/landing-pages/kage.html': 'c8e06b90397ac246baf0ab6f32f5f6b570acc6fe03c7009f711b579fb72d9f49',
  'public/landing-pages/secret-pathways-assets/fonts.css': '985f85a904a4096f92c06552b06f42a45973ac004af4780d68f18af65ddcc1b0',
  'public/landing-pages/secret-pathways-assets/three.min.js': '8a5f7249903b54d30f79f708699d2fed2d6a1d0741a4cd41377d1f01bb5a2271',
  'src/shaders/threeui.css': 'efe4447139f1358dd8e9be68edf6fa46cbefbd1de423a4d6c439ca61d2c8eccf',
  'public/landing-pages/secret-pathways-assets/generated/kage-sanmon-preview.webp': '23937f8c8350c55730c3bd17066a250548b2d29aad0e6ffb96218c1354b6db43',
  'public/landing-pages/secret-pathways-assets/generated/kage-approach.webp': '39ff338936097e1bde0c4eadcf09805b9890862703186e67314942de7e0bc36c',
  'public/landing-pages/secret-pathways-assets/generated/kage-lantern-court.webp': 'c0a6ff7da1cd6909d66e2f3f690b0d524a693e01d2222ab846d0074a90f47471',
  'public/landing-pages/secret-pathways-assets/generated/kage-moonwater.webp': 'b8c8060c51c87a103bae619b3a4cc8b8b80632649d83f1f2c2299051e7f9b400',
  'public/landing-pages/secret-pathways-assets/foreground/png/temple-wall.webp': '41c00f017e4ecf2147ee468d74da955bb4e2dad773f75a575022842eaf7609ce',
  'public/landing-pages/secret-pathways-assets/foreground/png/pine-tree.webp': '79b233716d067bbc64c1507f79e4a30ba5f445995158c78562cc5b81f607ede7',
  'public/landing-pages/secret-pathways-assets/foreground/png/tall-grass.webp': '8db0b5fbd160a7225391a6283a99681e346e205f24191031657285ef85ef12d2',
  'public/landing-pages/secret-pathways-assets/foreground/png/sakura-branch.webp': '48564194d40496090dbf3bba2a68785cf91fafb655dc8d43ac16f6678aff196d',
  'public/landing-pages/secret-pathways-assets/foreground/png/maple-leaves.webp': '35a90fec62c1a6bbfbbe73cd5d7b1acb889e80546d404182ef9a45fe417b531f',
  'public/landing-pages/secret-pathways-assets/foreground/png/stone-lantern.webp': 'd5f3c881bc9d92b72eaaff2b709614d66e21a19e14025d2b9b16a15ab52df3bc',
  'public/landing-pages/secret-pathways-assets/foreground/png/garden-bush.webp': '707e2516ebc0108041fe0ddc26d8bff0a69dc9700641f837765018b64e9ff15e',
  'public/landing-pages/secret-pathways-assets/foreground/png/basalt-stones.webp': '150f1c87e181d651c318168c271bb65c9c8abac6dea6f2421fdd081c5b740471',
  'public/landing-pages/secret-pathways-assets/foreground/png/hill.webp': 'ffba816244bcba98e4e33c6ee56165edfe4048db4af122ef3f5822180a85edbc',
  'public/landing-pages/secret-pathways-assets/foreground/png/shrine-ruins.webp': '77006e58f2066e6fa9bfc504df396db49b1c7977858fa52d34dd2dad5feced77',
};

let allValid = true;
let count = 0;
for (const [file, expectedHash] of Object.entries(expectedFiles)) {
  count++;
  if (!fs.existsSync(file)) {
    console.error('MISSING:', file);
    allValid = false;
    continue;
  }
  const content = fs.readFileSync(file);
  const actualHash = crypto.createHash('sha256').update(content).digest('hex');
  if (actualHash !== expectedHash) {
    console.error('MISMATCH:', file, 'actual:', actualHash, 'expected:', expectedHash);
    allValid = false;
  } else {
    console.log('[' + count + '/22] OK: ' + file + ' (' + content.length + ' bytes)');
  }
}
console.log('FINAL VERIFICATION: ' + (allValid ? 'ALL 22 REQUIRED FILES MATCH HASH 100%' : 'FAILED'));
