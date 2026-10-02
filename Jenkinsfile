pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.50.0-jammy'
            args '-u root:root'
        }
    }
    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm ci || npm install'
                sh 'npx playwright install chromium'
            }
        }
        stage('Run Playwright Tests') {
            steps {
                sh 'npx playwright test'
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**, test-results/**', allowEmptyArchive: true
        }
        failure {
            echo "Playwright E2E Suite FAILED! Please inspect archived report."
        }
        success {
            echo "All Playwright E2E Tests PASSED successfully!"
        }
    }
}
