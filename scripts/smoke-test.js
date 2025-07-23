#!/usr/bin/env node

/**
 * SlimerPRD MVP 스모크 테스트 스크립트
 * 주요 기능들의 기본 동작을 검증합니다.
 */

// Simple color functions without chalk
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: {
    cyan: (text) => `\x1b[1m\x1b[36m${text}\x1b[0m`,
    green: (text) => `\x1b[1m\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[1m\x1b[31m${text}\x1b[0m`
  }
}
const chalk = colors
const { spawn } = require('child_process')

const tests = [
  {
    name: '프로덕션 빌드 검증',
    command: 'npm',
    args: ['run', 'build'],
    timeout: 60000,
    description: 'Next.js 프로덕션 빌드가 성공하는지 확인'
  },
  {
    name: '개발 서버 시작 검증',
    command: 'npm',
    args: ['run', 'dev'],
    timeout: 10000,
    description: '개발 서버가 정상적으로 시작되는지 확인',
    killAfterStart: true
  },
  {
    name: 'TypeScript 타입 검사',
    command: 'npx',
    args: ['tsc', '--noEmit'],
    timeout: 30000,
    description: 'TypeScript 타입 에러가 없는지 확인'
  },
  {
    name: 'ESLint 정적 분석',
    command: 'npx',
    args: ['eslint', 'src/', '--ext', '.ts,.tsx', '--max-warnings', '0'],
    timeout: 30000,
    description: 'ESLint 규칙을 통과하는지 확인'
  }
]

class SmokeTestRunner {
  constructor() {
    this.passed = 0
    this.failed = 0
    this.results = []
  }

  async runTest(test) {
    console.log(chalk.blue(`\n🧪 ${test.name}`))
    console.log(chalk.gray(`   ${test.description}`))
    
    return new Promise((resolve) => {
      const startTime = Date.now()
      const childProcess = spawn(test.command, test.args, {
        cwd: process.cwd(),
        stdio: ['inherit', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''

      childProcess.stdout.on('data', (data) => {
        stdout += data.toString()
        if (test.killAfterStart && stdout.includes('Ready in')) {
          childProcess.kill('SIGTERM')
        }
      })

      childProcess.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      const timer = setTimeout(() => {
        childProcess.kill('SIGTERM')
        resolve({
          success: false,
          error: 'Timeout',
          duration: Date.now() - startTime
        })
      }, test.timeout)

      childProcess.on('close', (code) => {
        clearTimeout(timer)
        const duration = Date.now() - startTime
        
        const success = test.killAfterStart ? 
          stdout.includes('Ready in') : 
          code === 0

        resolve({
          success,
          error: success ? null : (stderr || `Exit code: ${code}`),
          duration,
          stdout: stdout.slice(0, 500),
          stderr: stderr.slice(0, 500)
        })
      })
    })
  }

  async run() {
    console.log(chalk.bold.cyan('🚀 SlimerPRD MVP 스모크 테스트 시작\n'))
    
    for (const test of tests) {
      const result = await this.runTest(test)
      
      if (result.success) {
        console.log(chalk.green(`   ✅ 통과 (${result.duration}ms)`))
        this.passed++
      } else {
        console.log(chalk.red(`   ❌ 실패 (${result.duration}ms)`))
        console.log(chalk.red(`      오류: ${result.error}`))
        if (result.stderr) {
          console.log(chalk.gray(`      ${result.stderr.slice(0, 200)}...`))
        }
        this.failed++
      }
      
      this.results.push({
        name: test.name,
        ...result
      })
    }

    this.printSummary()
  }

  printSummary() {
    console.log(chalk.bold.cyan('\n📊 테스트 결과 요약'))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    console.log(chalk.green(`✅ 통과: ${this.passed}개`))
    console.log(chalk.red(`❌ 실패: ${this.failed}개`))
    console.log(chalk.blue(`📈 성공률: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%`))

    if (this.failed === 0) {
      console.log(chalk.bold.green('\n🎉 모든 스모크 테스트 통과! MVP 준비 완료'))
    } else {
      console.log(chalk.bold.red('\n⚠️  일부 테스트 실패. 수정 후 재실행 필요'))
    }

    // 상세 결과
    console.log(chalk.bold.cyan('\n📋 상세 결과'))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌'
      const duration = `${result.duration}ms`
      console.log(`${index + 1}. ${status} ${result.name} (${duration})`)
    })

    console.log('')
  }
}

// 필요 패키지 체크
function checkRequiredPackages() {
  // No external packages needed now
  return true
}

// 메인 실행
async function main() {
  if (!checkRequiredPackages()) {
    process.exit(1)
  }

  const runner = new SmokeTestRunner()
  await runner.run()
  
  process.exit(runner.failed > 0 ? 1 : 0)
}

if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red('스모크 테스트 실행 중 오류 발생:'), error)
    process.exit(1)
  })
}

module.exports = SmokeTestRunner