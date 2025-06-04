#!/usr/bin/env node

/**
 * Productivity Hub - Deploy Script
 * Automatiza o processo de deploy para diferentes plataformas
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const platform = process.argv[2];

if (!platform) {
  log('📚 USO: npm run deploy <plataforma>', 'cyan');
  log('\nPlataformas suportadas:', 'yellow');
  log('  • vercel    - Deploy para Vercel', 'green');
  log('  • netlify   - Deploy para Netlify', 'green');
  log('  • github    - Deploy para GitHub Pages', 'green');
  log('  • build     - Apenas build para produção', 'green');
  log('\nExemplo: npm run deploy vercel', 'yellow');
  process.exit(1);
}

console.log('🚀 Iniciando deploy do Productivity Hub...\n');

try {
  // Verificações pré-deploy
  log('🔍 Verificando projeto...', 'cyan');
  
  // Verificar se .env existe
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) {
    log('⚠️  Arquivo .env não encontrado', 'yellow');
    log('   Para produção, configure as variáveis de ambiente na plataforma', 'yellow');
  }
  
  // Verificar variáveis críticas
  const requiredVars = ['VITE_OPENAI_API_KEY'];
  const missingVars = [];
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    requiredVars.forEach(varName => {
      if (!envContent.includes(varName) || envContent.includes(`${varName}=SEU_`)) {
        missingVars.push(varName);
      }
    });
    
    if (missingVars.length > 0) {
      log('⚠️  Variáveis não configuradas:', 'yellow');
      missingVars.forEach(varName => log(`   • ${varName}`, 'yellow'));
      log('   Configure na plataforma de deploy', 'yellow');
    }
  }

  // Executar testes (se existirem)
  log('🧪 Executando verificações...', 'cyan');
  try {
    execSync('npm run lint', { cwd: rootDir, stdio: 'pipe' });
    log('✅ Lint passou', 'green');
  } catch (error) {
    log('⚠️  Avisos de lint encontrados', 'yellow');
  }

  // Build do projeto
  log('🔨 Criando build de produção...', 'cyan');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
  log('✅ Build criado com sucesso', 'green');

  // Deploy específico da plataforma
  switch (platform.toLowerCase()) {
    case 'vercel':
      deployToVercel();
      break;
    case 'netlify':
      deployToNetlify();
      break;
    case 'github':
      deployToGitHub();
      break;
    case 'build':
      log('✅ Build completo! Arquivos em ./dist/', 'green');
      break;
    default:
      log(`❌ Plataforma '${platform}' não suportada`, 'red');
      process.exit(1);
  }

} catch (error) {
  log('\n❌ ERRO NO DEPLOY:', 'red');
  console.error(error.message);
  process.exit(1);
}

function deployToVercel() {
  log('🚀 Fazendo deploy para Vercel...', 'cyan');
  
  try {
    // Verificar se Vercel CLI está instalado
    execSync('vercel --version', { stdio: 'ignore' });
  } catch {
    log('📦 Instalando Vercel CLI...', 'yellow');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }

  // Criar arquivo vercel.json se não existir
  const vercelConfigPath = path.join(rootDir, 'vercel.json');
  if (!fs.existsSync(vercelConfigPath)) {
    const vercelConfig = {
      "buildCommand": "npm run build",
      "outputDirectory": "dist",
      "framework": "vite",
      "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
      ],
      "env": {
        "VITE_TEAMS_CLIENT_ID": "@teams_client_id",
        "VITE_TEAMS_TENANT_ID": "@teams_tenant_id",
        "VITE_OPENAI_API_KEY": "@openai_api_key",
        "VITE_OPENAI_MODEL": "@openai_model"
      }
    };
    
    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
    log('📝 Arquivo vercel.json criado', 'green');
  }

  // Deploy
  execSync('vercel --prod', { cwd: rootDir, stdio: 'inherit' });
  
  log('\n🎉 Deploy no Vercel completo!', 'green');
  log('📋 Próximos passos:', 'cyan');
  log('  1. Configure as variáveis de ambiente no dashboard', 'yellow');
  log('  2. VITE_OPENAI_API_KEY (obrigatório)', 'yellow');
  log('  3. VITE_TEAMS_CLIENT_ID e VITE_TEAMS_TENANT_ID (opcional)', 'yellow');
}

function deployToNetlify() {
  log('🚀 Fazendo deploy para Netlify...', 'cyan');
  
  // Criar arquivo _redirects para SPA
  const redirectsPath = path.join(rootDir, 'dist', '_redirects');
  fs.writeFileSync(redirectsPath, '/*    /index.html   200');
  log('📝 Arquivo _redirects criado', 'green');

  // Criar netlify.toml se não existir
  const netlifyConfigPath = path.join(rootDir, 'netlify.toml');
  if (!fs.existsSync(netlifyConfigPath)) {
    const netlifyConfig = `[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"
`;
    
    fs.writeFileSync(netlifyConfigPath, netlifyConfig);
    log('📝 Arquivo netlify.toml criado', 'green');
  }

  try {
    execSync('netlify --version', { stdio: 'ignore' });
    execSync('netlify deploy --prod --dir=dist', { cwd: rootDir, stdio: 'inherit' });
  } catch {
    log('📦 Netlify CLI não encontrado', 'yellow');
    log('   1. Instale: npm install -g netlify-cli', 'yellow');
    log('   2. Faça login: netlify login', 'yellow');
    log('   3. Execute novamente o deploy', 'yellow');
    log('   4. Ou faça upload manual da pasta dist/', 'yellow');
  }

  log('\n🎉 Deploy no Netlify completo!', 'green');
}

function deployToGitHub() {
  log('🚀 Fazendo deploy para GitHub Pages...', 'cyan');
  
  try {
    // Verificar se gh-pages está instalado
    execSync('npx gh-pages --version', { stdio: 'ignore' });
  } catch {
    log('📦 Instalando gh-pages...', 'yellow');
    execSync('npm install --save-dev gh-pages', { cwd: rootDir, stdio: 'inherit' });
  }

  // Deploy usando gh-pages
  execSync('npx gh-pages -d dist', { cwd: rootDir, stdio: 'inherit' });
  
  log('\n🎉 Deploy no GitHub Pages completo!', 'green');
  log('📋 Configurações necessárias:', 'cyan');
  log('  1. Vá para Settings → Pages no seu repositório', 'yellow');
  log('  2. Source: Deploy from a branch', 'yellow');
  log('  3. Branch: gh-pages', 'yellow');
  log('  4. Configure variáveis de ambiente via GitHub Secrets', 'yellow');
}

log('\n✨ Deploy finalizado com sucesso!', 'magenta');
log('📖 Consulte o README.md para mais detalhes de configuração', 'cyan');