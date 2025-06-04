#!/usr/bin/env node

/**
 * Productivity Hub - Setup Script
 * Automatiza a configuração inicial do projeto
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

console.log('🚀 Configurando Productivity Hub...\n');

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

const step = (step, message) => {
  log(`[${step}/7] ${message}`, 'cyan');
};

try {
  // Passo 1: Verificar Node.js
  step(1, 'Verificando versão do Node.js...');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    log('❌ Node.js 18+ é necessário. Versão atual: ' + nodeVersion, 'red');
    log('📥 Baixe em: https://nodejs.org/', 'yellow');
    process.exit(1);
  }
  log(`✅ Node.js ${nodeVersion} OK`, 'green');

  // Passo 2: Verificar se é um novo projeto
  step(2, 'Verificando estrutura do projeto...');
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ package.json não encontrado. Execute na raiz do projeto.', 'red');
    process.exit(1);
  }
  log('✅ Estrutura do projeto OK', 'green');

  // Passo 3: Instalar dependências
  step(3, 'Instalando dependências...');
  log('📦 Executando npm install...', 'yellow');
  execSync('npm install', { 
    cwd: rootDir, 
    stdio: 'inherit' 
  });
  log('✅ Dependências instaladas', 'green');

  // Passo 4: Configurar arquivo .env
  step(4, 'Configurando variáveis de ambiente...');
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log('✅ Arquivo .env criado a partir do .env.example', 'green');
      log('⚠️  Configure suas API keys no arquivo .env', 'yellow');
    } else {
      log('❌ .env.example não encontrado', 'red');
    }
  } else {
    log('✅ Arquivo .env já existe', 'green');
  }

  // Passo 5: Verificar Git
  step(5, 'Configurando Git...');
  try {
    execSync('git --version', { stdio: 'ignore' });
    
    if (!fs.existsSync(path.join(rootDir, '.git'))) {
      log('📝 Inicializando repositório Git...', 'yellow');
      execSync('git init', { cwd: rootDir, stdio: 'ignore' });
      execSync('git add .', { cwd: rootDir, stdio: 'ignore' });
      execSync('git commit -m "Initial commit"', { cwd: rootDir, stdio: 'ignore' });
    }
    log('✅ Git configurado', 'green');
  } catch (error) {
    log('⚠️  Git não encontrado, pulando configuração', 'yellow');
  }

  // Passo 6: Verificar build
  step(6, 'Testando build do projeto...');
  try {
    log('🔨 Executando build de teste...', 'yellow');
    execSync('npm run build', { 
      cwd: rootDir, 
      stdio: 'pipe' 
    });
    log('✅ Build funcionando corretamente', 'green');
  } catch (error) {
    log('❌ Erro no build:', 'red');
    console.error(error.stdout?.toString() || error.message);
    log('⚠️  Verifique as dependências e tente novamente', 'yellow');
  }

  // Passo 7: Instruções finais
  step(7, 'Finalizando configuração...');
  
  console.log('\n' + '='.repeat(60));
  log('🎉 PRODUCTIVITY HUB CONFIGURADO COM SUCESSO!', 'green');
  console.log('='.repeat(60));
  
  console.log('\n📋 PRÓXIMOS PASSOS:\n');
  
  log('1. Configure suas API keys:', 'cyan');
  log('   • Edite o arquivo .env', 'yellow');
  log('   • Adicione sua OpenAI API key (obrigatório)', 'yellow');
  
  log('\n2. Inicie o servidor de desenvolvimento:', 'cyan');
  log('   npm run dev', 'green');
  
  log('\n3. Acesse o aplicativo:', 'cyan');
  log('   http://localhost:3000', 'green');
  
  log('\n4. Configure as integrações:', 'cyan');
  log('   • Clique no ícone de chave no header', 'yellow');
  log('   • Siga as instruções para OpenAI', 'yellow');
  
  console.log('\n📖 Documentação completa: README.md');
  console.log('🐛 Problemas? Verifique o troubleshooting no README');
  
  log('\n🚀 Pronto para ser produtivo!', 'magenta');

} catch (error) {
  log('\n❌ ERRO DURANTE A CONFIGURAÇÃO:', 'red');
  console.error(error.message);
  
  log('\n🔧 SOLUÇÕES POSSÍVEIS:', 'yellow');
  log('• Verifique sua conexão com a internet', 'yellow');
  log('• Execute: rm -rf node_modules && npm install', 'yellow');
  log('• Verifique se tem permissões de escrita na pasta', 'yellow');
  log('• Consulte o README.md para mais ajuda', 'yellow');
  
  process.exit(1);
}